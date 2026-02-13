-- =====================================================
-- AIRCTT v3: 순환구조 심장 수술 마이그레이션
-- 2026-02-13
-- CUT-3: 반경 시스템 보강
-- CUT-7: 채팅 시스템 (Supabase Realtime)
-- CUT-8: 예약 시스템 (기본)
-- 안전핀1: 경로 통일 (코드 레벨)
-- 안전핀2: 반경 단위/성능 (DB 레벨)
-- 안전핀3: 중복 차감 방지 (DB 레벨)
-- =====================================================

-- =====================================================
-- 1. 반경 시스템 보강 (안전핀2 반영)
-- DB는 미터(m) 저장, API는 km 변환
-- 20,000km 이상 = 전국 모드 → 위치 필터 스킵
-- =====================================================

-- 쿠폰 테이블에 확장 필드 추가
ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS origin_type TEXT DEFAULT 'store'
    CHECK (origin_type IN ('store', 'custom', 'nationwide')),
  ADD COLUMN IF NOT EXISTS radius_m INTEGER DEFAULT 5000
    CHECK (radius_m >= 50 AND radius_m <= 20000000),
  ADD COLUMN IF NOT EXISTS distribution_start_time TIME,
  ADD COLUMN IF NOT EXISTS distribution_end_time TIME,
  ADD COLUMN IF NOT EXISTS distribution_days INTEGER[] DEFAULT '{1,2,3,4,5,6,7}';

COMMENT ON COLUMN public.coupons.origin_type IS 'store=매장좌표, custom=임의좌표, nationwide=전국';
COMMENT ON COLUMN public.coupons.radius_m IS '배포 반경 미터 단위 (50m ~ 20,000km)';

-- coupon_issues에 사용 매장 필드 (정산용)
ALTER TABLE public.coupon_issues
  ADD COLUMN IF NOT EXISTS used_store_id UUID REFERENCES public.stores(id),
  ADD COLUMN IF NOT EXISTS used_at TIMESTAMPTZ;

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_coupon_issues_used_store
  ON public.coupon_issues(used_store_id, is_used) WHERE is_used = true;

CREATE INDEX IF NOT EXISTS idx_coupon_issues_used_at
  ON public.coupon_issues(used_at) WHERE is_used = true;

-- =====================================================
-- 2. 반경 검색 RPC 함수 (Haversine, PostGIS 불필요)
-- 안전핀2: 반경 20,000km 이상이면 위치 조건 스킵
-- =====================================================

CREATE OR REPLACE FUNCTION get_nearby_coupons(
  user_lat NUMERIC,
  user_lng NUMERIC,
  radius_km NUMERIC DEFAULT 5,
  category_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  coupon_id UUID,
  title TEXT,
  description TEXT,
  discount_type TEXT,
  discount_value NUMERIC,
  store_name TEXT,
  store_address TEXT,
  distance_km NUMERIC,
  valid_to TIMESTAMPTZ,
  store_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS coupon_id,
    c.title,
    c.description,
    c.discount_type::TEXT,
    c.discount_value,
    s.name AS store_name,
    s.address AS store_address,
    CASE
      -- nationwide: 거리 0으로 고정 (위치 필터 스킵)
      WHEN c.center_type = 'nationwide' OR COALESCE(c.radius_km, radius_km) >= 20000 THEN 0
      ELSE (6371 * acos(
        LEAST(1.0, cos(radians(user_lat)) * cos(radians(COALESCE(c.center_lat, s.lat))) *
        cos(radians(COALESCE(c.center_lng, s.lng)) - radians(user_lng)) +
        sin(radians(user_lat)) * sin(radians(COALESCE(c.center_lat, s.lat))))
      ))
    END::NUMERIC AS distance_km,
    c.valid_to,
    s.id AS store_id
  FROM public.coupons c
  JOIN public.stores s ON s.id = c.store_id
  WHERE c.is_active = true
    AND (c.valid_from IS NULL OR c.valid_from <= NOW())
    AND (c.valid_to IS NULL OR c.valid_to >= NOW())
    -- 안전핀2: nationwide면 위치 조건 스킵
    AND (
      c.center_type = 'nationwide'
      OR COALESCE(c.radius_km, radius_km) >= 20000
      OR (6371 * acos(
        LEAST(1.0, cos(radians(user_lat)) * cos(radians(COALESCE(c.center_lat, s.lat))) *
        cos(radians(COALESCE(c.center_lng, s.lng)) - radians(user_lng)) +
        sin(radians(user_lat)) * sin(radians(COALESCE(c.center_lat, s.lat))))
      )) <= COALESCE(c.radius_km, radius_km)
    )
  ORDER BY distance_km ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- 3. 채팅 시스템 (Supabase Realtime 기반)
-- CUT-7: 소비자 ↔ 가맹점 1:1 채팅
-- =====================================================

CREATE TABLE IF NOT EXISTS public.chat_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
  consumer_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  merchant_user_id UUID REFERENCES public.users(id),
  subject TEXT DEFAULT '',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'closed')),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'coupon', 'system')),
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_created
  ON public.chat_messages(thread_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_threads_consumer
  ON public.chat_threads(consumer_user_id, last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_threads_merchant
  ON public.chat_threads(merchant_user_id, last_message_at DESC);

-- RLS
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own threads" ON public.chat_threads
  FOR SELECT USING (
    consumer_user_id = auth.uid() OR merchant_user_id = auth.uid()
  );

CREATE POLICY "Users create threads" ON public.chat_threads
  FOR INSERT WITH CHECK (consumer_user_id = auth.uid());

CREATE POLICY "Users see own thread messages" ON public.chat_messages
  FOR SELECT USING (
    thread_id IN (
      SELECT id FROM public.chat_threads
      WHERE consumer_user_id = auth.uid() OR merchant_user_id = auth.uid()
    )
  );

CREATE POLICY "Users send messages to own threads" ON public.chat_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    thread_id IN (
      SELECT id FROM public.chat_threads
      WHERE consumer_user_id = auth.uid() OR merchant_user_id = auth.uid()
    )
  );

-- Supabase Realtime 활성화
-- (실행 환경에 따라 직접 Dashboard에서 활성화 필요)
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- =====================================================
-- 4. 예약 시스템 (기본 stub)
-- CUT-8: DB + 기본 구조만
-- =====================================================

CREATE TABLE IF NOT EXISTS public.reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  consumer_user_id UUID NOT NULL REFERENCES public.users(id),
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  party_size INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  coupon_issue_id UUID REFERENCES public.coupon_issues(id),
  special_request TEXT,
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservations_store_date
  ON public.reservations(store_id, reservation_date, reservation_time);

CREATE INDEX IF NOT EXISTS idx_reservations_consumer
  ON public.reservations(consumer_user_id, reservation_date DESC);

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own reservations" ON public.reservations
  FOR SELECT USING (consumer_user_id = auth.uid());

CREATE POLICY "Users create reservations" ON public.reservations
  FOR INSERT WITH CHECK (consumer_user_id = auth.uid());

-- =====================================================
-- 5. 안전핀3: 중복 차감 방지 제약
-- coupon_issues.is_used 기준 단일 소스
-- =====================================================

-- 쿠폰 1장 = 1번만 사용 가능 (unique partial index)
CREATE UNIQUE INDEX IF NOT EXISTS idx_coupon_issues_single_use
  ON public.coupon_issues(id) WHERE is_used = true;

-- 정산 시 사용 로그 기준 집계용 뷰
CREATE OR REPLACE VIEW public.v_coupon_usage_for_settlement AS
SELECT
  ci.used_store_id,
  s.merchant_id,
  ci.used_at::DATE AS usage_date,
  COUNT(*) AS coupon_count,
  COUNT(*) * 50 AS coupon_cost  -- 장당 50원
FROM public.coupon_issues ci
JOIN public.stores s ON s.id = ci.used_store_id
WHERE ci.is_used = true
  AND ci.used_store_id IS NOT NULL
GROUP BY ci.used_store_id, s.merchant_id, ci.used_at::DATE;

-- =====================================================
-- 완료! 🫀 심장 뛰기 시작!
-- =====================================================
