-- AIRCTT Sprint 6: 문화공연 티켓 & 정산 시스템
-- Date: 2025-12-22

-- =========================================================
-- 1. 공연/이벤트 테이블
-- =========================================================

CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    store_id UUID REFERENCES public.stores(id),

    -- 기본 정보
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    category TEXT, -- 'concert', 'theater', 'exhibition', 'sports', 'festival', 'other'

    -- 이미지
    poster_url TEXT,
    banner_url TEXT,
    gallery_urls JSONB DEFAULT '[]',

    -- 장소
    venue_name TEXT NOT NULL,
    venue_address TEXT,
    venue_latitude NUMERIC,
    venue_longitude NUMERIC,
    seating_chart_url TEXT,

    -- 일정
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    event_end_date TIMESTAMP WITH TIME ZONE,
    doors_open_at TIMESTAMP WITH TIME ZONE,
    running_time INTEGER, -- 분 단위

    -- 판매
    ticket_open_at TIMESTAMP WITH TIME ZONE,
    ticket_close_at TIMESTAMP WITH TIME ZONE,
    max_tickets_per_order INTEGER DEFAULT 4,

    -- 상태
    status TEXT DEFAULT 'draft', -- 'draft', 'on_sale', 'sold_out', 'completed', 'cancelled'
    is_featured BOOLEAN DEFAULT false,

    -- AR/XR 연동
    ar_content_url TEXT,
    xr_experience_id TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_merchant ON public.events(merchant_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date, status);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);

-- =========================================================
-- 2. 티켓 등급/유형
-- =========================================================

CREATE TABLE IF NOT EXISTS public.ticket_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,

    name TEXT NOT NULL, -- 'VIP', 'R석', 'S석', 'A석', '자유석'
    description TEXT,

    -- 가격
    price NUMERIC NOT NULL,
    original_price NUMERIC, -- 정가 (할인 전)

    -- 수량
    total_quantity INTEGER NOT NULL,
    sold_quantity INTEGER DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,

    -- 제한
    min_per_order INTEGER DEFAULT 1,
    max_per_order INTEGER DEFAULT 4,

    -- 좌석
    is_numbered_seat BOOLEAN DEFAULT false, -- 지정석 여부
    section TEXT, -- 구역
    row_prefix TEXT, -- 열 접두사

    -- 판매 기간 (티켓별 별도 설정 가능)
    sale_start_at TIMESTAMP WITH TIME ZONE,
    sale_end_at TIMESTAMP WITH TIME ZONE,

    -- 상태
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_types_event ON public.ticket_types(event_id);

-- =========================================================
-- 3. 발권된 티켓
-- =========================================================

CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id),
    ticket_type_id UUID NOT NULL REFERENCES public.ticket_types(id),

    -- 구매자
    user_id UUID REFERENCES public.users(id),
    buyer_name TEXT NOT NULL,
    buyer_phone TEXT NOT NULL,
    buyer_email TEXT,

    -- 티켓 정보
    ticket_number TEXT UNIQUE NOT NULL,
    qr_code TEXT UNIQUE NOT NULL,
    price NUMERIC NOT NULL,

    -- 좌석 (지정석인 경우)
    seat_section TEXT,
    seat_row TEXT,
    seat_number TEXT,

    -- 결제
    payment_id UUID REFERENCES public.payments(id),
    order_id TEXT,

    -- 상태
    status TEXT DEFAULT 'issued', -- 'reserved', 'issued', 'used', 'cancelled', 'refunded'
    used_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,

    -- 양도
    is_transferable BOOLEAN DEFAULT true,
    transferred_from UUID REFERENCES public.tickets(id),
    transfer_count INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_event ON public.tickets(event_id, status);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON public.tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_qr ON public.tickets(qr_code);
CREATE INDEX IF NOT EXISTS idx_tickets_number ON public.tickets(ticket_number);

-- =========================================================
-- 4. 티켓 번호 생성 함수
-- =========================================================

CREATE OR REPLACE FUNCTION public.generate_ticket_number(
    p_event_id UUID
)
RETURNS TEXT AS $$
DECLARE
    v_prefix TEXT;
    v_seq INTEGER;
BEGIN
    -- 이벤트별 시퀀스
    SELECT COUNT(*) + 1 INTO v_seq
    FROM public.tickets
    WHERE event_id = p_event_id;

    -- 형식: TKT-YYYYMMDD-XXXX (이벤트 날짜-순번)
    SELECT 'TKT-' || to_char(event_date, 'YYYYMMDD') || '-' || lpad(v_seq::text, 4, '0')
    INTO v_prefix
    FROM public.events
    WHERE id = p_event_id;

    RETURN v_prefix;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- 5. 티켓 QR 코드 생성 함수
-- =========================================================

CREATE OR REPLACE FUNCTION public.generate_ticket_qr()
RETURNS TEXT AS $$
DECLARE
    v_code TEXT;
BEGIN
    v_code := encode(gen_random_bytes(16), 'hex');
    RETURN upper(v_code);
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- 6. 정산 테이블
-- =========================================================

CREATE TABLE IF NOT EXISTS public.settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id),

    -- 정산 기간
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    -- 금액
    gross_amount NUMERIC NOT NULL, -- 총 매출
    fee_amount NUMERIC NOT NULL, -- 수수료
    tax_amount NUMERIC DEFAULT 0, -- 세금
    net_amount NUMERIC NOT NULL, -- 정산액

    -- 상세 내역
    order_count INTEGER DEFAULT 0,
    ticket_count INTEGER DEFAULT 0,
    refund_count INTEGER DEFAULT 0,
    refund_amount NUMERIC DEFAULT 0,

    -- 수수료율
    fee_rate NUMERIC DEFAULT 3.5, -- 기본 3.5%

    -- 입금 정보
    bank_name TEXT,
    bank_account TEXT,
    account_holder TEXT,

    -- 상태
    status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'processing', 'completed', 'failed'
    confirmed_at TIMESTAMP WITH TIME ZONE,
    processed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,

    -- 메타데이터
    metadata JSONB DEFAULT '{}',
    notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_settlements_merchant ON public.settlements(merchant_id, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_settlements_status ON public.settlements(status);

-- =========================================================
-- 7. 정산 상세 내역
-- =========================================================

CREATE TABLE IF NOT EXISTS public.settlement_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    settlement_id UUID NOT NULL REFERENCES public.settlements(id) ON DELETE CASCADE,

    -- 유형
    item_type TEXT NOT NULL, -- 'order', 'ticket', 'refund', 'adjustment'

    -- 연관 데이터
    reference_id UUID,
    reference_type TEXT, -- 'payment', 'ticket', 'order'

    -- 금액
    gross_amount NUMERIC NOT NULL,
    fee_amount NUMERIC NOT NULL,
    net_amount NUMERIC NOT NULL,

    -- 설명
    description TEXT,
    occurred_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_settlement_items ON public.settlement_items(settlement_id);

-- =========================================================
-- 8. 정산 생성 함수 (주간 정산)
-- =========================================================

CREATE OR REPLACE FUNCTION public.create_weekly_settlement(
    p_merchant_id UUID,
    p_week_start DATE DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_settlement_id UUID;
    v_period_start DATE;
    v_period_end DATE;
    v_gross_amount NUMERIC;
    v_order_count INTEGER;
    v_fee_rate NUMERIC := 3.5;
    v_fee_amount NUMERIC;
    v_net_amount NUMERIC;
BEGIN
    -- 기간 설정 (지난 주 월~일)
    IF p_week_start IS NULL THEN
        v_period_start := date_trunc('week', CURRENT_DATE - INTERVAL '1 week')::date;
    ELSE
        v_period_start := p_week_start;
    END IF;
    v_period_end := v_period_start + INTERVAL '6 days';

    -- 해당 기간 매출 집계
    SELECT
        COALESCE(SUM(final_amount), 0),
        COUNT(*)
    INTO v_gross_amount, v_order_count
    FROM public.payments
    WHERE merchant_id = p_merchant_id
    AND status = 'paid'
    AND approved_at >= v_period_start
    AND approved_at < v_period_end + INTERVAL '1 day';

    -- 수수료 및 정산액 계산
    v_fee_amount := ROUND(v_gross_amount * v_fee_rate / 100, 0);
    v_net_amount := v_gross_amount - v_fee_amount;

    -- 정산 레코드 생성
    INSERT INTO public.settlements (
        merchant_id, period_start, period_end,
        gross_amount, fee_amount, net_amount,
        order_count, fee_rate
    ) VALUES (
        p_merchant_id, v_period_start, v_period_end,
        v_gross_amount, v_fee_amount, v_net_amount,
        v_order_count, v_fee_rate
    )
    RETURNING id INTO v_settlement_id;

    RETURN v_settlement_id;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- 9. 티켓 판매 시 수량 업데이트 트리거
-- =========================================================

CREATE OR REPLACE FUNCTION public.update_ticket_type_quantity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.ticket_types
        SET sold_quantity = sold_quantity + 1,
            updated_at = NOW()
        WHERE id = NEW.ticket_type_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
            UPDATE public.ticket_types
            SET sold_quantity = sold_quantity - 1,
                updated_at = NOW()
            WHERE id = NEW.ticket_type_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_ticket_quantity ON public.tickets;
CREATE TRIGGER trg_update_ticket_quantity
AFTER INSERT OR UPDATE ON public.tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_ticket_type_quantity();

-- =========================================================
-- 10. RLS 정책
-- =========================================================

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_items ENABLE ROW LEVEL SECURITY;

-- 이벤트: 공개 이벤트는 모두 조회 가능, 수정은 가맹점만
CREATE POLICY "View public events"
ON public.events FOR SELECT
USING (status IN ('on_sale', 'sold_out', 'completed'));

CREATE POLICY "Manage own events"
ON public.events FOR ALL
USING (
    merchant_id IN (
        SELECT merchant_id FROM public.merchant_users
        WHERE user_id = auth.uid()
    )
);

-- 티켓 유형: 활성 이벤트의 티켓은 모두 조회 가능
CREATE POLICY "View ticket types"
ON public.ticket_types FOR SELECT
USING (
    event_id IN (
        SELECT id FROM public.events
        WHERE status IN ('on_sale', 'sold_out')
    )
);

-- 티켓: 본인 티켓만 조회
CREATE POLICY "View own tickets"
ON public.tickets FOR SELECT
USING (user_id = auth.uid());

-- 정산: 해당 가맹점만
CREATE POLICY "Access own settlements"
ON public.settlements FOR ALL
USING (
    merchant_id IN (
        SELECT merchant_id FROM public.merchant_users
        WHERE user_id = auth.uid()
    )
);
