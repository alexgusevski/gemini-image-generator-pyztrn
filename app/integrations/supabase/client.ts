import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://btscmnmuxbueytxxeezt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0c2Ntbm11eGJ1ZXl0eHhlZXp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MDQwNzAsImV4cCI6MjA3NDI4MDA3MH0.kswz8ggvMejVw0Myx32r2IKeQKhq9nVSdQdK4ac13dQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
