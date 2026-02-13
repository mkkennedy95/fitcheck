// Weather API route — runs on the server (not in the browser).
//
// WHY A SERVER ROUTE?
// We don't want to expose the OpenWeather API key to the browser.
// By calling OpenWeather from the server, the key stays secret.
// The browser calls OUR route (/api/weather?city=NYC), and we call
// OpenWeather behind the scenes.

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Weather API key not configured" },
      { status: 500 }
    );
  }

  // Get city or coordinates from the URL query string
  // Example: /api/weather?city=New York  or  /api/weather?lat=40.7&lon=-74.0
  const searchParams = request.nextUrl.searchParams;
  const city = searchParams.get("city");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  let url: string;
  if (lat && lon) {
    // Use coordinates (more accurate, from browser geolocation)
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
  } else if (city) {
    // Use city name
    url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=imperial`;
  } else {
    return NextResponse.json(
      { error: "Please provide a city name or coordinates (lat/lon)" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to fetch weather" },
        { status: response.status }
      );
    }

    // Return simplified weather data (not the full OpenWeather response)
    return NextResponse.json({
      temperature: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      conditions: data.weather[0].main,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      icon: data.weather[0].icon,
      city: data.name,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to weather service" },
      { status: 500 }
    );
  }
}
