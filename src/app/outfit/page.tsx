"use client";

// Get Outfit page — users select an activity and get AI outfit recommendations
// "use client" is needed for interactive form elements

import { useState } from "react";
import OutfitCard from "@/components/OutfitCard";
import type { ClothingItem, OutfitRecommendation } from "@/lib/types";

// Activity options for the dropdown
const activities = [
  { value: "work", label: "Work" },
  { value: "date_night", label: "Date Night" },
  { value: "casual_hangout", label: "Casual Hangout" },
  { value: "gym", label: "Gym" },
  { value: "outdoor_active", label: "Outdoor / Active" },
  { value: "special_event", label: "Special Event" },
];

// Placeholder items — same as wardrobe page, will be fetched from DB later
const placeholderItems: Record<string, ClothingItem> = {
  "1": {
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
  "3": {
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
  "5": {
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
};

// Placeholder outfit recommendations — will come from Claude API later
const placeholderOutfits: OutfitRecommendation[] = [
  {
    name: "Smart Casual Friday",
    items: ["1", "3", "5"],
    why: "The navy shirt with dark jeans is a classic smart-casual combo. White sneakers keep it relaxed without being sloppy.",
    confidence: "high",
  },
  {
    name: "Weekend Ready",
    items: ["1", "3"],
    why: "Oxford shirt with jeans works for anything from brunch to a casual evening out.",
    confidence: "medium",
  },
];

export default function OutfitPage() {
  const [activity, setActivity] = useState("casual_hangout");
  const [vibeNotes, setVibeNotes] = useState("");
  const [showResults, setShowResults] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Get Outfit Picks</h1>
        <p className="mt-1 text-sm text-gray-dark">
          Tell us what you&apos;re up to and we&apos;ll put together some looks
          from your wardrobe.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column: Input form */}
        <div className="space-y-6">
          {/* Weather widget placeholder */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-medium text-gray-medium">
              Current Weather
            </h2>
            <div className="mt-3 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-2xl">
                72°
              </div>
              <div>
                <p className="font-semibold text-navy">Partly Cloudy</p>
                <p className="text-sm text-gray-dark">
                  Feels like 70° · Humidity 45%
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-medium">
              Weather data will be live in a future update.
            </p>
          </div>

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
              placeholder={'e.g., "keeping it relaxed but put-together" or "meeting my girlfriend\'s parents"'}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />

            {/* Generate button */}
            <button
              type="button"
              onClick={() => setShowResults(true)}
              className="mt-4 w-full rounded-lg bg-accent px-4 py-3 font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Generate Outfits
            </button>
          </div>
        </div>

        {/* Right column: Results */}
        <div className="space-y-4">
          {showResults ? (
            <>
              <h2 className="text-lg font-semibold text-navy">
                Your Outfit Picks
              </h2>
              {placeholderOutfits.map((outfit, index) => (
                <OutfitCard
                  key={index}
                  outfit={outfit}
                  itemsMap={placeholderItems}
                />
              ))}
              {/* Wardrobe tip */}
              <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
                <p className="text-sm font-medium text-accent">
                  Wardrobe Tip
                </p>
                <p className="mt-1 text-sm text-gray-dark">
                  A versatile gray crewneck sweater would give you more layering
                  options for cooler days.
                </p>
              </div>
            </>
          ) : (
            // Empty state before generating
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-12">
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
                  Select an activity and hit &quot;Generate Outfits&quot; to get
                  AI-powered picks from your wardrobe.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
