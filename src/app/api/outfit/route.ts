import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import type { ClothingItem, RecommendationResponse } from "@/lib/types";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { items, activity, weather, vibeNotes } = (await req.json()) as {
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

    const prompt = `You are a personal stylist AI. The user wants outfit recommendations for: ${activityLabel[activity] ?? activity}.

${weatherText}

${vibeNotes ? `User's vibe / style notes: "${vibeNotes}"` : ""}

The user's wardrobe (use ONLY these exact item IDs in your recommendations):
${wardrobeText}

Generate 2-3 complete outfit recommendations. Each outfit must:
1. Include items that work together stylistically and are appropriate for the activity and weather
2. Use ONLY item IDs from the wardrobe list above — never invent IDs
3. Include at least a top and bottom (or a one-piece equivalent); shoes are optional but preferred when available

Respond with valid JSON only — no markdown fences, no explanation outside the JSON. Use this exact schema:
{
  "outfits": [
    {
      "name": "Short outfit name (3-5 words)",
      "items": ["item-id-1", "item-id-2"],
      "why": "1-2 sentences explaining why this outfit works for the occasion and weather",
      "confidence": "high" | "medium" | "low"
    }
  ],
  "wardrobe_tip": "One actionable tip about their wardrobe (optional, can be null)"
}`;

    const message = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    // Extract the text content from Claude's response
    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    // Parse Claude's JSON response
    const parsed = JSON.parse(content.text) as RecommendationResponse;

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

    return NextResponse.json(sanitized);
  } catch (err) {
    console.error("[/api/outfit] Error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
