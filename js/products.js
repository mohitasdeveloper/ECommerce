import { supabase } from './supabase.js';
import { isInWishlist, toggleWishlist } from './wishlist.js';
import { addToCart } from './cart.js';
import { showToast } from './toast.js';

export async function fetchProducts(options = {}) {
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(name, slug),
      media:product_media(url, type, sort_order)
    `)
    .eq('is_published', true);

  if (options.featuredOnly) {
    query = query.eq('is_featured', true);
  }
  
  if (options.categorySlug) {
    const { data: catData } = await supabase.from('categories').select('id').eq('slug', options.categorySlug).single();
    if (catData) {
      query = query.eq('category_id', catData.id);
    }
  }

  if (options.inStockOnly) {
    query = query.eq('stock_status', 'in_stock');
  }

  // Handle simple sorting for now
  if (options.sortBy === 'price_asc') {
    query = query.order('price', { ascending: true });
  } else if (options.sortBy === 'price_desc') {
    query = query.order('price', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false }); // default newest
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  // Process media to get main image
  return data.map(product => {
    product.main_image_url = product.media && product.media.length > 0 
      ? product.media.sort((a,b) => a.sort_order - b.sort_order)[0].url 
      : 'https://placehold.co/400x500?text=No+Image'; // Fallback
      
    product.hover_image_url = product.media && product.media.length > 1
      ? product.media.sort((a,b) => a.sort_order - b.sort_order)[1].url
      : product.main_image_url;
      
    return product;
  });
}

export function renderProductCards(products, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (products.length === 0) {
    container.innerHTML = '<div class="col-span-full text-center py-8 text-muted">No products found.</div>';
    return;
  }

  container.innerHTML = products.map(product => {
    const isWished = isInWishlist(product.id);
    
    return `
      <div class="product-card">
        <a href="./product.html?slug=${product.slug}" class="product-card-img-link">
          <div class="product-card-img" onmouseenter="this.querySelector('img').src='${product.hover_image_url}'" onmouseleave="this.querySelector('img').src='${product.main_image_url}'">
            <img src="${product.main_image_url}" alt="${product.name}" loading="lazy">
            <button class="action-btn wishlist-btn absolute top-2 right-2 bg-white" data-id="${product.id}" aria-label="Toggle Wishlist" style="position:absolute; top:8px; right:8px; background:white;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="${isWished ? 'var(--color-danger)' : 'none'}" stroke="${isWished ? 'var(--color-danger)' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </button>
          </div>
        </a>
        <div class="product-card-info">
          ${product.category ? `<div class="product-category">${product.category.name}</div>` : ''}
          <a href="./product.html?slug=${product.slug}"><h3 class="product-title">${product.name}</h3></a>
          <div class="d-flex align-center justify-between mt-4">
            <div>
              <span class="product-price">₹${product.price}</span>
              ${product.compare_price && product.compare_price > product.price ? `<span class="compare-price">₹${product.compare_price}</span>` : ''}
            </div>
            <button class="btn btn-primary btn-sm add-to-cart-btn" data-id="${product.id}" ${product.stock_status === 'out_of_stock' ? 'disabled' : ''}>
              ${product.stock_status === 'out_of_stock' ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Attach event listeners
  container.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const productId = btn.getAttribute('data-id');
      const isNowWished = await toggleWishlist(productId);
      const svg = btn.querySelector('svg');
      if (isNowWished) {
        svg.setAttribute('fill', 'var(--color-danger)');
        svg.setAttribute('stroke', 'var(--color-danger)');
      } else {
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
      }
    });
  });

  container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const productId = btn.getAttribute('data-id');
      const product = products.find(p => p.id === productId);
      
      // If product might have variants, ideally we route them to product page.
      // For simplicity here, we add base product. Real implementation checks variant table.
      // Here, we just add the base product.
      if (product) {
        addToCart(product);
      }
    });
  });
}

// Global listener for wishlist updates from other components
window.addEventListener('wishlistUpdated', (e) => {
  const wishlist = e.detail;
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    const id = btn.getAttribute('data-id');
    const svg = btn.querySelector('svg');
    if (wishlist.includes(id)) {
      svg.setAttribute('fill', 'var(--color-danger)');
      svg.setAttribute('stroke', 'var(--color-danger)');
    } else {
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
    }
  });
});
