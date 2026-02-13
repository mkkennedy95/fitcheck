import type { ClothingItem, OutfitRecommendation } from "@/lib/types";

// Confidence badge colors
const confidenceColors: Record<string, string> = {
  high: "bg-success/10 text-success",
  medium: "bg-warning/10 text-warning",
  low: "bg-error/10 text-error",
};

interface OutfitCardProps {
  outfit: OutfitRecommendation;
  // Map of item IDs to their full data so we can display images/names
  itemsMap: Record<string, ClothingItem>;
}

export default function OutfitCard({ outfit, itemsMap }: OutfitCardProps) {
  // Look up the actual clothing items for this outfit
  const outfitItems = outfit.items
    .map((id) => itemsMap[id])
    .filter(Boolean);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Outfit header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h3 className="font-semibold text-navy">{outfit.name}</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            confidenceColors[outfit.confidence]
          }`}
        >
          {outfit.confidence} match
        </span>
      </div>

      {/* Outfit items displayed as a row of thumbnails */}
      <div className="flex gap-2 overflow-x-auto p-4">
        {outfitItems.map((item) => (
          <div key={item.id} className="flex-shrink-0">
            <div className="h-20 w-20 overflow-hidden rounded-lg bg-gray-100">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                  {item.name}
                </div>
              )}
            </div>
            <p className="mt-1 text-center text-xs text-gray-dark">
              {item.name}
            </p>
          </div>
        ))}
      </div>

      {/* Why this outfit works */}
      <div className="border-t border-gray-100 px-4 py-3">
        <p className="text-sm text-gray-dark">{outfit.why}</p>
      </div>

      {/* Save button */}
      <div className="px-4 pb-3">
        <button className="w-full rounded-lg border border-accent px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-white">
          Save This Outfit
        </button>
      </div>
    </div>
  );
}
