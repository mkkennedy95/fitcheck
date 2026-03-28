"use client";

import { useState } from "react";
import type { ClothingItem, OutfitRecommendation } from "@/lib/types";

const confidenceColors: Record<string, string> = {
  high: "bg-success/10 text-success",
  medium: "bg-warning/10 text-warning",
  low: "bg-error/10 text-error",
};

interface OutfitCardProps {
  outfit: OutfitRecommendation;
  itemsMap: Record<string, ClothingItem>;
  onSave?: (outfitItems: ClothingItem[]) => Promise<void>;
}

export default function OutfitCard({ outfit, itemsMap, onSave }: OutfitCardProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const outfitItems = outfit.items
    .map((id) => itemsMap[id])
    .filter(Boolean);

  const handleSave = async () => {
    if (!onSave || saving || saved) return;
    setSaving(true);
    try {
      await onSave(outfitItems);
      setSaved(true);
    } catch {
      // error: re-enable button
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h3 className="font-semibold text-navy">{outfit.name}</h3>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${confidenceColors[outfit.confidence]}`}>
          {outfit.confidence} match
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto p-4">
        {outfitItems.map((item) => (
          <div key={item.id} className="flex-shrink-0">
            <div className="h-20 w-20 overflow-hidden rounded-lg bg-gray-100">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                  {item.name}
                </div>
              )}
            </div>
            <p className="mt-1 text-center text-xs text-gray-dark">{item.name}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100 px-4 py-3">
        <p className="text-sm text-gray-dark">{outfit.why}</p>
      </div>

      <div className="px-4 pb-3">
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            saved
              ? "bg-green-600 text-white border border-green-600 cursor-default"
              : saving
              ? "border border-accent text-accent opacity-50 cursor-wait"
              : "border border-accent text-accent hover:bg-accent hover:text-white"
          }`}
        >
          {saved ? "Saved ✓" : saving ? "Saving..." : "Save This Outfit"}
        </button>
      </div>
    </div>
  );
}
