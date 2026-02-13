import type { ClothingItem } from "@/lib/types";

// Maps category values to user-friendly display labels
const categoryLabels: Record<string, string> = {
  tops: "Top",
  bottoms: "Bottom",
  shoes: "Shoes",
  outerwear: "Outerwear",
  accessories: "Accessory",
};

// Maps category to a badge color
const categoryColors: Record<string, string> = {
  tops: "bg-blue-100 text-blue-800",
  bottoms: "bg-green-100 text-green-800",
  shoes: "bg-purple-100 text-purple-800",
  outerwear: "bg-orange-100 text-orange-800",
  accessories: "bg-pink-100 text-pink-800",
};

interface ClothingCardProps {
  item: ClothingItem;
}

export default function ClothingCard({ item }: ClothingCardProps) {
  return (
    <div className="group cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Image area */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          // Placeholder when no image exists
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            <svg
              className="h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm12.75-11.25h.008v.008h-.008V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Card details */}
      <div className="p-3">
        <h3 className="font-medium text-navy">{item.name}</h3>
        <div className="mt-1 flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              categoryColors[item.category] || "bg-gray-100 text-gray-800"
            }`}
          >
            {categoryLabels[item.category] || item.category}
          </span>
          <span className="text-xs text-gray-medium">{item.color}</span>
        </div>
      </div>
    </div>
  );
}
