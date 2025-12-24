-- AIRCTT Sprint 2: 쿠폰 순환 구조 & 통계
-- Date: 2025-12-21

-- =========================================================
-- 1. 쿠폰 통계 테이블
-- =========================================================

CREATE TABLE IF NOT EXISTS public.coupon_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- 발급 통계
    issued_count INTEGER DEFAULT 0,

    -- 사용 통계
    used_count INTEGER DEFAULT 0,

    -- 만료 통계
    expired_count INTEGER DEFAULT 0,

    -- 노출 통계
    view_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,

    -- 전환율 (사용/발급)
    conversion_rate NUMERIC(5,2) DEFAULT 0,

    -- 매출 기여
    total_discount_amount NUMERIC DEFAULT 0,
    total_order_amount NUMERIC DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(coupon_id, date)
);

CREATE INDEX IF NOT EXISTS idx_coupon_stats_coupon_date ON public.coupon_stats(coupon_id, date);
CREATE INDEX IF NOT EXISTS idx_coupon_stats_date ON public.coupon_stats(date);

-- =========================================================
-- 2. 가맹점 일일 통계 테이블
-- =========================================================

CREATE TABLE IF NOT EXISTS public.merchant_daily_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- 쿠폰 통계
    coupons_issued INTEGER DEFAULT 0,
    coupons_used INTEGER DEFAULT 0,
    coupons_expired INTEGER DEFAULT 0,

    -- 방문/고객 통계
    unique_visitors INTEGER DEFAULT 0,
    new_customers INTEGER DEFAULT 0,
    returning_customers INTEGER DEFAULT 0,

    -- 매출 통계
    total_orders INTEGER DEFAULT 0,
    total_revenue NUMERIC DEFAULT 0,
    total_discount NUMERIC DEFAULT 0,

    -- 게임/이벤트 통계
    game_plays INTEGER DEFAULT 0,
    game_wins INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(merchant_id, store_id, date)
);

CREATE INDEX IF NOT EXISTS idx_merchant_stats_date ON public.merchant_daily_stats(merchant_id, date);

-- =========================================================
-- 3. 쿠폰 노출 로그 (조회 추적)
-- =========================================================

CREATE TABLE IF NOT EXISTS public.coupon_impressions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id),
    session_id TEXT,

    -- 노출 컨텍스트
    source TEXT, -- 'market', 'store', 'game', 'search', 'share'
    lat NUMERIC(9,6),
    lng NUMERIC(9,6),
    distance_km NUMERIC,

    -- 액션
    action TEXT DEFAULT 'view', -- 'view', 'click', 'issue', 'use'

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_impressions_coupon ON public.coupon_impressions(coupon_id, created_at);
CREATE INDEX IF NOT EXISTS idx_impressions_user ON public.coupon_impressions(user_id, created_at);

-- =========================================================
-- 4. 쿠폰 발급 시 통계 자동 업데이트 트리거
-- =========================================================

CREATE OR REPLACE FUNCTION public.update_coupon_stats_on_issue()
RETURNS TRIGGER AS $$
BEGIN
    -- 일일 쿠폰 통계 업데이트 (upsert)
    INSERT INTO public.coupon_stats (coupon_id, date, issued_count)
    VALUES (NEW.coupon_id, CURRENT_DATE, 1)
    ON CONFLICT (coupon_id, date)
    DO UPDATE SET
        issued_count = coupon_stats.issued_count + 1,
        updated_at = NOW();

    -- 가맹점 일일 통계 업데이트
    INSERT INTO public.merchant_daily_stats (merchant_id, date, coupons_issued)
    SELECT c.merchant_id, CURRENT_DATE, 1
    FROM public.coupons c WHERE c.id = NEW.coupon_id
    ON CONFLICT (merchant_id, store_id, date)
    DO UPDATE SET
        coupons_issued = merchant_daily_stats.coupons_issued + 1,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_coupon_issue_stats ON public.coupon_issues;
CREATE TRIGGER trg_coupon_issue_stats
AFTER INSERT ON public.coupon_issues
FOR EACH ROW
EXECUTE FUNCTION public.update_coupon_stats_on_issue();

-- =========================================================
-- 5. 쿠폰 사용 시 통계 자동 업데이트 트리거
-- =========================================================

CREATE OR REPLACE FUNCTION public.update_coupon_stats_on_use()
RETURNS TRIGGER AS $$
BEGIN
    -- 사용 처리된 경우만
    IF NEW.is_used = true AND (OLD.is_used = false OR OLD.is_used IS NULL) THEN
        -- 일일 쿠폰 통계 업데이트
        INSERT INTO public.coupon_stats (coupon_id, date, used_count)
        VALUES (NEW.coupon_id, CURRENT_DATE, 1)
        ON CONFLICT (coupon_id, date)
        DO UPDATE SET
            used_count = coupon_stats.used_count + 1,
            conversion_rate = CASE
                WHEN coupon_stats.issued_count > 0
                THEN ROUND((coupon_stats.used_count + 1)::NUMERIC / coupon_stats.issued_count * 100, 2)
                ELSE 0
            END,
            updated_at = NOW();

        -- 가맹점 일일 통계 업데이트
        INSERT INTO public.merchant_daily_stats (merchant_id, date, coupons_used)
        SELECT c.merchant_id, CURRENT_DATE, 1
        FROM public.coupons c WHERE c.id = NEW.coupon_id
        ON CONFLICT (merchant_id, store_id, date)
        DO UPDATE SET
            coupons_used = merchant_daily_stats.coupons_used + 1,
            updated_at = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_coupon_use_stats ON public.coupon_issues;
CREATE TRIGGER trg_coupon_use_stats
AFTER UPDATE ON public.coupon_issues
FOR EACH ROW
EXECUTE FUNCTION public.update_coupon_stats_on_use();

-- =========================================================
-- 6. 반경 기반 쿠폰 조회 함수
-- =========================================================

CREATE OR REPLACE FUNCTION public.get_nearby_coupons(
    user_lat NUMERIC,
    user_lng NUMERIC,
    radius_km NUMERIC DEFAULT 5,
    category_filter TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
    coupon_id UUID,
    merchant_id UUID,
    store_id UUID,
    title TEXT,
    description TEXT,
    discount_type public.discount_type,
    discount_value NUMERIC,
    store_name TEXT,
    store_address TEXT,
    distance_km NUMERIC,
    valid_until TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id AS coupon_id,
        c.merchant_id,
        c.store_id,
        c.title,
        c.description,
        c.discount_type,
        c.discount_value,
        s.name AS store_name,
        s.address AS store_address,
        -- Haversine 거리 계산 (km)
        (6371 * acos(
            cos(radians(user_lat)) * cos(radians(s.lat)) *
            cos(radians(s.lng) - radians(user_lng)) +
            sin(radians(user_lat)) * sin(radians(s.lat))
        )) AS distance_km,
        c.valid_to AS valid_until
    FROM public.coupons c
    JOIN public.stores s ON c.store_id = s.id OR c.merchant_id = s.merchant_id
    JOIN public.merchants m ON c.merchant_id = m.id
    WHERE
        c.is_active = true
        AND (c.valid_from IS NULL OR c.valid_from <= NOW())
        AND (c.valid_to IS NULL OR c.valid_to >= NOW())
        AND s.is_active = true
        AND s.lat IS NOT NULL
        AND s.lng IS NOT NULL
        -- 반경 필터
        AND (6371 * acos(
            cos(radians(user_lat)) * cos(radians(s.lat)) *
            cos(radians(s.lng) - radians(user_lng)) +
            sin(radians(user_lat)) * sin(radians(s.lat))
        )) <= radius_km
        -- 카테고리 필터 (선택)
        AND (category_filter IS NULL OR m.type::TEXT = category_filter)
    ORDER BY distance_km ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- 7. 쿠폰 공유 딥링크 테이블
-- =========================================================

CREATE TABLE IF NOT EXISTS public.coupon_share_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
    short_code TEXT UNIQUE NOT NULL,
    created_by UUID REFERENCES public.users(id),

    -- 통계
    click_count INTEGER DEFAULT 0,
    issue_count INTEGER DEFAULT 0,

    -- 메타
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,

    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_share_links_code ON public.coupon_share_links(short_code);
CREATE INDEX IF NOT EXISTS idx_share_links_coupon ON public.coupon_share_links(coupon_id);

-- =========================================================
-- 8. 재방문 유도 쿠폰 규칙 테이블
-- =========================================================

CREATE TABLE IF NOT EXISTS public.revisit_coupon_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,

    -- 규칙 조건
    trigger_type TEXT NOT NULL, -- 'after_use', 'after_days', 'visit_count'
    trigger_value INTEGER NOT NULL, -- 사용 후 X일, 또는 X번째 방문

    -- 발급할 쿠폰
    reward_coupon_id UUID REFERENCES public.coupons(id),

    -- 설정
    is_active BOOLEAN DEFAULT true,
    max_issues_per_user INTEGER DEFAULT 1,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================
-- 9. RLS 정책
-- =========================================================

ALTER TABLE public.coupon_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revisit_coupon_rules ENABLE ROW LEVEL SECURITY;

-- 통계는 가맹점 소유자만 조회 가능
CREATE POLICY "Merchants can view own coupon stats"
ON public.coupon_stats FOR SELECT
USING (
    coupon_id IN (
        SELECT c.id FROM public.coupons c
        JOIN public.merchant_users mu ON c.merchant_id = mu.merchant_id
        WHERE mu.user_id = auth.uid()
    )
);

CREATE POLICY "Merchants can view own daily stats"
ON public.merchant_daily_stats FOR SELECT
USING (
    merchant_id IN (
        SELECT mu.merchant_id FROM public.merchant_users mu
        WHERE mu.user_id = auth.uid()
    )
);
