-- =====================================================
-- AIRCTT: 기존 DB에 안전하게 누락 필드 추가
-- Supabase SQL Editor → New query → 이 전체 붙여넣기 → Run
-- =====================================================

-- 0. UUID 확장 확인
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. coupons 테이블 보강
-- (이미 존재하면 ALTER로 필드만 추가)
-- =====================================================

-- 영상 쿠폰 필드
ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS video_autoplay_game BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS video_autoplay_wallet BOOLEAN DEFAULT false;

-- 반경 확장 필드
ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS origin_type TEXT DEFAULT 'store',
  ADD COLUMN IF NOT EXISTS radius_m INTEGER DEFAULT 5000,
  ADD COLUMN IF NOT EXISTS distribution_start_time TIME,
  ADD COLUMN IF NOT EXISTS distribution_end_time TIME,
  ADD COLUMN IF NOT EXISTS distribution_days INTEGER[] DEFAULT '{1,2,3,4,5,6,7}';

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_coupons_merchant_id ON public.coupons(merchant_id);
CREATE INDEX IF NOT EXISTS idx_coupons_store_id ON public.coupons(store_id);
CREATE INDEX IF NOT EXISTS idx_coupons_created_at ON public.coupons(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons(is_active) WHERE is_active = true;

-- =====================================================
-- 2. coupon_issues 테이블 보강
-- =====================================================

-- 사용 매장 필드 (정산용)
ALTER TABLE public.coupon_issues
  ADD COLUMN IF NOT EXISTS used_store_id UUID,
  ADD COLUMN IF NOT EXISTS used_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS campaign_id UUID;

-- ★ 중복 발급 방지 유니크 인덱스 (핵심!)
-- 동일 유저 + 동일 쿠폰 = 미사용 상태에서 1장만
CREATE UNIQUE INDEX IF NOT EXISTS idx_coupon_issues_no_duplicate
  ON public.coupon_issues(user_id, coupon_id)
  WHERE is_used = false;

-- 쿼리 성능 인덱스
CREATE INDEX IF NOT EXISTS idx_coupon_issues_user_id ON public.coupon_issues(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_issues_coupon_id ON public.coupon_issues(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_issues_issued_at ON public.coupon_issues(issued_at DESC);
CREATE INDEX IF NOT EXISTS idx_coupon_issues_used_store
  ON public.coupon_issues(used_store_id, is_used) WHERE is_used = true;

-- =====================================================
-- 3. 데모 데이터 삽입 (테스트용)
-- =====================================================

-- 데모 머천트 (없으면 생성)
INSERT INTO public.merchants (id, name, business_name, business_number)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '데모카페',
  '(주)데모카페',
  '123-45-67890'
) ON CONFLICT (id) DO NOTHING;

-- 데모 매장 (없으면 생성)
INSERT INTO public.stores (id, merchant_id, name, address, lat, lng)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  '데모카페 강남점',
  '서울시 강남구 테헤란로 123',
  37.5065,
  127.0536
) ON CONFLICT (id) DO NOTHING;

-- 데모 쿠폰 3종
INSERT INTO public.coupons (id, merchant_id, store_id, title, description, discount_type, discount_value, is_active, valid_from, valid_to, radius_km, video_url)
VALUES
  ('33333333-3333-3333-3333-333333333333',
   '11111111-1111-1111-1111-111111111111',
   '22222222-2222-2222-2222-222222222222',
   '아메리카노 50% 할인', '첫 방문 고객 대상', 'percent', 50, true,
   NOW(), NOW() + INTERVAL '90 days', 5, NULL),
  ('44444444-4444-4444-4444-444444444444',
   '11111111-1111-1111-1111-111111111111',
   '22222222-2222-2222-2222-222222222222',
   '케이크 무료 증정', '3만원 이상 구매 시', 'free_item', 100, true,
   NOW(), NOW() + INTERVAL '30 days', 3, NULL),
  ('55555555-5555-5555-5555-555555555555',
   '11111111-1111-1111-1111-111111111111',
   '22222222-2222-2222-2222-222222222222',
   '전메뉴 10% 할인', '주말 한정', 'percent', 10, true,
   NOW(), NOW() + INTERVAL '14 days', 10, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
ON CONFLICT (id) DO NOTHING;

-- 데모 사용자에게 쿠폰 1장 발급 (지갑 테스트)
INSERT INTO public.coupon_issues (id, user_id, coupon_id, is_used, issued_from, issued_at)
VALUES (
  '66666666-6666-6666-6666-666666666666',
  '00000000-0000-0000-0000-000000000000',
  '33333333-3333-3333-3333-333333333333',
  false,
  'event',
  NOW()
) ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. RLS 정책 (읽기 허용)
-- =====================================================

-- 쿠폰 읽기 허용 (모두)
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'coupons_read_all') THEN
    CREATE POLICY coupons_read_all ON public.coupons FOR SELECT USING (true);
  END IF;
END$$;

-- 쿠폰 발급 읽기 허용 (모두 - 데모용)
ALTER TABLE public.coupon_issues ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'coupon_issues_read_all') THEN
    CREATE POLICY coupon_issues_read_all ON public.coupon_issues FOR SELECT USING (true);
  END IF;
END$$;

-- 쿠폰 발급 INSERT 허용 (모두 - 데모용)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'coupon_issues_insert_all') THEN
    CREATE POLICY coupon_issues_insert_all ON public.coupon_issues FOR INSERT WITH CHECK (true);
  END IF;
END$$;

-- 쿠폰 발급 UPDATE 허용 (모두 - 데모용)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'coupon_issues_update_all') THEN
    CREATE POLICY coupon_issues_update_all ON public.coupon_issues FOR UPDATE USING (true);
  END IF;
END$$;

-- 매장 읽기 허용
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'stores_read_all') THEN
    CREATE POLICY stores_read_all ON public.stores FOR SELECT USING (true);
  END IF;
END$$;

-- 머천트 읽기 허용
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'merchants_read_all') THEN
    CREATE POLICY merchants_read_all ON public.merchants FOR SELECT USING (true);
  END IF;
END$$;

-- =====================================================
-- 5. 확인 쿼리
-- =====================================================
SELECT 'coupons' AS table_name, COUNT(*) AS row_count FROM public.coupons
UNION ALL
SELECT 'coupon_issues', COUNT(*) FROM public.coupon_issues
UNION ALL
SELECT 'stores', COUNT(*) FROM public.stores
UNION ALL
SELECT 'merchants', COUNT(*) FROM public.merchants;
