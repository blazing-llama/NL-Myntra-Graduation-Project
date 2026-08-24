import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// The anon key is designed by Supabase to be public and safe client-side --
// Row Level Security (mvp/supabase/schema.sql) is what actually secures it.
// This is NOT the same trust model as requirement #11's "no client-side API
// keys" rule, which is about the Groq key (a real secret, never exposed).
// Do not follow this pattern for the Groq key -- that stays server-side only,
// in mvp/api/narrate.ts.

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// No project exists yet (.env is blank) -- null client until configured.
// Every call site must handle null gracefully; event logging is telemetry,
// never allowed to break the demo if unconfigured or if the network call fails.
export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null;
