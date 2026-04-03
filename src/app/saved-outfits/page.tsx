"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";

interface SavedOutfit {
  id: string;
  outfit_description: string;
  weather_context: string | null;
  created_at: string;
}

export default function SavedOutfitsPage() {
  const { user } = useAuth();
  const [outfits, setOutfits] = useState<SavedOutfit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchOutfits = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("saved_outfits")
        .select("id, outfit_description, weather_context, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) setOutfits(data);
      setLoading(false);
    };

    fetchOutfits();
  }, [user]);

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-navy">Saved Outfits</h1>
          <p className="mt-2 text-gray-dark">
            AI-recommended combos you loved.
          </p>
        </div>

        {loading ? (
          <p className="text-gray-medium">Loading...</p>
        ) : outfits.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-medium text-navy">No saved outfits yet</p>
            <p className="mt-2 text-gray-dark">
              Get an outfit recommendation and save the ones you love.
            </p>
            <Link
              href="/outfit"
              className="mt-6 inline-block rounded-lg bg-accent px-6 py-3 font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Get Outfit Recommendation
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {outfits.map((outfit) => (
              <div
                key={outfit.id}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <p className="font-semibold text-navy">{outfit.outfit_description}</p>
                {outfit.weather_context && (
                  <p className="mt-2 text-sm text-gray-medium">
                    🌤 {outfit.weather_context}
                  </p>
                )}
                <p className="mt-3 text-xs text-gray-medium">
                  {new Date(outfit.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
