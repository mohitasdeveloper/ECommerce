import { supabase } from './supabase.js';
import { showToast } from './toast.js';

let currentUser = null;
let currentProfile = null;

// Initialize auth state
export async function initAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    currentUser = session.user;
    await fetchProfile(currentUser.id);
  }

  // Listen for auth changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (session) {
      currentUser = session.user;
      await fetchProfile(currentUser.id);
    } else {
      currentUser = null;
      currentProfile = null;
    }
    updateHeaderUI();
  });

  updateHeaderUI();
  return { user: currentUser, profile: currentProfile };
}

async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (!error && data) {
    currentProfile = data;
  }
}

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    showToast(error.message, 'error');
    return null;
  }
  showToast('Logged in successfully!', 'success');
  return data.user;
}

export async function register(fullName, email, password) {
  // Pass full_name as user metadata so the DB trigger picks it up
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }
    }
  });

  if (error) {
    showToast(error.message, 'error');
    return null;
  }

  if (data.user) {
    // Upsert profile in case trigger hasn't run yet
    await supabase.from('profiles').upsert(
      { id: data.user.id, full_name: fullName },
      { onConflict: 'id', ignoreDuplicates: true }
    );
    showToast('Registration successful! Please check your email to verify.', 'success');
    return data.user;
  }
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    showToast(error.message, 'error');
  } else {
    showToast('Logged out', 'info');
    window.location.href = './';
  }
}

export async function resetPassword(email) {
  if (!email) {
    showToast('Please enter your email address first', 'error');
    return;
  }
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) {
    showToast(error.message, 'error');
  } else {
    showToast('Password reset email sent!', 'success');
  }
}

export function getCurrentUser() {
  return currentUser;
}

export function getCurrentProfile() {
  return currentProfile;
}

// Route Guards
export function requireAuth() {
  if (!currentUser) {
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `./login.html?returnUrl=${returnUrl}`;
    return false;
  }
  return true;
}

export function requireAdmin() {
  if (!currentUser) {
    window.location.href = './login.html';
    return false;
  }
  if (currentProfile && !currentProfile.is_admin) {
    window.location.href = './';
    return false;
  }
  return true;
}

// Update header UI based on auth state
export function updateHeaderUI() {
  const accountLink = document.getElementById('account-link');
  if (!accountLink) return;

  if (currentProfile) {
    const name = currentProfile.full_name ? currentProfile.full_name.split(' ')[0] : '';
    accountLink.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
      ${name || 'Account'}
    `;
    accountLink.href = './account.html';
  } else {
    accountLink.innerHTML = 'Login';
    accountLink.href = './login.html';
  }

  // Update cart count on all pages
  updateCartCountDisplay();
}

function updateCartCountDisplay() {
  const cart = JSON.parse(localStorage.getItem('store_cart')) || [];
  const total = cart.reduce((sum, i) => sum + i.quantity, 0);
  const badge = document.getElementById('cart-count');
  if (badge) {
    badge.textContent = total;
    badge.style.display = total > 0 ? 'flex' : 'none';
  }
}
