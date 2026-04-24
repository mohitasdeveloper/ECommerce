-- ==========================================
-- ECOMMERCE STORE — COMPLETE DATABASE SCHEMA
-- Drops all existing tables and recreates
-- Run this in Supabase SQL Editor
-- ==========================================

-- 1. DROP EVERYTHING
-- DROP TABLE CASCADE automatically removes all policies + constraints
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS faqs CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS wishlist CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS product_details CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS product_option_values CASCADE;
DROP TABLE IF EXISTS product_option_types CASCADE;
DROP TABLE IF EXISTS product_media CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS settings CASCADE;


-- ==========================================
-- 2. CREATE ALL TABLES (exactly as per plan)
-- ==========================================

-- Store settings (key-value)
create table settings (
  key text primary key,
  value text
);
insert into settings values
  ('store_name', 'My Store'),
  ('store_tagline', 'Quality You Can Trust'),
  ('whatsapp_number', '919999999999'),
  ('free_shipping_threshold', '499'),
  ('flat_shipping_charge', '49'),
  ('logo_url', ''),
  ('hero_slides', '[]'),
  ('global_shipping_policy', 'Ships within 2-5 business days.'),
  ('global_return_policy', '7-day return policy on unused items.');

-- User profiles (extends Supabase Auth)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- Addresses
create table addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  pincode text not null,
  phone text not null,
  is_default boolean default false,
  created_at timestamptz default now()
);

-- Categories
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  image_url text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Products
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  category_id uuid references categories(id) on delete set null,
  price numeric not null,
  compare_price numeric,
  stock_status text default 'in_stock' check (stock_status in ('in_stock','out_of_stock')),
  is_featured boolean default false,
  is_published boolean default true,
  created_at timestamptz default now()
);

-- Product media (images + videos, via Cloudinary)
create table product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  url text not null,
  type text default 'image' check (type in ('image','video')),
  public_id text,
  sort_order int default 0
);

-- Flexible variant system
create table product_option_types (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  name text not null,
  display_type text default 'button' check (display_type in ('button','swatch','dropdown')),
  sort_order int default 0
);

create table product_option_values (
  id uuid primary key default gen_random_uuid(),
  option_type_id uuid references product_option_types(id) on delete cascade,
  value text not null,
  color_hex text,
  sort_order int default 0
);

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  sku text,
  price numeric not null,
  compare_price numeric,
  stock_status text default 'in_stock' check (stock_status in ('in_stock','out_of_stock')),
  option_value_ids uuid[],
  media_id uuid references product_media(id) on delete set null
);

-- Extended product info
create table product_details (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade unique,
  specifications jsonb,
  care_instructions text,
  whats_in_box text,
  shipping_policy text,
  return_policy text
);

-- Coupons
create table coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text check (discount_type in ('percent','flat')),
  discount_value numeric not null,
  min_order numeric default 0,
  max_uses int,
  used_count int default 0,
  expires_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Orders
create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  status text default 'pending' check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  subtotal numeric not null,
  discount numeric default 0,
  shipping_charge numeric default 0,
  total numeric not null,
  razorpay_order_id text,
  razorpay_payment_id text,
  coupon_code text,
  shipping_address jsonb,
  created_at timestamptz default now()
);

-- Order items
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  variant_id uuid references product_variants(id) on delete set null,
  quantity int not null,
  price_at_purchase numeric not null,
  product_snapshot jsonb
);

-- Reviews
create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  rating int check (rating between 1 and 5),
  title text,
  body text,
  is_approved boolean default false,
  created_at timestamptz default now()
);

-- Wishlist
create table wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  unique(user_id, product_id)
);

-- Blog posts
create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  body text,
  thumbnail_url text,
  published_at timestamptz,
  created_at timestamptz default now()
);

-- FAQs
create table faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order int default 0
);

-- Contact messages
create table messages (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  subject text,
  body text,
  created_at timestamptz default now()
);


-- ==========================================
-- 3. AUTO-CREATE PROFILE ON SIGNUP
-- ==========================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, is_admin)
  values (new.id, new.raw_user_meta_data->>'full_name', false);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ==========================================
-- 4. ROW LEVEL SECURITY
-- ==========================================

-- Enable RLS on user-specific tables
alter table profiles enable row level security;
alter table addresses enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table wishlist enable row level security;
alter table reviews enable row level security;

-- Enable RLS on public-read tables too (so policies are enforced)
alter table products enable row level security;
alter table categories enable row level security;
alter table settings enable row level security;
alter table product_media enable row level security;
alter table product_option_types enable row level security;
alter table product_option_values enable row level security;
alter table product_variants enable row level security;
alter table product_details enable row level security;
alter table coupons enable row level security;
alter table blog_posts enable row level security;
alter table faqs enable row level security;
alter table messages enable row level security;

-- Profiles: users manage own profile
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Addresses: users manage own addresses
create policy "Users manage own addresses" on addresses for all using (auth.uid() = user_id);

-- Orders: users see own orders, users can insert own orders
create policy "Users see own orders" on orders for select using (auth.uid() = user_id);
create policy "Users insert own orders" on orders for insert with check (auth.uid() = user_id);

-- Order items: users see own order items
create policy "Users see own order items" on order_items for select using (
  exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);

-- Wishlist: users manage own wishlist
create policy "Users manage own wishlist" on wishlist for all using (auth.uid() = user_id);

-- Reviews: anyone reads approved reviews, logged-in users create
create policy "Anyone reads approved reviews" on reviews for select using (is_approved = true);
create policy "Logged-in users create reviews" on reviews for insert with check (auth.uid() = user_id);

-- Public read for store content
create policy "Public read products" on products for select using (is_published = true);
create policy "Public read categories" on categories for select using (true);
create policy "Public read blog" on blog_posts for select using (published_at is not null);
create policy "Public read faqs" on faqs for select using (true);
create policy "Public read settings" on settings for select using (true);
create policy "Public read product_media" on product_media for select using (true);
create policy "Public read product_option_types" on product_option_types for select using (true);
create policy "Public read product_option_values" on product_option_values for select using (true);
create policy "Public read product_variants" on product_variants for select using (true);
create policy "Public read product_details" on product_details for select using (true);
create policy "Public read coupons" on coupons for select using (is_active = true);

-- Messages: anyone can insert (contact form)
create policy "Anyone can send messages" on messages for insert with check (true);

-- ==========================================
-- 5. ADMIN POLICIES
-- Uses service_role key in Edge Functions for writes.
-- For admin panel via anon key, we add admin write policies.
-- These safely reference profiles since profiles SELECT
-- only returns the user's own row (no recursion possible).
-- ==========================================

create policy "Admins read all profiles" on profiles for select using (
  exists (select 1 from auth.users where auth.users.id = auth.uid() and auth.uid() = profiles.id)
  or exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
);
-- Note: The above might cause recursion. Safer approach for admin:
-- Admin operations should use the Supabase service_role key in Edge Functions.
-- For the frontend admin panel, we grant broad access:

-- Drop the complex one and use simpler approach
drop policy if exists "Admins read all profiles" on profiles;

-- Admin write policies for content tables (safe - no self-reference)
create policy "Admin manage products" on products for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
);
create policy "Admin manage categories" on categories for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
);
create policy "Admin manage product_media" on product_media for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
);
create policy "Admin manage product_option_types" on product_option_types for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
);
create policy "Admin manage product_option_values" on product_option_values for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
);
create policy "Admin manage product_variants" on product_variants for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
);
create policy "Admin manage product_details" on product_details for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
);
create policy "Admin manage coupons" on coupons for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
);
create policy "Admin manage orders" on orders for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
);
create policy "Admin manage order_items" on order_items for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
);
create policy "Admin manage reviews" on reviews for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
);
create policy "Admin manage settings" on settings for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
);
create policy "Admin manage blog_posts" on blog_posts for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
);
create policy "Admin manage faqs" on faqs for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
);
create policy "Admin read messages" on messages for select using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
);


-- ==========================================
-- 6. SEED CATEGORIES
-- ==========================================

insert into categories (name, slug, image_url, sort_order) values
  ('Electronics', 'electronics', null, 1),
  ('Clothing', 'clothing', null, 2),
  ('Footwear', 'footwear', null, 3),
  ('Accessories', 'accessories', null, 4);
