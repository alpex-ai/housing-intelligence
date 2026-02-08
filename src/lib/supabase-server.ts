import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Server-side Supabase client (for API routes and server components)
// Uses service role key to bypass RLS for admin operations
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
