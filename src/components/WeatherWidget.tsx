"use client";

// WeatherWidget — shows current weather for the user's location.
// It tries browser geolocation first, then falls back to a city input.
// The user's preferred city is saved in localStorage so they don't
// have to re-enter it every time.

import { useEffect, useState } from "react";
import type { WeatherData } from "@/lib/types";

interface WeatherWidgetProps {
  onWeatherLoaded?: (weather: WeatherData) => void;
}

export default function WeatherWidget({ onWeatherLoaded }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cityInput, setCityInput] = useState("");
  const [showCityInput, setShowCityInput] = useState(false);

  // Fetch weather from our API route
  const fetchWeather = async (params: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/weather?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch weather");
      }

      setWeather(data);
      onWeatherLoaded?.(data);
      // Save the city so we can use it next time
      if (data.city) {
        localStorage.setItem("fitcheck_city", data.city);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Weather unavailable");
    } finally {
      setLoading(false);
    }
  };

  // On load: try saved city, then geolocation, then show input
  useEffect(() => {
    const savedCity = localStorage.getItem("fitcheck_city");
    if (savedCity) {
      fetchWeather(`city=${encodeURIComponent(savedCity)}`);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(
            `lat=${position.coords.latitude}&lon=${position.coords.longitude}`
          );
        },
        () => {
          // Geolocation denied — show city input
          setShowCityInput(true);
        }
      );
    } else {
      setShowCityInput(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle city search form
  const handleCitySearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (cityInput.trim()) {
      fetchWeather(`city=${encodeURIComponent(cityInput.trim())}`);
      setShowCityInput(false);
    }
  };

  // Weather condition to icon mapping (using simple text since
  // we don't want to add an icon library for just this)
  const getWeatherEmoji = (conditions: string): string => {
    const map: Record<string, string> = {
      Clear: "☀️",
      Clouds: "☁️",
      Rain: "🌧️",
      Drizzle: "🌦️",
      Thunderstorm: "⛈️",
      Snow: "🌨️",
      Mist: "🌫️",
      Fog: "🌫️",
      Haze: "🌫️",
    };
    return map[conditions] || "🌤️";
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-medium">
          Current Weather
        </h2>
        {weather && (
          <button
            onClick={() => setShowCityInput(true)}
            className="text-xs text-accent hover:underline"
          >
            Change location
          </button>
        )}
      </div>

      {loading ? (
        <div className="mt-3 flex items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          <p className="text-sm text-gray-dark">Getting weather...</p>
        </div>
      ) : error ? (
        <div className="mt-3">
          <p className="text-sm text-error">{error}</p>
          <button
            onClick={() => setShowCityInput(true)}
            className="mt-2 text-sm text-accent hover:underline"
          >
            Enter your city manually
          </button>
        </div>
      ) : weather ? (
        <div className="mt-3 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-2xl">
            {getWeatherEmoji(weather.conditions)}
          </div>
          <div>
            <p className="text-2xl font-bold text-navy">{weather.temperature}°F</p>
            <p className="text-sm text-gray-dark">
              {weather.conditions} · Feels like {weather.feels_like}° · Humidity{" "}
              {weather.humidity}%
            </p>
            <p className="text-xs text-gray-medium">{weather.city}</p>
          </div>
        </div>
      ) : null}

      {/* City input — shown when geolocation fails or user clicks "change" */}
      {showCityInput && (
        <form onSubmit={handleCitySearch} className="mt-3 flex gap-2">
          <input
            type="text"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            placeholder="Enter your city..."
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <button
            type="submit"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
          >
            Go
          </button>
        </form>
      )}
    </div>
  );
}
