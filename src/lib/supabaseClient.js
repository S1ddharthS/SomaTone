import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://osinwdodejvcoqkxjjfr.supabase.co';
const supabaseKey = 'sb_publishable_UdqNrxrJhSdbucE3ccEfWA_wIqW4EQI';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storageKey: 'somatone-auth-token',
  },
});
