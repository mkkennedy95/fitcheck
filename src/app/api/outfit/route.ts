import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { ClothingItem, RecommendationResponse, StylistId } from "@/lib/types";
import { STYLISTS } from "@/lib/stylists";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    // Create server-side Supabase client with cookies
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Check generation limits
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("generation_count, generation_reset_at")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("[/api/outfit] Error fetching profile:", profileError);
      return NextResponse.json(
        { error: "Failed to check generation limits." },
        { status: 500 }
      );
    }

    let currentCount = profile.generation_count || 0;
    const resetAt = profile.generation_reset_at ? new Date(profile.generation_reset_at) : null;
    const now = new Date();

    // Reset count if reset date is in the past
    if (!resetAt || resetAt < now) {
      const newResetAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          generation_count: 0,
          generation_reset_at: newResetAt.toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("[/api/outfit] Error resetting generation count:", updateError);
      } else {
        currentCount = 0;
      }
    }

    // Check if user has reached the limit
    if (currentCount >= 10) {
      return NextResponse.json(
        {
          error: "Generation limit reached",
          generationCount: currentCount,
          generationLimit: 10,
        },
        { status: 429 }
      );
    }

    const { items, activity, weather, vibeNotes, stylistId } = (await req.json()) as {
      items: ClothingItem[];
      activity: string;
      weather: {
        temperature: number;
        feels_like: number;
        conditions: string;
        humidity: number;
        city: string;
      } | null;
      vibeNotes: string;
      stylistId?: string;
    };

    if (!items || items.length < 2) {
      return NextResponse.json(
        { error: "Need at least 2 wardrobe items to generate outfits." },
        { status: 400 }
      );
    }

    // Format wardrobe for the prompt
    const wardrobeText = items
      .map(
        (item) =>
          `- ID: ${item.id} | Name: "${item.name}" | Category: ${item.category} | Color: ${item.color} | Formality: ${item.formality} | Seasons: ${item.seasons.join(", ")}`
      )
      .join("\n");

    const weatherText = weather
      ? `Current weather in ${weather.city}: ${weather.temperature}°F (feels like ${weather.feels_like}°F), ${weather.conditions}, ${weather.humidity}% humidity.`
      : "No weather data available.";

    const activityLabel: Record<string, string> = {
      work: "Work / Office",
      date_night: "Date Night",
      casual_hangout: "Casual Hangout",
      gym: "Gym / Workout",
      outdoor_active: "Outdoor / Active",
      special_event: "Special Event",
    };

    // Lookup the selected stylist or default to "editor"
    const selectedStylistId = (stylistId as StylistId) || "editor";
    const stylist = STYLISTS.find(s => s.id === selectedStylistId) ?? STYLISTS.find(s => s.id === "editor")!;

    const prompt = `You are an expert men's stylist with deep knowledge of fashion principles, color theory, and occasion-appropriate dressing. The user needs outfit recommendations for: ${activityLabel[activity] ?? activity}.

${weatherText}

${vibeNotes ? `User's vibe / style notes: "${vibeNotes}"` : ""}

${stylist.prompt}

STYLING PRINCIPLES TO APPLY:
- Color coordination (STRICT RULES):
  * NEVER pair same-color tops and bottoms (e.g., no black top with black bottom, no navy top with navy bottom)
  * NEVER pair navy with black — these clash despite both being dark
  * Each outfit should have ONE anchor neutral (black, white, gray, navy, beige, tan) and maximum ONE accent color
  * Good pairings: navy/brown, black/gray, olive/tan, charcoal/burgundy, white/any color
  * Avoid clashing: black/brown shoes with navy suits, brown belt with black shoes, etc.
- Formality matching: All items in an outfit should match formality level. Don't mix formal dress shoes with gym shorts, or business blazers with athletic wear.
- Occasion appropriateness:
  * Work/Office: Business casual to formal. Button-downs, chinos/dress pants, leather shoes. Blazers add polish.
  * Date Night: Smart casual to business casual. Well-fitted, intentional pieces. Avoid gym wear.
  * Casual Hangout: Casual to smart casual. Comfortable but put-together. T-shirts, jeans, sneakers work.
  * Gym: Athletic/gym formality only. Performance fabrics, athletic shoes, moisture-wicking.
  * Outdoor/Active: Casual, weather-appropriate. Layers if cold, breathable if warm.
  * Special Event: Business casual to formal. Dress up unless told otherwise.
- Weather considerations:
  * Cold (<50°F): Layer with outerwear (jackets, coats). Winter fabrics (wool, flannel).
  * Mild (50-70°F): Light layers optional. Spring/fall fabrics.
  * Warm (>70°F): Breathable, light fabrics. Short sleeves, lighter colors.
  * Rain: Suggest outerwear if available.
- Seasonal fabrics: Winter = wool, flannel, heavier knits. Summer = linen, cotton, lightweight. Spring/Fall = transitional.
- Variety: Generate DIFFERENT outfit combinations. Don't repeat the same items across all recommendations. Explore the full wardrobe.

The user's wardrobe (use ONLY these exact item IDs):
${wardrobeText}

Generate 2-3 VARIED outfit recommendations. Requirements:
1. Each outfit must be DIFFERENT — use different combinations of items, don't just repeat the same pieces
2. Match formality levels within each outfit (all casual, all formal, etc.)
3. Ensure color coordination (complementary or neutral palette)
4. Consider the activity — gym outfits need gym formality items, work needs business casual+
5. Factor in weather — layer appropriately for temperature
6. Use ONLY item IDs from the wardrobe above — never invent IDs
7. Include at least a top and bottom (or pieces like suits); add shoes/outerwear when appropriate
8. Confidence: "high" if formality/colors/season perfectly match activity+weather. "medium" if mostly appropriate but minor compromises. "low" if significant mismatches but best available.

Respond with valid JSON only — no markdown fences, no explanation outside JSON. Use this exact schema:
{
  "outfits": [
    {
      "name": "Short outfit name (3-5 words)",
      "items": ["item-id-1", "item-id-2", "item-id-3"],
      "why": "1-2 sentences explaining why this outfit works (mention color coordination, formality match, or weather appropriateness)",
      "confidence": "high" | "medium" | "low"
    }
  ],
  "wardrobe_tip": "One specific, actionable tip about gaps in their wardrobe or versatile pieces they should add (optional, can be null)"
}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    // Extract the text content from Claude's response
    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    console.log('RAW RESPONSE:', content.text);
    const cleaned = content.text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
    const parsed = JSON.parse(cleaned) as RecommendationResponse;

    // Validate that all returned item IDs actually exist in the wardrobe
    const validIds = new Set(items.map((i) => i.id));
    const sanitized: RecommendationResponse = {
      outfits: parsed.outfits
        .map((outfit) => ({
          ...outfit,
          items: outfit.items.filter((id) => validIds.has(id)),
        }))
        .filter((outfit) => outfit.items.length >= 2),
      wardrobe_tip: parsed.wardrobe_tip ?? undefined,
    };

    // Increment generation count
    const { error: incrementError } = await supabase
      .from("profiles")
      .update({ generation_count: currentCount + 1 })
      .eq("id", user.id);

    if (incrementError) {
      console.error("[/api/outfit] Error incrementing generation count:", incrementError);
    }

    return NextResponse.json({
      ...sanitized,
      generationCount: currentCount + 1,
      generationLimit: 10,
    });
  } catch (err) {
    console.error("[/api/outfit] Error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
