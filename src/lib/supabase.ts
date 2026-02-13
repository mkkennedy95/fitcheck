import { createBrowserClient } from "@supabase/ssr";

// This creates a Supabase client that runs in the browser.
// It uses the two environment variables you set in .env.local.
//
// NEXT_PUBLIC_ prefix means these values are safe to expose to the browser.
// The "anon key" is a public key — it only allows access that your
// Row Level Security (RLS) policies permit.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
