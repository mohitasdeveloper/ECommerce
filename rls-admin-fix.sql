-- ============================================================
-- ADMIN RLS FIX — Run this in Supabase SQL Editor
-- This fixes the 400 error on the Admin Orders page
-- ============================================================

-- Step 1: Add missing courier tracking columns (if not already done)
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS courier_name text,
  ADD COLUMN IF NOT EXISTS tracking_id text;

-- Step 2: Drop conflicting policies first (prevents "already exists" errors)
DROP POLICY IF EXISTS "Admins read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin manage products" ON products;
DROP POLICY IF EXISTS "Admin manage categories" ON categories;
DROP POLICY IF EXISTS "Admin manage product_media" ON product_media;
DROP POLICY IF EXISTS "Admin manage product_option_types" ON product_option_types;
DROP POLICY IF EXISTS "Admin manage product_option_values" ON product_option_values;
DROP POLICY IF EXISTS "Admin manage product_variants" ON product_variants;
DROP POLICY IF EXISTS "Admin manage product_details" ON product_details;
DROP POLICY IF EXISTS "Admin manage coupons" ON coupons;
DROP POLICY IF EXISTS "Admin manage orders" ON orders;
DROP POLICY IF EXISTS "Admin manage order_items" ON order_items;
DROP POLICY IF EXISTS "Admin manage reviews" ON reviews;
DROP POLICY IF EXISTS "Admin manage settings" ON settings;
DROP POLICY IF EXISTS "Admin manage blog_posts" ON blog_posts;
DROP POLICY IF EXISTS "Admin manage faqs" ON faqs;
DROP POLICY IF EXISTS "Admin read messages" ON messages;
DROP POLICY IF EXISTS "Users insert own order items" ON order_items;
DROP POLICY IF EXISTS "Users insert own orders" ON orders;

-- Step 3: Re-create all admin policies cleanly
-- Admins can read ALL profiles (needed for customer info in orders)
CREATE POLICY "Admins read all profiles" ON profiles FOR SELECT USING (
  auth.uid() = id
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
);

CREATE POLICY "Admin manage products" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);
CREATE POLICY "Admin manage categories" ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);
CREATE POLICY "Admin manage product_media" ON product_media FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);
CREATE POLICY "Admin manage product_option_types" ON product_option_types FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);
CREATE POLICY "Admin manage product_option_values" ON product_option_values FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);
CREATE POLICY "Admin manage product_variants" ON product_variants FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);
CREATE POLICY "Admin manage product_details" ON product_details FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);
CREATE POLICY "Admin manage coupons" ON coupons FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);
CREATE POLICY "Admin manage orders" ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);
CREATE POLICY "Admin manage order_items" ON order_items FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);
CREATE POLICY "Admin manage reviews" ON reviews FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);
CREATE POLICY "Admin manage settings" ON settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);
CREATE POLICY "Admin manage blog_posts" ON blog_posts FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);
CREATE POLICY "Admin manage faqs" ON faqs FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);
CREATE POLICY "Admin read messages" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);

-- Step 4: User-facing policies (COD support)
CREATE POLICY "Users insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users insert own order items" ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
