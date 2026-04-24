-- ==========================================
-- PROFILES RLS FIX
-- Run this in Supabase SQL Editor
-- Fixes: admins can read all profiles (for order management)
-- ==========================================

-- Allow anyone to read profiles (needed for admin + reviews display)
-- This is safe because profiles only contain name/phone/is_admin (no sensitive data)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Anyone can view profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
