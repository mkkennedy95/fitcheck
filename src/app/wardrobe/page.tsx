"use client";

// My Wardrobe page — fetches the user's real clothing items from Supabase
// and displays them in a grid. Also supports filtering and deleting items.

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import ClothingCard from "@/components/ClothingCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import type { Category, ClothingItem } from "@/lib/types";

// Filter tabs — "all" means show everything
const filterTabs: { value: Category | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "tops", label: "Tops" },
  { value: "bottoms", label: "Bottoms" },
  { value: "shoes", label: "Shoes" },
  { value: "outerwear", label: "Outerwear" },
  { value: "accessories", label: "Accessories" },
];

export default function WardrobePage() {
  const { user } = useAuth();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<Category | "all">("all");

  // Fetch items from Supabase — wrapped in useCallback so we can
  // call it again after deleting an item
  const fetchItems = useCallback(async () => {
    if (!user) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from("clothing_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setItems(data as ClothingItem[]);
    }
    setLoading(false);
  }, [user]);

  // Fetch items when the page loads
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Delete an item from Supabase, then refresh the list
  const handleDelete = async (itemId: string) => {
    const supabase = createClient();
    await supabase.from("clothing_items").delete().eq("id", itemId);
    // Remove from local state immediately (feels faster than re-fetching)
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Filter items based on the active tab
  const filteredItems =
    activeFilter === "all"
      ? items
      : items.filter((item) => item.category === activeFilter);

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy">My Wardrobe</h1>
            <p className="mt-1 text-sm text-gray-dark">
              {items.length} {items.length === 1 ? "item" : "items"} in your
              collection
            </p>
          </div>
          <Link
            href="/wardrobe/add"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            + Add Item
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeFilter === tab.value
                  ? "bg-navy text-white"
                  : "bg-white text-gray-dark hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          </div>
        ) : filteredItems.length === 0 ? (
          // Empty state
          <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-300"
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
            <h3 className="mt-4 text-lg font-medium text-navy">
              {activeFilter === "all"
                ? "No items yet"
                : `No ${activeFilter} yet`}
            </h3>
            <p className="mt-1 text-sm text-gray-dark">
              Add your first piece to get started!
            </p>
            <Link
              href="/wardrobe/add"
              className="mt-4 inline-block rounded-lg bg-accent px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              + Add Item
            </Link>
          </div>
        ) : (
          // Clothing items grid
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filteredItems.map((item) => (
              <ClothingCard
                key={item.id}
                item={item}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
