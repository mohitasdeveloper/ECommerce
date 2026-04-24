/**
 * Shared header HTML for all storefront pages.
 * Call injectHeader() at top of each page script.
 */
import { initAuth, logout } from './auth.js';
import { fetchWishlist } from './wishlist.js';

export const HEADER_HTML = `
<header class="site-header" id="header">
  <div class="container header-inner">
    <a href="./" class="logo" id="store-logo">My Store</a>
    <div class="header-search">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      <input type="text" placeholder="Search products..." id="search-input" autocomplete="off">
    </div>
    <div class="header-actions">
      <a href="./account.html#wishlist" class="action-btn" aria-label="Wishlist" id="wishlist-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        <span class="badge" id="wishlist-count" style="display:none">0</span>
      </a>
      <a href="./cart.html" class="action-btn" aria-label="Cart">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
        <span class="badge" id="cart-count" style="display:none">0</span>
      </a>
      <a href="./login.html" class="action-btn d-flex align-center gap-2" id="account-link" style="font-size:0.9rem;font-weight:500;">Login</a>
    </div>
  </div>
  <!-- Search Overlay -->
  <div id="search-overlay" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:200;" onclick="document.getElementById('search-overlay').style.display='none'"></div>
  <div id="search-results" style="display:none; position:absolute; left:50%; transform:translateX(-50%); width:90%; max-width:600px; background:white; border-radius:var(--radius-lg); box-shadow:var(--shadow-lg); z-index:201; max-height:400px; overflow-y:auto; padding:1rem;"></div>
</header>
`;

export const FOOTER_HTML = `
<footer class="site-footer">
  <div class="container footer-grid">
    <div>
      <h3 class="logo" id="footer-store-name">My Store</h3>
      <p class="text-muted mt-2" id="footer-tagline">Quality You Can Trust</p>
    </div>
    <div>
      <h4 class="footer-title">Shop</h4>
      <ul class="footer-links">
        <li><a href="./shop.html">All Products</a></li>
        <li><a href="./shop.html?category=electronics">Electronics</a></li>
        <li><a href="./shop.html?category=clothing">Clothing</a></li>
      </ul>
    </div>
    <div>
      <h4 class="footer-title">Company</h4>
      <ul class="footer-links">
        <li><a href="./about.html">About Us</a></li>
        <li><a href="./contact.html">Contact</a></li>
        <li><a href="./blog.html">Blog</a></li>
        <li><a href="./faq.html">FAQs</a></li>
      </ul>
    </div>
    <div>
      <h4 class="footer-title">Account</h4>
      <ul class="footer-links">
        <li><a href="./account.html">My Orders</a></li>
        <li><a href="./account.html#wishlist">Wishlist</a></li>
        <li><a href="./account.html#profile">Profile</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom container">
    <span>&copy; <span id="year"></span> <span id="footer-copyright-name">My Store</span>. All rights reserved.</span>
  </div>
</footer>
<a href="#" target="_blank" class="wa-float" id="wa-btn" style="display:none;" aria-label="Chat on WhatsApp">
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
</a>
`;

export async function initPage(options = {}) {
  // Inject toast container
  if (!document.getElementById('toast-container')) {
    const tc = document.createElement('div');
    tc.id = 'toast-container';
    document.body.appendChild(tc);
  }

  // Init auth
  const { user, profile } = await initAuth();

  // Fetch wishlist if logged in
  if (user) await fetchWishlist();

  // Sticky header scroll behavior
  window.addEventListener('scroll', () => {
    const h = document.getElementById('header');
    if (h) h.classList.toggle('scrolled', window.scrollY > 10);
  });

  // Live search
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    let searchTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      const q = e.target.value.trim();
      if (q.length < 2) {
        document.getElementById('search-overlay').style.display = 'none';
        document.getElementById('search-results').style.display = 'none';
        return;
      }
      searchTimer = setTimeout(() => runSearch(q), 300);
    });
  }

  // Load store settings for header/footer
  try {
    const { supabase } = await import('./supabase.js');
    const { data: settings } = await supabase.from('settings').select('*');
    if (settings) {
      const map = {};
      settings.forEach(s => map[s.key] = s.value);
      const storeName = map['store_name'] || 'My Store';
      const tagline = map['store_tagline'] || '';
      const waNum = map['whatsapp_number'] || '';

      const logoEl = document.getElementById('store-logo');
      if (logoEl) logoEl.textContent = storeName;
      document.title = document.title.replace('My Store', storeName);

      const footerName = document.getElementById('footer-store-name');
      if (footerName) footerName.textContent = storeName;
      const footerTag = document.getElementById('footer-tagline');
      if (footerTag && tagline) footerTag.textContent = tagline;
      const footerCopy = document.getElementById('footer-copyright-name');
      if (footerCopy) footerCopy.textContent = storeName;

      if (waNum) {
        const waBtn = document.getElementById('wa-btn');
        if (waBtn) {
          waBtn.href = `https://wa.me/${waNum}`;
          waBtn.style.display = 'flex';
        }
      }
    }
  } catch(e) { console.error('Settings load error:', e); }

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  return { user, profile };
}

async function runSearch(query) {
  const overlay = document.getElementById('search-overlay');
  const results = document.getElementById('search-results');
  if (!overlay || !results) return;

  overlay.style.display = 'block';
  results.style.display = 'block';
  results.innerHTML = '<p class="text-muted">Searching...</p>';

  try {
    const { supabase } = await import('./supabase.js');
    const { data, error } = await supabase
      .from('products')
      .select('id, name, slug, price, product_media(url, sort_order)')
      .eq('is_published', true)
      .ilike('name', `%${query}%`)
      .limit(6);

    if (error || !data || data.length === 0) {
      results.innerHTML = '<p class="text-muted">No products found.</p>';
      return;
    }

    results.innerHTML = data.map(p => {
      const img = p.product_media && p.product_media.length > 0
        ? p.product_media.sort((a,b) => a.sort_order - b.sort_order)[0].url
        : 'https://placehold.co/60x60?text=No+Image';
      return `
        <a href="./product.html?slug=${p.slug}" onclick="document.getElementById('search-overlay').style.display='none';document.getElementById('search-results').style.display='none';" style="display:flex; align-items:center; gap:1rem; padding:0.75rem; border-radius:var(--radius-md); transition:background 0.2s;" onmouseover="this.style.background='var(--color-bg-secondary)'" onmouseout="this.style.background=''">
          <img src="${img}" alt="${p.name}" style="width:50px;height:50px;object-fit:cover;border-radius:var(--radius-sm);" loading="lazy">
          <div>
            <div style="font-weight:500;">${p.name}</div>
            <div style="color:var(--color-accent);font-weight:600;">₹${p.price}</div>
          </div>
        </a>
      `;
    }).join('');
  } catch(e) {
    results.innerHTML = '<p class="text-muted">Search error.</p>';
  }
}
