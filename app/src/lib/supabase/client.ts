import { createBrowserClient } from "@supabase/ssr";

// TODO: Generate proper types with `supabase gen types typescript`
// For now, using untyped client to avoid type resolution issues
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!url || url.startsWith("your-")) {
    // Return a dummy client for UI testing without Supabase
    return createBrowserClient(
      "https://placeholder.supabase.co",
      "placeholder-key"
    );
  }

  return createBrowserClient(url, key);
}
