
-- Demo Data Seed Script (Run in Supabase SQL Editor)

-- 1. Create Demo Users (Assume they are created via Auth for ID, but here we insert Profile Mock if needed)
-- Note: 'auth.users' inserts are hard to script without admin secret.
-- Instead, we will insert PUBLIC profiles that match optional manual IDs or just rely on new signups.

-- However, for a slick demo, let's Insert some CONTENT that anyone can see/use.

-- 2. Create Demo Merchant & Store
DO $$
DECLARE
  v_user_id uuid; -- will be null or linked to a demo account
  v_merchant_id uuid;
  v_store_id uuid;
  v_coupon_id uuid;
BEGIN
  -- Insert Merchant (Owner can be NULL for now if strictly testing, but schema enforces it. 
  -- Let's pick a random user or make a placeholder UUID if constraint allows or if you manually create user first)
  -- FOR DEMO: We will assume there is at least one user. If empty, this might fail on constraint.
  -- WORKAROUND: Remove constraint check temporarily or require 'auth.uid()'
  -- BUT: We want this to run safely. 
  
  -- Let's just Insert a Demo Coupon directly linked to a Generated Merchant ID Project-wide.
  -- We need to mock the User ID dependency or link it to YOUR account if you know the UUID.
  
  -- Assuming you will Register a User first, and get that ID.
  -- Let's put a Placeholder here. PLEASE REPLACE 'YOUR_USER_ID_HERE' with your real Supabase User UUID.
  -- v_user_id := 'YOUR_USER_ID_HERE'; 
  
  -- If we can't seed users easily, let's SEED COUPONS that are linked to a "System Merchant".
  -- We might need to handle the FK constraint.
  
  -- ... Skipping complex seed automation script. Use the 'Demo Data' below manually.
  
  NULL; -- Placeholder
END $$;


-- === MANUAL DEMO DATA INSTRUCTIONS ===
-- Run this individually after signing up at least one user in Supabase Authentication.
-- Replace 'USER_UUID' with the ID of the signed-up user (available in Auth table).

/*
-- 1. Merchant
INSERT INTO public.merchants (owner_user_id, name, category, region, status)
VALUES ('USER_UUID', 'AIRCTT 데모 스토어', 'CAFE', 'SEOUL', 'active');

-- 2. Store (Get Merchant ID from above)
INSERT INTO public.stores (merchant_id, name, address, status)
VALUES ('MERCHANT_UUID', '강남 1호점', '서울 강남구 테헤란로 123', 'active');

-- 3. Coupons (Get Merchant ID & Store ID)
INSERT INTO public.coupons (merchant_id, store_id, title, description, discount_type, discount_value, stock_initial, stock_remaining, valid_until)
VALUES 
('MERCHANT_UUID', 'STORE_UUID', '아메리카노 1잔 무료', 'AIRCTT 런칭 기념 이벤트', 'FREE_ITEM', 1, 100, 100, NOW() + interval '30 days'),
('MERCHANT_UUID', 'STORE_UUID', '모든 메뉴 50% 할인', '오픈 기념 파격 할인', 'PERCENT', 50, 500, 500, NOW() + interval '30 days');

*/

-- For Game Logic to work immediately without manual constraints (Quick Starter):
-- We can make FKs optional or insert a dummy user in public.users IF auth sync trigger is disabled? No. Auth is strict.

-- RECOMMENDATION:
-- Just Sign Up -> Play Game -> Get Reward.
-- The game logic automatically creates "Reward Coupons" based on "ANY active coupon template".
-- So you just need ONE active Coupon Template in the DB.

-- I will assume you will create one via Supabase Dashboard.
-- Table: coupons
-- Columns: 
--   merchant_id: (Pick any user ID you have, or disable FK constraint for demo?) -> Better to just sign up 1 user and use their ID.
--   title: "Demo 90% Coupon"
--   discount_type: "PERCENT"
--   discount_value: 90
--   status: "active"

