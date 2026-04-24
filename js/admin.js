import { supabase } from './supabase.js';
import { getCurrentUser, requireAdmin } from './auth.js';

export async function checkAdmin() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = '../login.html';
    return false;
  }

  const { data } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', session.user.id)
    .single();

  if (!data || !data.is_admin) {
    window.location.href = '../';
    return false;
  }
  return true;
}

// Utility to fetch all settings as a key-value object
export async function getSettings() {
  const { data, error } = await supabase.from('settings').select('*');
  if (error) return {};
  return data.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
}

// Utility: format currency
export function formatCurrency(amount) {
  return '₹' + parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// Utility: format date
export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
