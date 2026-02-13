"use client";

// Home / Dashboard page — shows real stats from Supabase.
// Protected — requires login.

import Link from "next/link";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import type { ClothingItem } from "@/lib/types";

export default function Home() {
  const { user } = useAuth();
  const [totalItems, setTotalItems] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch real stats from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("clothing_items")
        .select("category")
        .eq("user_id", user.id);

      if (data) {
        setTotalItems(data.length);
        // Count unique categories the user has items in
        const uniqueCategories = new Set(
          data.map((item: Pick<ClothingItem, "category">) => item.category)
        );
        setCategoryCount(uniqueCategories.size);
      }
      setLoading(false);
    };

    fetchStats();
  }, [user]);

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        {/* Welcome section */}
        <div>
          <h1 className="text-3xl font-bold text-navy">Welcome to FitCheck</h1>
          <p className="mt-2 text-gray-dark">
            Your AI-powered wardrobe assistant. Upload your clothes, get outfit
            picks.
          </p>
        </div>

        {/* Quick stats cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-medium">Total Items</p>
            <p className="mt-1 text-3xl font-bold text-navy">
              {loading ? "—" : totalItems}
            </p>
            <p className="mt-1 text-xs text-gray-medium">
              {totalItems === 0 ? "Add items to get started" : "In your wardrobe"}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-medium">Categories</p>
            <p className="mt-1 text-3xl font-bold text-navy">
              {loading ? "—" : `${categoryCount} / 5`}
            </p>
            <p className="mt-1 text-xs text-gray-medium">
              Tops, bottoms, shoes, outerwear, accessories
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-medium">
              Saved Outfits
            </p>
            <p className="mt-1 text-3xl font-bold text-navy">0</p>
            <p className="mt-1 text-xs text-gray-medium">
              AI-recommended combos you loved
            </p>
          </div>
        </div>

        {/* CTA section */}
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-navy">
            {totalItems === 0
              ? "Ready to get dressed smarter?"
              : "Looking good! What's next?"}
          </h2>
          <p className="mt-2 text-gray-dark">
            {totalItems === 0
              ? "Add some items to your wardrobe, then let AI pick your outfit."
              : "Add more items or get AI outfit recommendations."}
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/wardrobe/add"
              className="rounded-lg bg-accent px-6 py-3 font-medium text-white transition-colors hover:bg-accent-hover"
            >
              {totalItems === 0 ? "Add Your First Item" : "Add Another Item"}
            </Link>
            <Link
              href="/outfit"
              className="rounded-lg border border-accent px-6 py-3 font-medium text-accent transition-colors hover:bg-accent hover:text-white"
            >
              Get Outfit Recommendation
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
