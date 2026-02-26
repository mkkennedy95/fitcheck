"use client";

// Add Item page — users upload a photo to Cloudinary, fill in details,
// and save the item to Supabase.
//
// HOW THE UPLOAD WORKS:
// 1. User picks a file from their computer
// 2. We upload it directly to Cloudinary's API (no server needed)
// 3. Cloudinary returns a URL for the image
// 4. We save that URL + the item details to Supabase

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import type { Category, Formality, Season } from "@/lib/types";

// Options for each dropdown / selector
const categories: { value: Category; label: string }[] = [
  { value: "tops", label: "Tops" },
  { value: "bottoms", label: "Bottoms" },
  { value: "shoes", label: "Shoes" },
  { value: "outerwear", label: "Outerwear" },
  { value: "accessories", label: "Accessories" },
  { value: "pieces", label: "Pieces" },
];

const formalityLevels: { value: Formality; label: string }[] = [
  { value: "casual", label: "Casual" },
  { value: "smart_casual", label: "Smart Casual" },
  { value: "business_casual", label: "Business Casual" },
  { value: "formal", label: "Formal" },
  { value: "gym", label: "Gym/Exercise" },
];

const seasonOptions: { value: Season; label: string }[] = [
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "fall", label: "Fall" },
  { value: "winter", label: "Winter" },
  { value: "all-season", label: "All-Season" },
];

const colors = [
  "Black", "White", "Navy", "Gray", "Blue", "Red", "Green", "Brown",
  "Beige", "Khaki", "Olive", "Burgundy", "Pink", "Orange", "Yellow",
  "Purple", "Indigo", "Teal",
];

// Uploads a file to Cloudinary and returns the image URL + public ID.
// Uses "unsigned upload" — the simplest way to upload from the browser.
async function uploadToCloudinary(file: File): Promise<{
  url: string;
  publicId: string;
}> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error("Cloudinary cloud name not configured");
  }

  // FormData is the standard way to send files over HTTP
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "fitcheck_unsigned");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    throw new Error("Image upload failed");
  }

  const data = await response.json();
  return {
    url: data.secure_url,
    publicId: data.public_id,
  };
}

export default function AddItemPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("tops");
  const [color, setColor] = useState("Black");
  const [formality, setFormality] = useState<Formality>("casual");
  const [selectedSeasons, setSelectedSeasons] = useState<Season[]>([]);
  const [fitRating, setFitRating] = useState(3);

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Submission state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Toggle a season on/off when clicked
  const toggleSeason = (season: Season) => {
    setSelectedSeasons((prev) =>
      prev.includes(season)
        ? prev.filter((s) => s !== season)
        : [...prev, season]
    );
  };

  // When user selects a file, create a preview URL to show them
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // URL.createObjectURL creates a temporary URL for previewing the file
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Save the item: upload image to Cloudinary, then save to Supabase
  const handleSave = async () => {
    // Validate required fields
    if (!name.trim()) {
      setError("Please enter an item name.");
      return;
    }
    if (selectedSeasons.length === 0) {
      setError("Please select at least one season.");
      return;
    }

    setError(null);
    setSaving(true);

    try {
      let imageUrl: string | null = null;
      let cloudinaryPublicId: string | null = null;

      // Step 1: Upload image to Cloudinary (if one was selected)
      if (imageFile) {
        const uploadResult = await uploadToCloudinary(imageFile);
        imageUrl = uploadResult.url;
        cloudinaryPublicId = uploadResult.publicId;
      }

      // Step 2: Save the item to Supabase
      const supabase = createClient();
      const { error: dbError } = await supabase
        .from("clothing_items")
        .insert({
          user_id: user!.id,
          name: name.trim(),
          category,
          color,
          formality,
          seasons: selectedSeasons,
          fit_rating: fitRating,
          image_url: imageUrl,
          cloudinary_public_id: cloudinaryPublicId,
        });

      if (dbError) {
        throw new Error(dbError.message);
      }

      // Step 3: Redirect to wardrobe page to see the new item
      router.push("/wardrobe");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
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
        {/* Error message */}
        {error && (
          <div className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        {/* Photo upload area */}
        <div>
          <label className="mb-2 block text-sm font-medium text-navy">
            Photo
          </label>
          <label className="block cursor-pointer">
            <div
              className={`flex h-48 items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                imagePreview
                  ? "border-accent bg-accent/5"
                  : "border-gray-300 bg-gray-50 hover:border-accent hover:bg-accent/5"
              }`}
            >
              {imagePreview ? (
                // Show the image preview
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-full w-full rounded-lg object-contain"
                />
              ) : (
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
                  <p className="text-xs text-gray-medium">
                    PNG, JPG up to 10MB
                  </p>
                </div>
              )}
            </div>
            {/* Hidden file input — clicking the label above triggers this */}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          {imagePreview && (
            <button
              type="button"
              onClick={() => {
                setImageFile(null);
                setImagePreview(null);
              }}
              className="mt-2 text-xs text-error hover:underline"
            >
              Remove photo
            </button>
          )}
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
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
            {seasonOptions.map((season) => (
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

        {/* Quality/Fit Rating Slider */}
        <div>
          <label className="mb-2 block text-sm font-medium text-navy">
            Quality/Fit Rating
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="5"
              value={fitRating}
              onChange={(e) => setFitRating(parseInt(e.target.value))}
              className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-gray-200 accent-accent"
            />
            <span className="min-w-12 text-sm font-medium text-navy">
              {fitRating}/5
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-medium">
            How well does this item fit and how good is the quality?
          </p>
        </div>

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-lg bg-accent px-4 py-3 font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Item"}
        </button>
      </div>
    </div>
    </ProtectedRoute>
  );
}
