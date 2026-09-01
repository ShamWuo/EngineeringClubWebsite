import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/db/types';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vanpniumrtgctqobfzmw.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_4WzLhRnDkfDsngU4fz76ww_u0w5z18i';

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
