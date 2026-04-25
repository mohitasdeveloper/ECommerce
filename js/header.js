import { initAuth, logout } from './auth.js';
import { fetchWishlist } from './wishlist.js';

export const HEADER_HTML = `
<header class="site-header" id="header">
  <div class="container header-inner">
    <a href="./" class="logo" id="store-logo">My Store</a>

    <!-- Desktop search -->
    <div class="header-search" id="desktop-search-wrap">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input type="text" placeholder="Search products..." id="search-input" autocomplete="off">
      <div id="search-results"></div>
    </div>

    <div class="header-actions">
      <!-- Mobile search icon -->
      <button class="action-btn mobile-search-btn" id="mobile-search-open" aria-label="Search">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </button>
      <!-- Wishlist (desktop only) -->
      <a href="./account.html#wishlist" class="action-btn" aria-label="Wishlist" id="wishlist-btn" style="display:none;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        <span class="badge" id="wishlist-count" style="display:none">0</span>
      </a>
      <!-- Cart -->
      <a href="./cart.html" class="action-btn" aria-label="Cart" id="cart-btn-header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        <span class="badge" id="cart-count" style="display:none">0</span>
      </a>
      <!-- Account -->
      <a href="./login.html" class="action-btn action-btn-text d-flex align-center gap-2" id="account-link" style="display:none;">Login</a>
    </div>
  </div>
</header>

<!-- Mobile Search Overlay -->
<div class="mobile-search-overlay" id="mobile-search-overlay">
  <div style="display:flex;align-items:center;gap:0.75rem;">
    <div style="position:relative;flex:1;">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="position:absolute;left:0.9rem;top:50%;transform:translateY(-50%);color:#6b7280;pointer-events:none;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input type="text" class="form-control" placeholder="Search products..." id="mobile-search-input" autocomplete="off" style="padding-left:2.5rem;">
    </div>
    <button class="btn btn-outline btn-sm" id="mobile-search-close">Cancel</button>
  </div>
  <div id="search-results-mobile"></div>
</div>
`;

export const BOTTOM_NAV_HTML = `
<nav class="bottom-nav" id="bottom-nav">
  <a href="./" class="bottom-nav-item" id="bn-home">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    Home
  </a>
  <a href="./shop.html" class="bottom-nav-item" id="bn-shop">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
    Shop
  </a>
  <a href="./cart.html" class="bottom-nav-item" id="bn-cart" style="position:relative;">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
    <span class="badge" id="cart-count-bn" style="display:none;">0</span>
    Cart
  </a>
  <a href="./account.html#wishlist" class="bottom-nav-item" id="bn-wishlist" style="position:relative;">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
    <span class="badge" id="wishlist-count-bn" style="display:none;">0</span>
    Wishlist
  </a>
  <a href="./account.html" class="bottom-nav-item" id="bn-account">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    Account
  </a>
</nav>
`;

export const FOOTER_HTML = `
<footer class="site-footer">
  <div class="container footer-grid">
    <div style="grid-column:1/-1;" class="footer-brand">
      <div class="logo" id="footer-store-name">My Store</div>
      <p class="text-muted mt-2" id="footer-tagline" style="font-size:0.875rem;">Quality You Can Trust</p>
    </div>
    <div>
      <div class="footer-title">Shop</div>
      <ul class="footer-links">
        <li><a href="./shop.html">All Products</a></li>
        <li><a href="./shop.html?category=electronics">Electronics</a></li>
        <li><a href="./shop.html?category=clothing">Clothing</a></li>
        <li><a href="./faq.html">FAQs</a></li>
      </ul>
    </div>
    <div>
      <div class="footer-title">Company</div>
      <ul class="footer-links">
        <li><a href="./about.html">About Us</a></li>
        <li><a href="./contact.html">Contact</a></li>
        <li><a href="./blog.html">Blog</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom container">
    &copy; <span id="year"></span> <span id="footer-copyright-name">My Store</span>. All rights reserved.
  </div>
</footer>

<a href="#" target="_blank" class="wa-float" id="wa-btn" style="display:none;" aria-label="WhatsApp">
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
</a>
`;

// Highlight active bottom nav item
function setActiveBottomNav() {
  const path = window.location.pathname;
  const map = { '/': 'bn-home', 'index': 'bn-home', 'shop': 'bn-shop', 'cart': 'bn-cart', 'wishlist': 'bn-wishlist', 'account': 'bn-account' };
  const key = Object.keys(map).find(k => path.includes(k));
  if (key) {
    const el = document.getElementById(map[key]);
    if (el) el.classList.add('active');
  }
}

function syncCounts() {
  const cart = JSON.parse(localStorage.getItem('store_cart')) || [];
  const total = cart.reduce((s, i) => s + i.quantity, 0);
  ['cart-count', 'cart-count-bn'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = total; el.style.display = total > 0 ? 'flex' : 'none'; }
  });
}

async function runSearch(query, resultsEl) {
  if (!query || query.length < 2) { resultsEl.innerHTML = ''; return; }
  resultsEl.innerHTML = '<p class="text-muted" style="padding:0.5rem;">Searching...</p>';
  const { supabase } = await import('./supabase.js');
  const { data } = await supabase
    .from('products')
    .select('name, slug, price, product_media(url, sort_order)')
    .eq('is_published', true)
    .ilike('name', `%${query}%`)
    .limit(6);
  if (!data || data.length === 0) { resultsEl.innerHTML = '<p class="text-muted" style="padding:0.5rem;">No products found.</p>'; return; }
  resultsEl.innerHTML = data.map(p => {
    const img = p.product_media?.sort((a,b) => a.sort_order - b.sort_order)[0]?.url || 'https://placehold.co/50x50?text=N/A';
    return `<a href="./product.html?slug=${p.slug}" style="display:flex;align-items:center;gap:0.75rem;padding:0.65rem 0.5rem;border-radius:var(--radius-md);transition:background 0.15s;" onmouseenter="this.style.background='var(--color-bg-secondary)'" onmouseleave="this.style.background=''">
      <img src="${img}" style="width:44px;height:44px;object-fit:cover;border-radius:var(--radius-sm);flex-shrink:0;" loading="lazy">
      <div><div style="font-weight:600;font-size:0.875rem;">${p.name}</div><div style="color:var(--color-accent);font-weight:700;font-size:0.875rem;">₹${p.price}</div></div>
    </a>`;
  }).join('');
}

export async function initPage() {
  // Inject toast container if not present
  if (!document.getElementById('toast-container')) {
    const tc = document.createElement('div'); tc.id = 'toast-container'; document.body.appendChild(tc);
  }

  // Auth
  const { user, profile } = await initAuth();

  // Wishlist
  if (user) {
    await fetchWishlist();
    const wishBtn = document.getElementById('wishlist-btn');
    if (wishBtn) wishBtn.style.display = 'flex';
  }

  // Account link (desktop)
  const accountLink = document.getElementById('account-link');
  if (accountLink) {
    accountLink.style.display = 'flex';
    if (profile) {
      const name = profile.full_name?.split(' ')[0] || 'Account';
      accountLink.innerHTML = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>${name}`;
      accountLink.href = './account.html';
    }
  }

  // Sticky header
  window.addEventListener('scroll', () => {
    const h = document.getElementById('header');
    if (h) h.classList.toggle('scrolled', window.scrollY > 8);
  }, { passive: true });

  // Desktop live search
  const desktopInput = document.getElementById('search-input');
  const desktopResults = document.getElementById('search-results');
  if (desktopInput && desktopResults) {
    let t;
    desktopInput.addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => { const q = e.target.value.trim(); if (q.length >= 2) desktopResults.style.display = 'block'; else desktopResults.style.display = 'none'; runSearch(q, desktopResults); }, 300); });
    document.addEventListener('click', e => { if (!desktopInput.contains(e.target) && !desktopResults.contains(e.target)) desktopResults.style.display = 'none'; });
  }

  // Mobile search
  const mobileOpen = document.getElementById('mobile-search-open');
  const mobileOverlay = document.getElementById('mobile-search-overlay');
  const mobileClose = document.getElementById('mobile-search-close');
  const mobileInput = document.getElementById('mobile-search-input');
  const mobileResults = document.getElementById('search-results-mobile');
  if (mobileOpen) mobileOpen.addEventListener('click', () => { mobileOverlay.classList.add('open'); mobileInput.focus(); });
  if (mobileClose) mobileClose.addEventListener('click', () => { mobileOverlay.classList.remove('open'); mobileInput.value = ''; mobileResults.innerHTML = ''; });
  if (mobileInput) {
    let t2;
    mobileInput.addEventListener('input', e => { clearTimeout(t2); t2 = setTimeout(() => runSearch(e.target.value.trim(), mobileResults), 300); });
  }

  // Bottom nav active state
  setActiveBottomNav();

  // Sync cart count
  syncCounts();
  window.addEventListener('cartUpdated', syncCounts);
  window.addEventListener('storage', syncCounts);

  // Load store settings
  try {
    const { supabase } = await import('./supabase.js');
    const { data: settings } = await supabase.from('settings').select('key, value');
    if (settings) {
      const m = Object.fromEntries(settings.map(s => [s.key, s.value]));
      const name = m['store_name'] || 'My Store';
      const logo = document.getElementById('store-logo'); if (logo) logo.textContent = name;
      const fn = document.getElementById('footer-store-name'); if (fn) fn.textContent = name;
      const ft = document.getElementById('footer-tagline'); if (ft && m['store_tagline']) ft.textContent = m['store_tagline'];
      const fc = document.getElementById('footer-copyright-name'); if (fc) fc.textContent = name;
      document.title = document.title.replace('My Store', name);
      if (m['whatsapp_number']) {
        const wa = document.getElementById('wa-btn');
        if (wa) { wa.href = `https://wa.me/${m['whatsapp_number']}`; wa.style.display = 'flex'; }
      }
    }
  } catch(e) { console.warn('Settings load:', e); }

  const yr = document.getElementById('year'); if (yr) yr.textContent = new Date().getFullYear();

  return { user, profile };
}
