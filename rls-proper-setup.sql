-- ============================================================
-- PROPER RLS SETUP WITH ADMIN SUPPORT
-- Paste this ENTIRE script into Supabase SQL Editor → Run
-- Uses SECURITY DEFINER function to avoid infinite recursion
-- ============================================================

-- STEP 1: Drop ALL existing policies cleanly
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- STEP 2: Add courier tracking columns (safe even if already exists)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_name text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_id text;

-- STEP 3: Create a SECURITY DEFINER helper function
-- This is the KEY to avoiding infinite recursion when checking admin status.
-- It bypasses RLS internally so policies can safely call it.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
$$;

-- STEP 4: Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_option_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 5: PROFILES
-- ============================================================
-- Users can only see/edit their own profile
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  USING (auth.uid() = id OR is_admin());

CREATE POLICY "profiles_insert" ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON profiles FOR UPDATE
  USING (auth.uid() = id OR is_admin());

-- ============================================================
-- STEP 6: ADDRESSES
-- ============================================================
CREATE POLICY "addresses_all_own" ON addresses FOR ALL
  USING (auth.uid() = user_id OR is_admin());

-- ============================================================
-- STEP 7: ORDERS
-- ============================================================
-- Users see their own; admins see all
CREATE POLICY "orders_select" ON orders FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

-- Users can place orders for themselves
CREATE POLICY "orders_insert" ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only admins can update orders (status, tracking, etc.)
CREATE POLICY "orders_update" ON orders FOR UPDATE
  USING (is_admin());

-- ============================================================
-- STEP 8: ORDER ITEMS
-- ============================================================
-- Users see items in their own orders; admins see all
CREATE POLICY "order_items_select" ON order_items FOR SELECT
  USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Users can insert items into their own orders (COD support)
CREATE POLICY "order_items_insert" ON order_items FOR INSERT
  WITH CHECK (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Admins can update/delete order items
CREATE POLICY "order_items_update" ON order_items FOR UPDATE
  USING (is_admin());

CREATE POLICY "order_items_delete" ON order_items FOR DELETE
  USING (is_admin());

-- ============================================================
-- STEP 9: WISHLIST
-- ============================================================
CREATE POLICY "wishlist_own" ON wishlist FOR ALL
  USING (auth.uid() = user_id OR is_admin());

-- ============================================================
-- STEP 10: REVIEWS
-- ============================================================
-- Anyone reads approved reviews; logged-in users create; admins manage all
CREATE POLICY "reviews_select" ON reviews FOR SELECT
  USING (is_approved = true OR auth.uid() = user_id OR is_admin());

CREATE POLICY "reviews_insert" ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_update" ON reviews FOR UPDATE
  USING (is_admin());

CREATE POLICY "reviews_delete" ON reviews FOR DELETE
  USING (is_admin());

-- ============================================================
-- STEP 11: PUBLIC READ TABLES (storefront content)
-- ============================================================
-- Products: published = public, admins see all
CREATE POLICY "products_select" ON products FOR SELECT
  USING (is_published = true OR is_admin());

CREATE POLICY "products_all_admin" ON products FOR ALL
  USING (is_admin());

-- Categories, Settings, FAQs — public read, admin write
CREATE POLICY "categories_select" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_admin" ON categories FOR ALL USING (is_admin());

CREATE POLICY "settings_select" ON settings FOR SELECT USING (true);
CREATE POLICY "settings_admin" ON settings FOR ALL USING (is_admin());

CREATE POLICY "faqs_select" ON faqs FOR SELECT USING (true);
CREATE POLICY "faqs_admin" ON faqs FOR ALL USING (is_admin());

-- Product media / options / variants / details — public read, admin write
CREATE POLICY "product_media_select" ON product_media FOR SELECT USING (true);
CREATE POLICY "product_media_admin" ON product_media FOR ALL USING (is_admin());

CREATE POLICY "product_option_types_select" ON product_option_types FOR SELECT USING (true);
CREATE POLICY "product_option_types_admin" ON product_option_types FOR ALL USING (is_admin());

CREATE POLICY "product_option_values_select" ON product_option_values FOR SELECT USING (true);
CREATE POLICY "product_option_values_admin" ON product_option_values FOR ALL USING (is_admin());

CREATE POLICY "product_variants_select" ON product_variants FOR SELECT USING (true);
CREATE POLICY "product_variants_admin" ON product_variants FOR ALL USING (is_admin());

CREATE POLICY "product_details_select" ON product_details FOR SELECT USING (true);
CREATE POLICY "product_details_admin" ON product_details FOR ALL USING (is_admin());

-- Coupons — active ones readable by authenticated users, admins manage all
CREATE POLICY "coupons_select" ON coupons FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "coupons_admin" ON coupons FOR ALL USING (is_admin());

-- Blog — published readable by everyone, admins manage all
CREATE POLICY "blog_select" ON blog_posts FOR SELECT
  USING (published_at IS NOT NULL OR is_admin());
CREATE POLICY "blog_admin" ON blog_posts FOR ALL USING (is_admin());

-- ============================================================
-- STEP 12: MESSAGES (Contact Form)
-- ============================================================
-- Anyone can submit a message; only admins can read them
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "messages_select" ON messages FOR SELECT USING (is_admin());
CREATE POLICY "messages_admin" ON messages FOR ALL USING (is_admin());

-- ============================================================
-- Done! Verify with:
SELECT 'RLS setup complete with is_admin() security definer function' AS status;
