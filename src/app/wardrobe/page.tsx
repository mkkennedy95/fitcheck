"use client";

import Link from "next/link";
import ClothingCard from "@/components/ClothingCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import type { ClothingItem } from "@/lib/types";

// Placeholder clothing items — these will come from the database in Phase 3
const placeholderItems: ClothingItem[] = [
  {
    id: "1",
    user_id: "demo",
    name: "Navy Oxford Shirt",
    category: "tops",
    color: "Navy",
    formality: "business_casual",
    seasons: ["spring", "fall", "winter"],
    image_url: null,
    cloudinary_public_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    user_id: "demo",
    name: "White T-Shirt",
    category: "tops",
    color: "White",
    formality: "casual",
    seasons: ["spring", "summer"],
    image_url: null,
    cloudinary_public_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    user_id: "demo",
    name: "Dark Wash Jeans",
    category: "bottoms",
    color: "Indigo",
    formality: "smart_casual",
    seasons: ["all-season"],
    image_url: null,
    cloudinary_public_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    user_id: "demo",
    name: "Khaki Chinos",
    category: "bottoms",
    color: "Khaki",
    formality: "business_casual",
    seasons: ["spring", "summer", "fall"],
    image_url: null,
    cloudinary_public_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "5",
    user_id: "demo",
    name: "White Sneakers",
    category: "shoes",
    color: "White",
    formality: "casual",
    seasons: ["spring", "summer", "fall"],
    image_url: null,
    cloudinary_public_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "6",
    user_id: "demo",
    name: "Black Bomber Jacket",
    category: "outerwear",
    color: "Black",
    formality: "smart_casual",
    seasons: ["fall", "winter"],
    image_url: null,
    cloudinary_public_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// My Wardrobe page — protected, shows all clothing items in a grid
export default function WardrobePage() {
  const items = placeholderItems;

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy">My Wardrobe</h1>
            <p className="mt-1 text-sm text-gray-dark">
              {items.length} items in your collection
            </p>
          </div>
          <Link
            href="/wardrobe/add"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            + Add Item
          </Link>
        </div>

        {/* Filter tabs (non-functional for now — just UI) */}
        <div className="flex gap-2 overflow-x-auto">
          {["All", "Tops", "Bottoms", "Shoes", "Outerwear", "Accessories"].map(
            (tab) => (
              <button
                key={tab}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  tab === "All"
                    ? "bg-navy text-white"
                    : "bg-white text-gray-dark hover:bg-gray-100"
                }`}
              >
                {tab}
              </button>
            )
          )}
        </div>

        {/* Clothing items grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <ClothingCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
