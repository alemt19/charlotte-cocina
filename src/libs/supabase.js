import { createClient } from '@supabase/supabase-js';
import { envs } from '../config/envs.js';

if (!envs.SUPABASE_URL || !envs.SUPABASE_KEY) {
  console.warn('⚠️ Supabase credentials needed for storage are missing (SUPABASE_URL, SUPABASE_KEY).');
}

export const supabase = createClient(
  envs.SUPABASE_URL || 'https://placeholder.supabase.co',
  envs.SUPABASE_KEY || 'placeholder'
);
