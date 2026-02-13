"use client";

// Add Item page — form where users upload a photo and categorize their clothing
// "use client" is needed because this page uses interactive form elements (onChange, etc.)

import Link from "next/link";
import { useState } from "react";
import type { Category, Formality, Season } from "@/lib/types";

// Options for each dropdown / selector
const categories: { value: Category; label: string }[] = [
  { value: "tops", label: "Tops" },
  { value: "bottoms", label: "Bottoms" },
  { value: "shoes", label: "Shoes" },
  { value: "outerwear", label: "Outerwear" },
  { value: "accessories", label: "Accessories" },
];

const formalityLevels: { value: Formality; label: string }[] = [
  { value: "casual", label: "Casual" },
  { value: "smart_casual", label: "Smart Casual" },
  { value: "business_casual", label: "Business Casual" },
  { value: "formal", label: "Formal" },
];

const seasons: { value: Season; label: string }[] = [
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "fall", label: "Fall" },
  { value: "winter", label: "Winter" },
  { value: "all-season", label: "All-Season" },
];

// Common clothing colors
const colors = [
  "Black",
  "White",
  "Navy",
  "Gray",
  "Blue",
  "Red",
  "Green",
  "Brown",
  "Beige",
  "Khaki",
  "Olive",
  "Burgundy",
  "Pink",
  "Orange",
  "Yellow",
  "Purple",
  "Indigo",
  "Teal",
];

export default function AddItemPage() {
  // State for each form field
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("tops");
  const [color, setColor] = useState("Black");
  const [formality, setFormality] = useState<Formality>("casual");
  const [selectedSeasons, setSelectedSeasons] = useState<Season[]>([]);

  // Toggle a season on/off when clicked
  const toggleSeason = (season: Season) => {
    setSelectedSeasons((prev) =>
      prev.includes(season)
        ? prev.filter((s) => s !== season)
        : [...prev, season]
    );
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Page header with back link */}
      <div>
        <Link
          href="/wardrobe"
          className="text-sm text-accent hover:underline"
        >
          &larr; Back to Wardrobe
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-navy">Add New Item</h1>
        <p className="mt-1 text-sm text-gray-dark">
          Upload a photo and tell us about this piece.
        </p>
      </div>

      <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Photo upload area */}
        <div>
          <label className="mb-2 block text-sm font-medium text-navy">
            Photo
          </label>
          <div className="flex h-48 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-accent hover:bg-accent/5">
            <div className="text-center">
              <svg
                className="mx-auto h-10 w-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-dark">
                Click to upload a photo
              </p>
              <p className="text-xs text-gray-medium">PNG, JPG up to 10MB</p>
            </div>
          </div>
        </div>

        {/* Item name */}
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-navy"
          >
            Item Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='e.g., "Navy Oxford Shirt"'
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {/* Category dropdown */}
        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-sm font-medium text-navy"
          >
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Color dropdown */}
        <div>
          <label
            htmlFor="color"
            className="mb-2 block text-sm font-medium text-navy"
          >
            Color
          </label>
          <select
            id="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            {colors.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Formality level */}
        <div>
          <label className="mb-2 block text-sm font-medium text-navy">
            Formality Level
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {formalityLevels.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => setFormality(level.value)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  formality === level.value
                    ? "border-accent bg-accent text-white"
                    : "border-gray-300 bg-white text-gray-dark hover:border-accent"
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>

        {/* Season tags — multiple can be selected */}
        <div>
          <label className="mb-2 block text-sm font-medium text-navy">
            Seasons
          </label>
          <div className="flex flex-wrap gap-2">
            {seasons.map((season) => (
              <button
                key={season.value}
                type="button"
                onClick={() => toggleSeason(season.value)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  selectedSeasons.includes(season.value)
                    ? "bg-accent text-white"
                    : "bg-gray-100 text-gray-dark hover:bg-gray-200"
                }`}
              >
                {season.label}
              </button>
            ))}
          </div>
        </div>

        {/* Save button (non-functional for now) */}
        <button
          type="button"
          className="w-full rounded-lg bg-accent px-4 py-3 font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Save Item
        </button>
      </div>
    </div>
  );
}
