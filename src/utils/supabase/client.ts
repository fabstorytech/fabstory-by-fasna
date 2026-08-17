import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cwrcmppwattowaxcjkdf.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_DiFN5enKKYJMERapu9KetA_24bRba49';

export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseKey,
  );
