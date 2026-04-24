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
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    showToast(error.message, 'error');
    return null;
  }
  
  showToast('Logged in successfully', 'success');
  return data.user;
}

export async function register(fullName, email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    showToast(error.message, 'error');
    return null;
  }

  if (data.user) {
    // Insert into profiles
    const { error: profileError } = await supabase.from('profiles').insert([
      { id: data.user.id, full_name: fullName, email: email } // Added email to profile for ease, optional
    ]);
    
    if (profileError) {
      console.error('Profile creation error:', profileError);
    }
    showToast('Registration successful! Please check your email to verify.', 'success');
    return data.user;
  }
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    showToast(error.message, 'error');
  } else {
    showToast('Logged out successfully', 'info');
    window.location.reload();
  }
}

export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) {
    showToast(error.message, 'error');
  } else {
    showToast('Password reset email sent', 'success');
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
  }
}

// Update header UI based on auth state
function updateHeaderUI() {
  const accountLink = document.getElementById('account-link');
  if (!accountLink) return;

  if (currentProfile) {
    accountLink.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> <span class="sr-only">Account</span>`;
    accountLink.href = './account.html';
  } else {
    accountLink.innerHTML = 'Login';
    accountLink.href = './login.html';
  }
}
