-- Enable RLS on coupon_issues if not already enabled
ALTER TABLE coupon_issues ENABLE ROW LEVEL SECURITY;

-- Allow INSERT for everyone (anon and authenticated)
-- This is critical for the Game -> Wallet flow as consumer might be anon or simulated
DROP POLICY IF EXISTS "Enable insert for anyone" ON coupon_issues;

CREATE POLICY "Enable insert for anyone"
ON coupon_issues
FOR INSERT
TO public
WITH CHECK (true);

-- Allow SELECT for own coupons (assuming user_id matches)
-- Or for Demo, just allow select all to prevent bugs
DROP POLICY IF EXISTS "Enable select for anyone" ON coupon_issues;

CREATE POLICY "Enable select for anyone"
ON coupon_issues
FOR SELECT
TO public
USING (true);
