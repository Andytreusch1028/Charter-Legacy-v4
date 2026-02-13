import { createClient } from '@supabase/supabase-js'
import { createMockClient } from './mockSupabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Detect if we are using the placeholder project
const isPlaceholder = !supabaseUrl || supabaseUrl.includes('smsqnqfgoheqmynkgpel');

if (isPlaceholder) {
    console.warn("⚠️  CHARTER LEGACY: BACKEND UNAVAILABLE - ACTIVATING PROTOCOL ALPHA MOCK SERVICE ⚠️");
    console.warn("Running with in-memory database. Data will persist to localStorage.");
}

export const supabase = isPlaceholder ? createMockClient() : createClient(supabaseUrl, supabaseAnonKey);
