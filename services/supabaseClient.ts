import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;
let supabaseError: string | null = null;

if (!supabaseUrl || !supabaseAnonKey) {
  supabaseError = "Supabase URL and Anon Key are missing. Please provide them as VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.";
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error("Error initializing Supabase client:", error);
    supabaseError = "There was an error initializing the Supabase client. Please check your credentials.";
  }
}

export { supabase, supabaseError };