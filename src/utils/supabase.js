import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client = null;
if (url && anonKey) {
  client = createClient(url, anonKey);
}

export function getSupabase() {
  return client;
}

export const PROFILES_TABLE = "profiles";
