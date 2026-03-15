"use client";

// Batch Wardrobe Upload — paste a text description of multiple items
// and let Claude AI parse them into structured entries

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import type { Category, Formality, Season } from "@/lib/types";

interface ParsedItem {
  name: string;
  category: Category;
  color: string;
  formality: Formality;
  seasons: Season[];
}

export default function BatchUploadPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [text, setText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);

  // Call the API to parse text into structured items
  const handleParse = async () => {
    if (!text.trim()) return;

    setParsing(true);
    setError(null);

    try {
      const res = await fetch("/api/parse-wardrobe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const { error: apiError } = (await res.json()) as { error: string };
        throw new Error(apiError ?? `Server error ${res.status}`);
      }

      const data = (await res.json()) as { items: ParsedItem[] };
      setParsedItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse items.");
    } finally {
      setParsing(false);
    }
  };

  // Save all parsed items to Supabase
  const handleSaveAll = async () => {
    if (parsedItems.length === 0) return;

    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();
      const itemsToInsert = parsedItems.map((item) => ({
        user_id: user!.id,
        name: item.name,
        category: item.category,
        color: item.color,
        formality: item.formality,
        seasons: item.seasons,
        fit_rating: 3, // default rating
        image_url: null,
        cloudinary_public_id: null,
      }));

      const { error: dbError } = await supabase
        .from("clothing_items")
        .insert(itemsToInsert);

      if (dbError) {
        throw new Error(dbError.message);
      }

      router.push("/wardrobe");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save items.");
      setSaving(false);
    }
  };

  // Remove an item from the parsed list
  const handleRemove = (index: number) => {
    setParsedItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Page header */}
        <div>
          <Link
            href="/wardrobe"
            className="text-sm text-accent hover:underline"
          >
            &larr; Back to Wardrobe
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-navy">
            Batch Upload Items
          </h1>
          <p className="mt-1 text-sm text-gray-dark">
            Paste a list of clothing items and let AI parse them into your
            wardrobe.
          </p>
        </div>

        {/* Input section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <label
            htmlFor="text"
            className="mb-2 block text-sm font-medium text-navy"
          >
            Describe Your Items
          </label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='e.g., "blue oxford dress shirt, black slim fit jeans, grey Nike running shoes, navy suit jacket, brown leather belt"'
            rows={6}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <p className="mt-2 text-xs text-gray-medium">
            Separate items with commas or line breaks. Be as descriptive as you
            like.
          </p>

          <button
            type="button"
            onClick={handleParse}
            disabled={!text.trim() || parsing}
            className="mt-4 w-full rounded-lg bg-accent px-4 py-3 font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {parsing ? "Parsing items..." : "Parse Items"}
          </button>

          {error && (
            <p className="mt-3 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
              {error}
            </p>
          )}
        </div>

        {/* Parsed items preview */}
        {parsedItems.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-navy">
                Parsed Items ({parsedItems.length})
              </h2>
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={saving}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save All to Wardrobe"}
              </button>
            </div>

            <div className="space-y-3">
              {parsedItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-navy">{item.name}</p>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-dark">
                      <span className="rounded bg-gray-100 px-2 py-0.5">
                        {item.category}
                      </span>
                      <span className="rounded bg-gray-100 px-2 py-0.5">
                        {item.color}
                      </span>
                      <span className="rounded bg-gray-100 px-2 py-0.5">
                        {item.formality.replace("_", " ")}
                      </span>
                      <span className="rounded bg-gray-100 px-2 py-0.5">
                        {item.seasons.join(", ")}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="ml-3 text-xs text-error hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
