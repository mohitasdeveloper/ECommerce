import { supabase } from './supabase.js';
import { getCurrentUser } from './auth.js';
import { showToast } from './toast.js';

let wishlist = [];

export async function fetchWishlist() {
  const user = getCurrentUser();
  if (!user) {
    wishlist = [];
    updateWishlistCount();
    return;
  }

  const { data, error } = await supabase
    .from('wishlist')
    .select('product_id')
    .eq('user_id', user.id);

  if (!error && data) {
    wishlist = data.map(item => item.product_id);
    updateWishlistCount();
    // Dispatch event to update heart icons on current page
    window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: wishlist }));
  }
}

export async function toggleWishlist(productId) {
  const user = getCurrentUser();
  if (!user) {
    showToast('Please login to use wishlist', 'info');
    // Optionally redirect to login:
    // window.location.href = '/login.html?returnUrl=' + encodeURIComponent(window.location.pathname + window.location.search);
    return false;
  }

  const index = wishlist.indexOf(productId);
  if (index > -1) {
    // Remove
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .match({ user_id: user.id, product_id: productId });
      
    if (!error) {
      wishlist.splice(index, 1);
      showToast('Removed from wishlist', 'info');
    } else {
      showToast('Error removing from wishlist', 'error');
    }
  } else {
    // Add
    const { error } = await supabase
      .from('wishlist')
      .insert([{ user_id: user.id, product_id: productId }]);
      
    if (!error) {
      wishlist.push(productId);
      showToast('Added to wishlist', 'success');
    } else {
      showToast('Error adding to wishlist', 'error');
    }
  }
  
  updateWishlistCount();
  window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: wishlist }));
  return wishlist.includes(productId);
}

export function isInWishlist(productId) {
  return wishlist.includes(productId);
}

function updateWishlistCount() {
  const countBadge = document.getElementById('wishlist-count');
  if (countBadge) {
    countBadge.textContent = wishlist.length;
    countBadge.style.display = wishlist.length > 0 ? 'flex' : 'none';
  }
}

// Will be initialized after auth is checked
