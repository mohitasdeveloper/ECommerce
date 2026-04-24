import { supabase } from './supabase.js';
import { getCurrentProfile, requireAuth } from './auth.js';

export async function checkAdmin() {
  requireAuth();
  
  // Wait a tick for profile to be fetched if page just loaded
  setTimeout(async () => {
    const profile = getCurrentProfile();
    
    // Fallback if currentProfile is not populated fast enough
    if (!profile) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/login.html';
        return;
      }
      const { data } = await supabase.from('profiles').select('is_admin').eq('id', session.user.id).single();
      if (!data || !data.is_admin) {
        window.location.href = '/';
      }
    } else if (!profile.is_admin) {
      window.location.href = '/';
    }
  }, 500);
}

// Utility to fetch settings
export async function getSettings() {
  const { data, error } = await supabase.from('settings').select('*');
  if (error) return {};
  
  return data.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
}
