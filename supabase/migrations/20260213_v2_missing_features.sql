-- ============================================================================
-- AIRCTT 추가 스키마 v2.0 - 빠진 기능 보완
-- Date: 2026-02-13
-- Description: 채팅(쿠톡방), 예약, 배달, 알림, 쿠폰 스케줄 테이블
-- ============================================================================

-- ============================================
-- 1. 채팅 시스템 (쿠톡방)
-- ============================================

CREATE TABLE IF NOT EXISTS public.chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    type TEXT NOT NULL DEFAULT 'direct',
    -- 'direct' (1:1), 'group', 'merchant_support', 'coupon_share'
    store_id UUID REFERENCES public.stores(id),
    merchant_id UUID REFERENCES public.merchants(id),
    created_by UUID REFERENCES public.users(id),
    max_members INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- 'admin', 'moderator', 'member'
    nickname TEXT,
    is_muted BOOLEAN DEFAULT false,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id),
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    -- 'text', 'image', 'coupon_share', 'location', 'system', 'review'
    metadata JSONB DEFAULT '{}',
    -- 쿠폰 공유: { coupon_issue_id, coupon_title, discount, store_name }
    -- 이미지: { url, width, height }
    -- 위치: { lat, lng, address }
    reply_to_id UUID REFERENCES public.chat_messages(id),
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON public.chat_messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_members_user ON public.chat_members(user_id);

ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. 예약 시스템
-- ============================================

CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id),
    user_id UUID REFERENCES public.users(id),
    
    -- 예약자 정보
    guest_name TEXT NOT NULL,
    guest_phone TEXT NOT NULL,
    guest_email TEXT,
    party_size INTEGER DEFAULT 1,
    
    -- 예약 시간
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    
    -- 쿠폰 적용
    coupon_issue_id UUID REFERENCES public.coupon_issues(id),
    discount_amount NUMERIC DEFAULT 0,
    
    -- 상태
    status TEXT DEFAULT 'pending',
    -- 'pending', 'confirmed', 'cancelled', 'completed', 'no_show'
    cancel_reason TEXT,
    
    -- 특이사항
    special_requests TEXT,
    table_preference TEXT, -- '창가', '룸', '바' 등
    
    -- 시간 기록
    confirmed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservations_store ON public.reservations(store_id, reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_user ON public.reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. 배달 주문 시스템
-- ============================================

CREATE TABLE IF NOT EXISTS public.delivery_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id),
    store_id UUID NOT NULL REFERENCES public.stores(id),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id),
    user_id UUID REFERENCES public.users(id),
    
    -- 배달 주소
    delivery_address TEXT NOT NULL,
    delivery_detail_address TEXT,
    delivery_lat NUMERIC(9,6),
    delivery_lng NUMERIC(9,6),
    delivery_phone TEXT NOT NULL,
    delivery_memo TEXT,
    
    -- 배달 정보
    estimated_minutes INTEGER,
    delivery_fee NUMERIC DEFAULT 0,
    distance_km NUMERIC,
    
    -- 상태
    status TEXT DEFAULT 'pending',
    -- 'pending', 'accepted', 'preparing', 'ready', 'picked_up', 
    -- 'delivering', 'delivered', 'cancelled', 'failed'
    
    -- 배달원
    driver_id UUID REFERENCES public.users(id),
    driver_name TEXT,
    driver_phone TEXT,
    
    -- 시간 기록
    accepted_at TIMESTAMPTZ,
    preparing_at TIMESTAMPTZ,
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    
    -- 쿠폰
    coupon_issue_id UUID REFERENCES public.coupon_issues(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_store ON public.delivery_orders(store_id, status);
CREATE INDEX IF NOT EXISTS idx_delivery_user ON public.delivery_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_delivery_driver ON public.delivery_orders(driver_id, status);

ALTER TABLE public.delivery_orders ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. 알림 시스템
-- ============================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL,
    body TEXT,
    icon TEXT, -- emoji or icon name
    
    type TEXT NOT NULL,
    -- 'coupon_received', 'coupon_expiring', 'coupon_used',
    -- 'order_status', 'order_ready', 'delivery_update',
    -- 'chat_message', 'chat_mention',
    -- 'settlement_complete', 'reservation_confirmed',
    -- 'system', 'promotion'
    
    -- 참조 데이터
    reference_id UUID,
    reference_type TEXT, -- 'coupon', 'order', 'chat', 'settlement', 'reservation'
    action_url TEXT, -- 클릭 시 이동할 URL
    
    -- 상태
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    
    -- 만료
    expires_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications"
ON public.notifications FOR SELECT
USING (user_id = auth.uid());

-- ============================================
-- 5. 쿠폰 배포 스케줄
-- ============================================

CREATE TABLE IF NOT EXISTS public.coupon_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
    merchant_id UUID NOT NULL REFERENCES public.merchants(id),
    
    -- 스케줄 타입
    schedule_type TEXT NOT NULL DEFAULT 'once',
    -- 'once', 'daily', 'weekly', 'monthly', 'custom'
    
    -- 날짜 범위
    start_date DATE NOT NULL,
    end_date DATE,
    
    -- 시간 범위 (하루 중)
    start_time TIME DEFAULT '00:00',
    end_time TIME DEFAULT '23:59',
    
    -- 요일 (weekly 타입)
    days_of_week INTEGER[] DEFAULT '{1,2,3,4,5,6,7}',
    -- 1=월, 2=화, ..., 7=일
    
    -- 반경 설정 (미터 단위로 통일)
    radius_min_m INTEGER DEFAULT 50,        -- 최소 50m
    radius_max_m INTEGER DEFAULT 20000000,  -- 최대 20,000km
    
    -- 배포 수량 제한 (스케줄 당)
    daily_limit INTEGER,
    total_limit INTEGER,
    distributed_count INTEGER DEFAULT 0,
    
    -- 상태
    is_active BOOLEAN DEFAULT true,
    last_distributed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupon_schedules_coupon ON public.coupon_schedules(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_schedules_active ON public.coupon_schedules(is_active, start_date);

ALTER TABLE public.coupon_schedules ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. 쿠폰→지갑 자동 저장 트리거
-- ============================================

CREATE OR REPLACE FUNCTION public.auto_save_coupon_to_wallet()
RETURNS TRIGGER AS $$
BEGIN
    -- coupon_issues에 새 발행이 생기면 wallet 카운트 업데이트
    UPDATE public.wallets
    SET total_coupon_count = total_coupon_count + 1,
        updated_at = NOW()
    WHERE consumer_id = (
        SELECT c.id FROM public.consumers c
        WHERE c.user_id = NEW.user_id
        LIMIT 1
    );
    
    -- 알림 생성
    INSERT INTO public.notifications (user_id, title, body, type, reference_id, reference_type, action_url)
    VALUES (
        NEW.user_id,
        '🎉 새 쿠폰이 지갑에 저장되었습니다!',
        (SELECT title FROM public.coupons WHERE id = NEW.coupon_id),
        'coupon_received',
        NEW.id,
        'coupon',
        '/consumer/wallet'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_save_coupon ON public.coupon_issues;
CREATE TRIGGER trg_auto_save_coupon
AFTER INSERT ON public.coupon_issues
FOR EACH ROW
EXECUTE FUNCTION public.auto_save_coupon_to_wallet();

-- ============================================
-- 7. 고객 DB 자동 등록 트리거
-- ============================================

CREATE OR REPLACE FUNCTION public.auto_register_merchant_customer()
RETURNS TRIGGER AS $$
DECLARE
    v_merchant_id UUID;
BEGIN
    -- 쿠폰의 merchant_id 가져오기
    SELECT c.merchant_id INTO v_merchant_id
    FROM public.coupons c
    WHERE c.id = NEW.coupon_id;
    
    IF v_merchant_id IS NOT NULL AND NEW.user_id IS NOT NULL THEN
        INSERT INTO public.merchant_customers (merchant_id, user_id, phone, coupon_issue_count)
        VALUES (v_merchant_id, NEW.user_id, NEW.phone, 1)
        ON CONFLICT (merchant_id, user_id) 
        DO UPDATE SET
            visit_count = public.merchant_customers.visit_count + 1,
            coupon_issue_count = public.merchant_customers.coupon_issue_count + 1,
            last_visit_at = NOW(),
            updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_register_customer ON public.coupon_issues;
CREATE TRIGGER trg_auto_register_customer
AFTER INSERT ON public.coupon_issues
FOR EACH ROW
EXECUTE FUNCTION public.auto_register_merchant_customer();

-- merchant_customers에 unique constraint 추가 (없으면)
DO $$ BEGIN
    ALTER TABLE public.merchant_customers
    ADD CONSTRAINT uq_merchant_customer UNIQUE (merchant_id, user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 완료!
-- ============================================
