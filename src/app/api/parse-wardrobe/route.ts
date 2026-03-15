import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import type { Category, Formality, Season } from "@/lib/types";

const client = new Anthropic();

interface ParsedItem {
  name: string;
  category: Category;
  color: string;
  formality: Formality;
  seasons: Season[];
}

export async function POST(req: NextRequest) {
  try {
    const { text } = (await req.json()) as { text: string };

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Please provide a text description of clothing items." },
        { status: 400 }
      );
    }

    const prompt = `You are a clothing data extraction specialist. Parse the following text description of clothing items into structured JSON data.

Text: "${text}"

Extract each distinct clothing item mentioned and return it as structured JSON. For each item, determine:

1. NAME: The item name (e.g., "Blue Oxford Dress Shirt", "Black Slim Fit Jeans")
2. CATEGORY: One of: "tops", "bottoms", "shoes", "outerwear", "accessories", "pieces"
   - tops: shirts, t-shirts, polos, sweaters, etc.
   - bottoms: pants, jeans, shorts, etc.
   - shoes: all footwear
   - outerwear: jackets, coats, blazers
   - accessories: ties, belts, watches, hats, etc.
   - pieces: suits, matching sets
3. COLOR: The primary color (Black, White, Navy, Gray, Blue, Red, Green, Brown, Beige, Khaki, Olive, Burgundy, Pink, Orange, Yellow, Purple, Indigo, Teal)
4. FORMALITY: One of: "casual", "smart_casual", "business_casual", "formal", "gym"
   - casual: t-shirts, jeans, sneakers, hoodies
   - smart_casual: polos, chinos, loafers, casual button-downs
   - business_casual: dress shirts, slacks, dress shoes (no tie)
   - formal: suits, dress shirts, ties, dress shoes
   - gym: athletic wear, running shoes, gym clothes
5. SEASONS: Array of applicable seasons from: "spring", "summer", "fall", "winter", "all-season"
   - Light fabrics (linen, light cotton) → summer
   - Heavy fabrics (wool, flannel) → winter, fall
   - Versatile basics → all-season
   - Seasonal items (shorts) → summer

Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "items": [
    {
      "name": "Item name",
      "category": "category",
      "color": "Color",
      "formality": "formality",
      "seasons": ["season1", "season2"]
    }
  ]
}`;

    const message = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response from Claude");
    }

    const parsed = JSON.parse(content.text) as { items: ParsedItem[] };

    // Validate and sanitize the response
    const validCategories = new Set<Category>([
      "tops",
      "bottoms",
      "shoes",
      "outerwear",
      "accessories",
      "pieces",
    ]);
    const validFormalities = new Set<Formality>([
      "casual",
      "smart_casual",
      "business_casual",
      "formal",
      "gym",
    ]);
    const validSeasons = new Set<Season>([
      "spring",
      "summer",
      "fall",
      "winter",
      "all-season",
    ]);

    const sanitized = parsed.items
      .filter(
        (item) =>
          item.name &&
          validCategories.has(item.category) &&
          validFormalities.has(item.formality) &&
          Array.isArray(item.seasons) &&
          item.seasons.every((s) => validSeasons.has(s))
      )
      .map((item) => ({
        ...item,
        name: item.name.trim(),
        color: item.color.trim(),
      }));

    return NextResponse.json({ items: sanitized });
  } catch (err) {
    console.error("[/api/parse-wardrobe] Error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
