// TypeScript types for the FitCheck app
// These define the "shape" of our data — what fields each object has

export type Category = "tops" | "bottoms" | "shoes" | "outerwear" | "accessories" | "pieces";

export type Formality = "casual" | "smart_casual" | "business_casual" | "formal" | "gym";

export type Season = "spring" | "summer" | "fall" | "winter" | "all-season";

export type Activity =
  | "work"
  | "date_night"
  | "casual_hangout"
  | "gym"
  | "outdoor_active"
  | "special_event";

// A single clothing item in the user's wardrobe
export interface ClothingItem {
  id: string;
  user_id: string;
  name: string;
  category: Category;
  color: string;
  formality: Formality;
  seasons: Season[];
  fit_rating?: number; // 1-5 scale for quality/fit
  image_url: string | null;
  cloudinary_public_id: string | null;
  created_at: string;
  updated_at: string;
}

// An outfit recommendation from Claude AI
export interface OutfitRecommendation {
  name: string;
  items: string[]; // array of ClothingItem IDs
  why: string;
  confidence: "high" | "medium" | "low";
}

// The full response from the AI recommendation endpoint
export interface RecommendationResponse {
  outfits: OutfitRecommendation[];
  wardrobe_tip?: string;
}

// Weather data from OpenWeather API
export interface WeatherData {
  temperature: number;
  feels_like: number;
  conditions: string;
  humidity: number;
  icon: string;
  city: string;
}
