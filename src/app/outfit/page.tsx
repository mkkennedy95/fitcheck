"use client";

// Get Outfit page — users select an activity, see real weather,
// and get AI outfit recommendations from their wardrobe.

import { useCallback, useEffect, useState } from "react";
import OutfitCard from "@/components/OutfitCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import WeatherWidget from "@/components/WeatherWidget";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import type {
  ClothingItem,
  OutfitRecommendation,
  WeatherData,
} from "@/lib/types";

// Activity options for the dropdown
const activities = [
  { value: "work", label: "Work" },
  { value: "date_night", label: "Date Night" },
  { value: "casual_hangout", label: "Casual Hangout" },
  { value: "gym", label: "Gym" },
  { value: "outdoor_active", label: "Outdoor / Active" },
  { value: "special_event", label: "Special Event" },
];

export default function OutfitPage() {
  const { user, loading: authLoading } = useAuth();
  const [activity, setActivity] = useState("casual_hangout");
  const [vibeNotes, setVibeNotes] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);

  // Real wardrobe items from Supabase
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [itemsMap, setItemsMap] = useState<Record<string, ClothingItem>>({});
  const [loadingItems, setLoadingItems] = useState(true);

  // Recommendation state
  const [outfits, setOutfits] = useState<OutfitRecommendation[]>([]);
  const [wardrobeTip, setWardrobeTip] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch the user's wardrobe items
  const fetchItems = useCallback(async () => {
    if (!user) {
      setLoadingItems(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("clothing_items")
        .select("*")
        .eq("user_id", user.id);

      if (fetchError) {
        console.error("Error fetching wardrobe items:", fetchError);
        setError("Failed to load your wardrobe. Please refresh the page.");
      } else if (data) {
        setItems(data as ClothingItem[]);
        // Build a map of id -> item for quick lookup by OutfitCard
        const map: Record<string, ClothingItem> = {};
        for (const item of data) {
          map[item.id] = item as ClothingItem;
        }
        setItemsMap(map);
        console.log(`Loaded ${data.length} wardrobe items`);
      }
    } catch (err) {
      console.error("Exception fetching wardrobe items:", err);
      setError("Failed to load your wardrobe. Please refresh the page.");
    } finally {
      setLoadingItems(false);
    }
  }, [user]);

  useEffect(() => {
    console.log(`[OutfitPage] Component mounted. Auth loading: ${authLoading}, User: ${user?.id ?? 'null'}`);
    fetchItems();
  }, [fetchItems, authLoading, user]);

  // Debug: Log when items change
  useEffect(() => {
    console.log(`[OutfitPage] Items updated: ${items.length} items, loadingItems: ${loadingItems}`);
  }, [items, loadingItems]);

  // Call the /api/outfit route which uses Claude AI
  const handleGenerate = async () => {
    console.log(`[OutfitPage] handleGenerate called. Items: ${items.length}, User: ${user?.id}`);

    if (items.length < 2) {
      console.warn(`[OutfitPage] Not enough items: ${items.length}`);
      setError(`You need at least 2 items in your wardrobe. You currently have ${items.length}.`);
      return;
    }

    setGenerating(true);
    setError(null);
    setShowResults(false);

    try {
      console.log(`[OutfitPage] Calling /api/outfit with ${items.length} items, activity: ${activity}`);

      const res = await fetch("/api/outfit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, activity, weather, vibeNotes }),
      });

      console.log(`[OutfitPage] API response status: ${res.status}`);

      if (!res.ok) {
        const { error: apiError } = (await res.json()) as { error: string };
        throw new Error(apiError ?? `Server error ${res.status}`);
      }

      const data = (await res.json()) as {
        outfits: OutfitRecommendation[];
        wardrobe_tip?: string | null;
      };

      console.log(`[OutfitPage] Received ${data.outfits.length} outfit recommendations`);

      setOutfits(data.outfits);
      setWardrobeTip(data.wardrobe_tip ?? null);
      setShowResults(true);
    } catch (err) {
      console.error("[OutfitPage] Error generating outfits:", err);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">Get Outfit Picks</h1>
          <p className="mt-1 text-sm text-gray-dark">
            Tell us what you&apos;re up to and we&apos;ll put together some
            looks from your wardrobe.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left column: Input form */}
          <div className="space-y-6">
            {/* Real weather widget */}
            <WeatherWidget onWeatherLoaded={setWeather} />

            {/* Activity selector */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <label
                htmlFor="activity"
                className="mb-2 block text-sm font-medium text-navy"
              >
                What are you dressing for?
              </label>
              <select
                id="activity"
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {activities.map((act) => (
                  <option key={act.value} value={act.value}>
                    {act.label}
                  </option>
                ))}
              </select>

              {/* Vibe / notes */}
              <label
                htmlFor="vibe"
                className="mb-2 mt-4 block text-sm font-medium text-navy"
              >
                Any specific vibe? (optional)
              </label>
              <textarea
                id="vibe"
                value={vibeNotes}
                onChange={(e) => setVibeNotes(e.target.value)}
                placeholder={
                  'e.g., "keeping it relaxed but put-together" or "meeting my girlfriend\'s parents"'
                }
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />

              {/* Generate button */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={authLoading || loadingItems || items.length < 2 || generating}
                className="mt-4 w-full rounded-lg bg-accent px-4 py-3 font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
              >
                {authLoading
                  ? "Loading user..."
                  : loadingItems
                    ? "Loading wardrobe..."
                    : items.length < 2
                      ? `Need at least 2 items (you have ${items.length})`
                      : generating
                        ? "Generating outfits…"
                        : "Generate Outfits"}
              </button>

              {/* Error message */}
              {error && (
                <p className="mt-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
                  {error}
                </p>
              )}
            </div>
          </div>

          {/* Right column: Results */}
          <div className="space-y-4">
            {generating ? (
              // Loading state
              <div className="flex h-full min-h-48 items-center justify-center rounded-xl border border-gray-200 bg-white p-12">
                <div className="text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                  <p className="mt-3 text-sm text-gray-medium">
                    Claude is styling your outfits…
                  </p>
                </div>
              </div>
            ) : showResults ? (
              <>
                <h2 className="text-lg font-semibold text-navy">
                  Your Outfit Picks
                </h2>
                {outfits.map((outfit, index) => (
                  <OutfitCard key={index} outfit={outfit} itemsMap={itemsMap} />
                ))}
                {/* Wardrobe tip */}
                {wardrobeTip && (
                  <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
                    <p className="text-sm font-medium text-accent">
                      Wardrobe Tip
                    </p>
                    <p className="mt-1 text-sm text-gray-dark">{wardrobeTip}</p>
                  </div>
                )}
              </>
            ) : (
              // Empty state before generating
              <div className="flex h-full min-h-48 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-12">
                <div className="text-center">
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
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                    />
                  </svg>
                  <p className="mt-3 text-sm text-gray-medium">
                    Select an activity and hit &quot;Generate Outfits&quot; to
                    get AI-powered picks from your wardrobe.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
