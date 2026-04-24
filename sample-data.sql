-- ==========================================
-- ECOMMERCE STORE SAMPLE DATA
-- Run this in the Supabase SQL Editor
-- ==========================================

-- Clean up any existing sample data using these UUIDs to prevent errors if run multiple times
DELETE FROM products WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666'
);

-- ==========================================
-- 1. Insert Products
-- ==========================================
INSERT INTO products (id, name, slug, description, price, compare_price, stock_status, is_featured, is_published, category_id)
VALUES 
(
  '11111111-1111-1111-1111-111111111111',
  'Wireless Noise Cancelling Headphones',
  'wireless-headphones',
  'Experience premium sound quality with industry-leading noise cancellation. Perfect for commuting or working in a busy office.',
  14999.00,
  19999.00,
  'in_stock',
  true,
  true,
  (SELECT id FROM categories WHERE slug = 'electronics' LIMIT 1)
),
(
  '22222222-2222-2222-2222-222222222222',
  'Minimalist Smartwatch',
  'minimalist-smartwatch',
  'A sleek, lightweight smartwatch with fitness tracking, heart rate monitoring, and a 7-day battery life.',
  5999.00,
  7999.00,
  'in_stock',
  true,
  true,
  (SELECT id FROM categories WHERE slug = 'electronics' LIMIT 1)
),
(
  '33333333-3333-3333-3333-333333333333',
  'Mechanical Gaming Keyboard',
  'gaming-keyboard',
  'Tactile switches, RGB backlighting, and a durable aluminum frame for the ultimate gaming experience.',
  8499.00,
  NULL,
  'in_stock',
  false,
  true,
  (SELECT id FROM categories WHERE slug = 'electronics' LIMIT 1)
),
(
  '44444444-4444-4444-4444-444444444444',
  'Premium Cotton T-Shirt',
  'premium-cotton-tshirt',
  'Ultra-soft, breathable 100% organic cotton t-shirt. A versatile essential for any wardrobe.',
  999.00,
  1299.00,
  'in_stock',
  true,
  true,
  (SELECT id FROM categories WHERE slug = 'clothing' LIMIT 1)
),
(
  '55555555-5555-5555-5555-555555555555',
  'Classic Denim Jacket',
  'classic-denim-jacket',
  'A timeless denim jacket featuring a relaxed fit, silver-tone hardware, and durable construction.',
  3499.00,
  4999.00,
  'in_stock',
  false,
  true,
  (SELECT id FROM categories WHERE slug = 'clothing' LIMIT 1)
),
(
  '66666666-6666-6666-6666-666666666666',
  'Running Sneakers Pro',
  'running-sneakers',
  'Lightweight performance sneakers with responsive cushioning to keep you comfortable on long runs.',
  4999.00,
  6499.00,
  'in_stock',
  true,
  true,
  (SELECT id FROM categories WHERE slug = 'clothing' LIMIT 1)
);

-- ==========================================
-- 2. Insert Product Images (Media)
-- Using high-quality placeholder images from Unsplash
-- ==========================================
INSERT INTO product_media (product_id, url, sort_order)
VALUES 
-- Headphones
('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop', 0),
('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1000&auto=format&fit=crop', 1),

-- Smartwatch
('22222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1000&auto=format&fit=crop', 0),
('22222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=1000&auto=format&fit=crop', 1),

-- Keyboard
('33333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=1000&auto=format&fit=crop', 0),

-- T-Shirt
('44444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop', 0),

-- Denim Jacket
('55555555-5555-5555-5555-555555555555', 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=1000&auto=format&fit=crop', 0),

-- Sneakers
('66666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop', 0),
('66666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1000&auto=format&fit=crop', 1);

-- ==========================================
-- 3. Insert Sample Coupons
-- ==========================================
INSERT INTO coupons (code, discount_type, discount_value, min_order, max_uses, is_active)
VALUES 
('WELCOME10', 'percent', 10.00, 0, NULL, true),
('FLAT500', 'flat', 500.00, 2000.00, 100, true)
ON CONFLICT (code) DO NOTHING;
