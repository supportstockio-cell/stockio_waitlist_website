import { createClient } from "@supabase/supabase-js";

// Fall back to harmless placeholders so this module never throws during
// server-side prerendering (e.g. a Vercel build where env vars haven't been
// configured yet). Real submissions will simply fail gracefully at runtime
// until NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are set.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
