-- ==========================================
-- MIGRATION: Add courier tracking fields to orders table
-- Run this in your Supabase SQL Editor
-- ==========================================

ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS courier_name text,
  ADD COLUMN IF NOT EXISTS tracking_id text;
