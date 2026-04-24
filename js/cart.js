import { showToast } from './toast.js';

let cart = JSON.parse(localStorage.getItem('store_cart')) || [];

// Update cart counter in header
export function updateCartCount() {
  const countBadge = document.getElementById('cart-count');
  if (countBadge) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    countBadge.textContent = totalItems;
    countBadge.style.display = totalItems > 0 ? 'flex' : 'none';
  }
  
  // Trigger custom event for other components
  window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
}

export function saveCart() {
  localStorage.setItem('store_cart', JSON.stringify(cart));
  updateCartCount();
}

export function getCart() {
  return cart;
}

export function addToCart(product, variant = null, quantity = 1) {
  const cartItemId = variant ? variant.id : product.id;
  
  const existingItemIndex = cart.findIndex(item => item.cartItemId === cartItemId);
  
  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += quantity;
  } else {
    cart.push({
      cartItemId: cartItemId,
      product_id: product.id,
      variant_id: variant ? variant.id : null,
      name: product.name,
      variant_label: variant ? variant.label : '',
      price: variant ? variant.price : product.price,
      image_url: variant && variant.media_url ? variant.media_url : product.main_image_url,
      quantity: quantity,
      stock_status: variant ? variant.stock_status : product.stock_status
    });
  }
  
  saveCart();
  showToast('Added to cart', 'success');
}

export function removeFromCart(cartItemId) {
  cart = cart.filter(item => item.cartItemId !== cartItemId);
  saveCart();
}

export function updateQuantity(cartItemId, newQuantity) {
  if (newQuantity < 1) return;
  const item = cart.find(item => item.cartItemId === cartItemId);
  if (item) {
    item.quantity = newQuantity;
    saveCart();
  }
}

export function clearCart() {
  cart = [];
  saveCart();
}

export function getCartTotal() {
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Initialize
window.addEventListener('storage', (e) => {
  if (e.key === 'store_cart') {
    cart = JSON.parse(e.newValue) || [];
    updateCartCount();
  }
});

// Update UI initially
document.addEventListener('DOMContentLoaded', updateCartCount);
