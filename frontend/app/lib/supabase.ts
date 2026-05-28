import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const isSupabaseConfigured =
  !!supabaseUrl && !!supabaseKey;

declare global {
  // eslint-disable-next-line no-var
  var __supabase: SupabaseClient | undefined;
}

export const supabase =
  globalThis.__supabase ??
  createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

if (typeof window !== "undefined") {
  globalThis.__supabase = supabase;
}