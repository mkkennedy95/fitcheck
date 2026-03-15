"use client";

// Category Worksheet — quickly fill in wardrobe items by category
// Users type items under each category heading, items are saved with category pre-assigned

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import type { Category } from "@/lib/types";

interface CategorySection {
  category: Category;
  label: string;
  placeholder: string;
}

const categories: CategorySection[] = [
  {
    category: "tops",
    label: "Shirts & Tops",
    placeholder: "e.g., white dress shirt, navy polo, gray t-shirt",
  },
  {
    category: "bottoms",
    label: "Pants & Bottoms",
    placeholder: "e.g., black jeans, khaki chinos, navy dress pants",
  },
  {
    category: "shoes",
    label: "Shoes",
    placeholder: "e.g., brown leather oxfords, white sneakers, black loafers",
  },
  {
    category: "outerwear",
    label: "Outerwear & Jackets",
    placeholder: "e.g., navy blazer, gray wool coat, black bomber jacket",
  },
  {
    category: "accessories",
    label: "Accessories",
    placeholder: "e.g., brown leather belt, silver watch, navy tie",
  },
  {
    category: "pieces",
    label: "Pieces & Sets",
    placeholder: "e.g., charcoal suit, navy suit",
  },
];

export default function WorksheetPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Store text for each category
  const [categoryInputs, setCategoryInputs] = useState<
    Record<Category, string>
  >({
    tops: "",
    bottoms: "",
    shoes: "",
    outerwear: "",
    accessories: "",
    pieces: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (category: Category, value: string) => {
    setCategoryInputs((prev) => ({ ...prev, [category]: value }));
  };

  const handleSave = async () => {
    // Parse all inputs and create items
    const itemsToCreate: Array<{
      user_id: string;
      name: string;
      category: Category;
      color: string;
      formality: string;
      seasons: string[];
      fit_rating: number;
      image_url: null;
      cloudinary_public_id: null;
    }> = [];

    // For each category, split by comma/newline and create items
    for (const cat of categories) {
      const text = categoryInputs[cat.category].trim();
      if (!text) continue;

      // Split by comma or newline, clean up whitespace
      const items = text
        .split(/[,\n]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const itemName of items) {
        // Default values for quick entry
        itemsToCreate.push({
          user_id: user!.id,
          name: itemName,
          category: cat.category,
          color: "Gray", // default
          formality: "casual", // default
          seasons: ["all-season"], // default
          fit_rating: 3, // default
          image_url: null,
          cloudinary_public_id: null,
        });
      }
    }

    if (itemsToCreate.length === 0) {
      setError("Please add at least one item to save.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: dbError } = await supabase
        .from("clothing_items")
        .insert(itemsToCreate);

      if (dbError) {
        throw new Error(dbError.message);
      }

      router.push("/wardrobe");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save items.");
      setSaving(false);
    }
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
            Category Worksheet
          </h1>
          <p className="mt-1 text-sm text-gray-dark">
            Quickly fill in what you own under each category. Separate items
            with commas or line breaks.
          </p>
        </div>

        {/* Category sections */}
        <div className="space-y-4">
          {categories.map((cat) => (
            <div
              key={cat.category}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <label
                htmlFor={cat.category}
                className="mb-2 block text-sm font-semibold text-navy"
              >
                {cat.label}
              </label>
              <textarea
                id={cat.category}
                value={categoryInputs[cat.category]}
                onChange={(e) => handleInputChange(cat.category, e.target.value)}
                placeholder={cat.placeholder}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        {/* Save button */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/wardrobe")}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-dark transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-lg bg-accent px-4 py-3 font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save All Items"}
          </button>
        </div>

        {/* Note about defaults */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs text-gray-dark">
            <strong>Note:</strong> Items added via worksheet use default values
            (Gray color, Casual formality, All-season, 3/5 fit rating). You can
            edit individual items later from your wardrobe to add photos and
            adjust details.
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
