-- [COMPLETE RESET SQL]
-- This script cleans up ANY previous policies with similar names to prevent conflicts
-- and then re-applies the correct public access policies.

-- 1. Coupon Issues (Wallet History)
ALTER TABLE coupon_issues ENABLE ROW LEVEL SECURITY;
-- Drop ALL potential previous names to avoid "already exists" error
DROP POLICY IF EXISTS "Public read coupon_issues" ON coupon_issues;
DROP POLICY IF EXISTS "Public insert coupon_issues" ON coupon_issues;
DROP POLICY IF EXISTS "Enable insert for anyone" ON coupon_issues;
DROP POLICY IF EXISTS "Enable select for anyone" ON coupon_issues;
-- Create Fresh
CREATE POLICY "Public read coupon_issues" ON coupon_issues FOR SELECT TO public USING (true);
CREATE POLICY "Public insert coupon_issues" ON coupon_issues FOR INSERT TO public WITH CHECK (true);

-- 2. Stores (Category Loading)
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read stores" ON stores;
CREATE POLICY "Public read stores" ON stores FOR SELECT TO public USING (true);

-- 3. Products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read products" ON products;
CREATE POLICY "Public read products" ON products FOR SELECT TO public USING (true);

-- 4. Coupons
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read coupons" ON coupons;
CREATE POLICY "Public read coupons" ON coupons FOR SELECT TO public USING (true);
