import { supabase } from './supabase.js';

export async function fetchProductDetails(slug) {
  // Fetch main product
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name, slug),
      media:product_media(id, url, type, sort_order),
      details:product_details(*),
      option_types:product_option_types(*),
      variants:product_variants(*)
    `)
    .eq('slug', slug)
    .single();

  if (error || !product) {
    console.error('Error fetching product:', error);
    return null;
  }

  // Fetch option values if there are option types
  if (product.option_types && product.option_types.length > 0) {
    const optionTypeIds = product.option_types.map(ot => ot.id);
    const { data: optionValues } = await supabase
      .from('product_option_values')
      .select('*')
      .in('option_type_id', optionTypeIds)
      .order('sort_order', { ascending: true });
      
    // Attach values to types
    product.option_types.forEach(ot => {
      ot.values = optionValues ? optionValues.filter(v => v.option_type_id === ot.id) : [];
    });
  }

  return product;
}

export function findMatchingVariant(product, selectionState) {
  if (!product.variants || product.variants.length === 0) return null;
  
  // selectionState format: { [optionTypeId]: selectedValueId }
  const selectedValueIds = Object.values(selectionState).sort().join(',');
  
  return product.variants.find(v => {
    const variantValueIds = [...v.option_value_ids].sort().join(',');
    return variantValueIds === selectedValueIds;
  });
}

// Logic to build the selection UI goes in the actual product.html script block or an exported render function
