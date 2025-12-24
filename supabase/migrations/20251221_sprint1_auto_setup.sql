-- AIRCTT Sprint 1: 가맹점 기본틀 자동 생성
-- Date: 2025-12-21
-- 요구사항: 가맹점 등록 → Store 자동 생성 → 쿠폰 템플릿 추천

-- =========================================================
-- 1. generate_slug(text) 함수 생성
--    - 소문자 변환
--    - 특수문자/공백 → 하이픈(-) 치환
--    - 중복 시 숫자 suffix 추가
-- =========================================================

CREATE OR REPLACE FUNCTION public.generate_slug(input_text TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- NULL 또는 빈 문자열 처리
    IF input_text IS NULL OR trim(input_text) = '' THEN
        RETURN 'item-' || substr(md5(random()::text), 1, 8);
    END IF;

    -- 1. 소문자 변환
    base_slug := lower(input_text);

    -- 2. 한글, 영문, 숫자를 제외한 모든 문자 → 하이픈 치환
    base_slug := regexp_replace(base_slug, '[^a-z0-9가-힣]+', '-', 'g');

    -- 3. 연속 하이픈 제거
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');

    -- 4. 앞뒤 하이픈 제거
    base_slug := trim(both '-' from base_slug);

    -- 5. 빈 문자열 방지
    IF base_slug = '' OR base_slug IS NULL THEN
        base_slug := 'store-' || substr(md5(random()::text), 1, 8);
    END IF;

    -- 6. 중복 체크 (merchants 테이블 기준)
    final_slug := base_slug;
    WHILE EXISTS (SELECT 1 FROM public.merchants WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;

    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- 2. merchants 테이블에 slug 컬럼 추가 (UNIQUE)
-- =========================================================

-- slug 컬럼 추가
ALTER TABLE public.merchants
ADD COLUMN IF NOT EXISTS slug TEXT;

-- UNIQUE 제약조건 추가 (IF NOT EXISTS 지원 안하므로 DO NOTHING 처리)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'merchants_slug_key'
        AND conrelid = 'public.merchants'::regclass
    ) THEN
        ALTER TABLE public.merchants ADD CONSTRAINT merchants_slug_key UNIQUE (slug);
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 기타 필요한 컬럼 추가
ALTER TABLE public.merchants
ADD COLUMN IF NOT EXISTS owner_name TEXT;

ALTER TABLE public.merchants
ADD COLUMN IF NOT EXISTS phone TEXT;

ALTER TABLE public.merchants
ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE public.merchants
ADD COLUMN IF NOT EXISTS address TEXT;

ALTER TABLE public.merchants
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE public.merchants
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending';

-- =========================================================
-- 3. stores 테이블에 slug 컬럼 추가
-- =========================================================

ALTER TABLE public.stores
ADD COLUMN IF NOT EXISTS slug TEXT;

-- 인덱스 추가 (중복 생성 방지)
CREATE INDEX IF NOT EXISTS idx_stores_slug ON public.stores(slug);

-- =========================================================
-- 4. 가맹점 등록 시 slug 자동 생성 트리거
-- =========================================================

CREATE OR REPLACE FUNCTION public.auto_generate_merchant_slug()
RETURNS TRIGGER AS $$
BEGIN
    -- slug가 없으면 자동 생성
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := public.generate_slug(NEW.business_name);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_merchant_slug ON public.merchants;
CREATE TRIGGER trg_auto_merchant_slug
BEFORE INSERT ON public.merchants
FOR EACH ROW
EXECUTE FUNCTION public.auto_generate_merchant_slug();

-- =========================================================
-- 5. 가맹점 등록 시 자동 Store 생성 트리거
-- =========================================================

CREATE OR REPLACE FUNCTION public.auto_create_default_store()
RETURNS TRIGGER AS $$
DECLARE
    new_store_id UUID;
    store_slug TEXT;
BEGIN
    -- Store slug 생성 (가맹점 slug + '-main')
    store_slug := COALESCE(NEW.slug, public.generate_slug(NEW.business_name)) || '-main';

    -- 기본 Store 생성
    INSERT INTO public.stores (
        merchant_id,
        name,
        slug,
        description,
        address,
        phone,
        is_active
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.business_name, '매장') || ' 본점',
        store_slug,
        NEW.description,
        NEW.address,
        NEW.phone,
        true
    )
    RETURNING id INTO new_store_id;

    -- 기본 테이블 생성 (QR 주문용)
    INSERT INTO public.store_tables (
        store_id,
        name,
        zone,
        is_active
    )
    VALUES (
        new_store_id,
        '테이블 1',
        'main',
        true
    );

    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- 오류 발생 시에도 가맹점 생성은 진행
        RAISE NOTICE 'Auto store creation failed: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_create_store ON public.merchants;
CREATE TRIGGER trg_auto_create_store
AFTER INSERT ON public.merchants
FOR EACH ROW
EXECUTE FUNCTION public.auto_create_default_store();

-- =========================================================
-- 6. 쿠폰 템플릿 테이블
-- =========================================================

-- discount_type ENUM이 없으면 생성
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'discount_type') THEN
        CREATE TYPE public.discount_type AS ENUM ('percent', 'amount');
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.coupon_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL DEFAULT 'percent', -- 'percent' or 'amount'
    discount_value NUMERIC NOT NULL,
    min_order_amount NUMERIC DEFAULT 0,
    valid_days INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기본 쿠폰 템플릿 데이터 삽입 (중복 방지)
INSERT INTO public.coupon_templates (category, title, description, discount_type, discount_value, min_order_amount, valid_days, sort_order)
SELECT * FROM (VALUES
    -- 음식점 (restaurant)
    ('restaurant', '첫 방문 감사 쿠폰', '첫 방문 고객님께 드리는 특별 할인', 'percent', 10::numeric, 15000::numeric, 30, 1),
    ('restaurant', '점심 특가 할인', '점심시간 한정 특별 할인', 'amount', 3000::numeric, 10000::numeric, 14, 2),
    ('restaurant', '2인 이상 음료 서비스', '2인 이상 방문 시 음료 무료', 'amount', 5000::numeric, 30000::numeric, 30, 3),

    -- 카페 (cafe)
    ('cafe', '첫 음료 할인', '첫 방문 고객 음료 할인', 'percent', 20::numeric, 0::numeric, 30, 1),
    ('cafe', '세트 할인', '음료+디저트 세트 주문 시 할인', 'amount', 2000::numeric, 8000::numeric, 14, 2),
    ('cafe', '스탬프 적립 보상', '10잔 구매 시 1잔 무료', 'percent', 100::numeric, 0::numeric, 90, 3),

    -- 문화/공연 (culture)
    ('culture', '평일 할인', '월~목 공연 할인', 'percent', 20::numeric, 0::numeric, 30, 1),
    ('culture', '동반 1인 무료', '2인 이상 예매 시 1인 무료', 'percent', 50::numeric, 0::numeric, 14, 2),
    ('culture', '조기예매 할인', '공연 7일 전 예매 시 할인', 'percent', 15::numeric, 0::numeric, 7, 3),

    -- 쇼핑/패션 (shopping)
    ('shopping', '신규회원 할인', '첫 구매 고객 할인', 'percent', 10::numeric, 0::numeric, 30, 1),
    ('shopping', '5만원 이상 할인', '5만원 이상 구매 시 할인', 'amount', 5000::numeric, 50000::numeric, 30, 2),
    ('shopping', '리뷰 작성 적립금', '리뷰 작성 시 적립금 지급', 'amount', 2000::numeric, 0::numeric, 90, 3),

    -- 뷰티/운동 (beauty)
    ('beauty', '첫 이용 할인', '첫 방문 고객 특별 할인', 'percent', 30::numeric, 0::numeric, 30, 1),
    ('beauty', '재방문 할인', '30일 내 재방문 시 할인', 'percent', 15::numeric, 0::numeric, 30, 2),
    ('beauty', '친구 추천 쿠폰', '친구 추천 시 양쪽 모두 할인', 'amount', 10000::numeric, 0::numeric, 60, 3)
) AS t(category, title, description, discount_type, discount_value, min_order_amount, valid_days, sort_order)
WHERE NOT EXISTS (
    SELECT 1 FROM public.coupon_templates ct
    WHERE ct.category = t.category AND ct.title = t.title
);

-- =========================================================
-- 7. 인덱스 추가
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_merchants_slug ON public.merchants(slug);
CREATE INDEX IF NOT EXISTS idx_merchants_approval ON public.merchants(approval_status);
CREATE INDEX IF NOT EXISTS idx_stores_merchant ON public.stores(merchant_id);
CREATE INDEX IF NOT EXISTS idx_coupon_templates_category ON public.coupon_templates(category);
CREATE INDEX IF NOT EXISTS idx_coupon_templates_active ON public.coupon_templates(is_active, category);

-- =========================================================
-- 8. 기존 데이터 slug 업데이트 (NULL인 경우)
-- =========================================================

UPDATE public.merchants
SET slug = public.generate_slug(business_name)
WHERE slug IS NULL AND business_name IS NOT NULL;

UPDATE public.stores
SET slug = (
    SELECT m.slug || '-' ||
    CASE WHEN s.name LIKE '%본점%' THEN 'main'
         ELSE lower(regexp_replace(s.name, '[^a-z0-9가-힣]+', '-', 'gi'))
    END
    FROM public.merchants m
    WHERE m.id = stores.merchant_id
)
WHERE slug IS NULL;
