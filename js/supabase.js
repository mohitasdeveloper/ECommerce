import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://uxjghsgpnkivfowwyzuo.supabase.co';
const supabaseKey = 'sb_publishable_HOZF825sKCepZ3yHwhHxsw_Dbdh1JG7';

export const supabase = createClient(supabaseUrl, supabaseKey);
