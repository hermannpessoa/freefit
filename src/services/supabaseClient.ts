import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

const isConfigured = 
  supabaseUrl !== 'https://placeholder.supabase.co' && 
  supabaseAnonKey !== 'placeholder-key';

if (!isConfigured) {
  console.warn(
    '⚠️ Supabase not configured. \n' +
    'Fill .env.local with real credentials from https://supabase.com\n' +
    'See SETUP.md sections 2-4 for instructions.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const isSupabaseConfigured = isConfigured;
