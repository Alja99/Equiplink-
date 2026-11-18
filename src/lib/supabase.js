import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function isConfiguredValue(value) {
  return Boolean(value && !/your[_-]|placeholder|example/i.test(value));
}

export const isSupabaseConfigured = isConfiguredValue(supabaseUrl)
  && isConfiguredValue(supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;