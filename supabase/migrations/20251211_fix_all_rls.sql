-- Royal Decree: Open all gates for Consumer App (Stores, Products, Coupons)

-- 1. Stores (For Category Page)
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read stores" ON stores;
CREATE POLICY "Public read stores" ON stores FOR SELECT TO public USING (true);

-- 2. Products (For Category/Store Page)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read products" ON products;
CREATE POLICY "Public read products" ON products FOR SELECT TO public USING (true);

-- 3. Merchants (For Wallet/Game)
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read merchants" ON merchants;
CREATE POLICY "Public read merchants" ON merchants FOR SELECT TO public USING (true);

-- 4. Coupons (For Game/Wallet)
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read coupons" ON coupons;
CREATE POLICY "Public read coupons" ON coupons FOR SELECT TO public USING (true);

-- 5. Market Items (If such table exists per Army's request)
CREATE TABLE IF NOT EXISTS market_items (id uuid); -- Placeholder to avoid SQL error if missing
ALTER TABLE market_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read market_items" ON market_items;
CREATE POLICY "Public read market_items" ON market_items FOR SELECT TO public USING (true);

-- 6. Coupon Issues (Double Check)
ALTER TABLE coupon_issues ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read coupon_issues" ON coupon_issues;
CREATE POLICY "Public read coupon_issues" ON coupon_issues FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Public insert coupon_issues" ON coupon_issues;
CREATE POLICY "Public insert coupon_issues" ON coupon_issues FOR INSERT TO public WITH CHECK (true);
