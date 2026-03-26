import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { ClothingItem } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    // Create server-side Supabase client with cookies
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Parse request body
    const {
      outfit_name,
      outfit_description,
      items,
      weather_context,
    } = (await req.json()) as {
      outfit_name: string;
      outfit_description: string;
      items: ClothingItem[];
      weather_context: {
        temperature: number;
        feels_like: number;
        conditions: string;
        humidity: number;
        city: string;
      } | null;
    };

    // Validate required fields
    if (!outfit_name || !outfit_description || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: outfit_name, outfit_description, or items." },
        { status: 400 }
      );
    }

    // Insert into saved_outfits table
    const { data, error: insertError } = await supabase
      .from("saved_outfits")
      .insert({
        user_id: user.id,
        outfit_name,
        outfit_description,
        items,
        weather_context,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error saving outfit:", insertError);
      return NextResponse.json(
        { error: `Failed to save outfit: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, outfit: data }, { status: 201 });
  } catch (err) {
    console.error("Exception in save outfit route:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
