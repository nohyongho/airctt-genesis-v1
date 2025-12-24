-- AIRCTT Sprint 4: 테이블 오더 시스템
-- Date: 2025-12-22

-- =========================================================
-- 1. 테이블 세션 (주문 세션)
-- =========================================================

CREATE TABLE IF NOT EXISTS public.table_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    table_id UUID NOT NULL REFERENCES public.store_tables(id) ON DELETE CASCADE,

    -- 세션 정보
    session_code TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active', -- 'active', 'ordering', 'paid', 'closed'

    -- 고객 정보 (비회원 가능)
    user_id UUID REFERENCES public.users(id),
    guest_phone TEXT,
    guest_name TEXT,
    party_size INTEGER DEFAULT 1,

    -- 금액
    total_amount NUMERIC DEFAULT 0,
    discount_amount NUMERIC DEFAULT 0,
    final_amount NUMERIC DEFAULT 0,

    -- 쿠폰
    applied_coupon_issue_id UUID REFERENCES public.coupon_issues(id),

    -- 시간
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ordered_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_table_sessions_store ON public.table_sessions(store_id, status);
CREATE INDEX IF NOT EXISTS idx_table_sessions_table ON public.table_sessions(table_id, status);
CREATE INDEX IF NOT EXISTS idx_table_sessions_code ON public.table_sessions(session_code);

-- =========================================================
-- 2. 장바구니 아이템
-- =========================================================

CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.table_sessions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),

    -- 수량 및 가격
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL,
    options JSONB, -- 선택 옵션
    special_request TEXT, -- 특별 요청사항

    -- 상태
    status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'preparing', 'served', 'cancelled'

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cart_items_session ON public.cart_items(session_id);

-- =========================================================
-- 3. QR 스캔 로그
-- =========================================================

CREATE TABLE IF NOT EXISTS public.qr_scan_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_id UUID NOT NULL REFERENCES public.store_tables(id),
    store_id UUID NOT NULL REFERENCES public.stores(id),

    -- 스캔 정보
    session_id UUID REFERENCES public.table_sessions(id),
    user_id UUID REFERENCES public.users(id),

    -- 디바이스 정보
    user_agent TEXT,
    ip_address TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qr_scans_table ON public.qr_scan_logs(table_id, created_at DESC);

-- =========================================================
-- 4. 주방 디스플레이용 주문 큐
-- =========================================================

CREATE TABLE IF NOT EXISTS public.kitchen_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES public.table_sessions(id),
    table_name TEXT NOT NULL,

    -- 주문 정보
    order_number INTEGER NOT NULL,
    items JSONB NOT NULL, -- 주문 아이템 스냅샷

    -- 상태
    status TEXT DEFAULT 'new', -- 'new', 'preparing', 'ready', 'served', 'cancelled'
    priority INTEGER DEFAULT 0,

    -- 시간
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    ready_at TIMESTAMP WITH TIME ZONE,
    served_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kitchen_orders_store ON public.kitchen_orders(store_id, status);
CREATE INDEX IF NOT EXISTS idx_kitchen_orders_status ON public.kitchen_orders(status, received_at);

-- =========================================================
-- 5. 세션 코드 생성 함수
-- =========================================================

CREATE OR REPLACE FUNCTION public.generate_session_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    code TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- 6. 테이블 세션 생성 함수
-- =========================================================

CREATE OR REPLACE FUNCTION public.create_table_session(
    p_store_id UUID,
    p_table_id UUID,
    p_user_id UUID DEFAULT NULL,
    p_guest_phone TEXT DEFAULT NULL,
    p_party_size INTEGER DEFAULT 1
)
RETURNS UUID AS $$
DECLARE
    v_session_id UUID;
    v_code TEXT;
BEGIN
    -- 고유 세션 코드 생성
    LOOP
        v_code := public.generate_session_code();
        EXIT WHEN NOT EXISTS (
            SELECT 1 FROM public.table_sessions WHERE session_code = v_code
        );
    END LOOP;

    -- 세션 생성
    INSERT INTO public.table_sessions (
        store_id, table_id, session_code, user_id, guest_phone, party_size
    )
    VALUES (
        p_store_id, p_table_id, v_code, p_user_id, p_guest_phone, p_party_size
    )
    RETURNING id INTO v_session_id;

    RETURN v_session_id;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- 7. 장바구니 총액 자동 계산 트리거
-- =========================================================

CREATE OR REPLACE FUNCTION public.update_session_totals()
RETURNS TRIGGER AS $$
DECLARE
    v_total NUMERIC;
BEGIN
    -- 장바구니 총액 계산
    SELECT COALESCE(SUM(quantity * unit_price), 0) INTO v_total
    FROM public.cart_items
    WHERE session_id = COALESCE(NEW.session_id, OLD.session_id)
    AND status != 'cancelled';

    -- 세션 업데이트
    UPDATE public.table_sessions
    SET
        total_amount = v_total,
        final_amount = v_total - COALESCE(discount_amount, 0),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.session_id, OLD.session_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_session_totals ON public.cart_items;
CREATE TRIGGER trg_update_session_totals
AFTER INSERT OR UPDATE OR DELETE ON public.cart_items
FOR EACH ROW
EXECUTE FUNCTION public.update_session_totals();

-- =========================================================
-- 8. 주문 번호 시퀀스 (매장별)
-- =========================================================

CREATE TABLE IF NOT EXISTS public.store_order_sequences (
    store_id UUID PRIMARY KEY REFERENCES public.stores(id) ON DELETE CASCADE,
    current_number INTEGER DEFAULT 0,
    last_reset_date DATE DEFAULT CURRENT_DATE
);

CREATE OR REPLACE FUNCTION public.get_next_order_number(p_store_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_number INTEGER;
BEGIN
    -- 날짜가 바뀌면 리셋
    INSERT INTO public.store_order_sequences (store_id, current_number, last_reset_date)
    VALUES (p_store_id, 1, CURRENT_DATE)
    ON CONFLICT (store_id) DO UPDATE SET
        current_number = CASE
            WHEN store_order_sequences.last_reset_date < CURRENT_DATE THEN 1
            ELSE store_order_sequences.current_number + 1
        END,
        last_reset_date = CURRENT_DATE
    RETURNING current_number INTO v_number;

    RETURN v_number;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- 9. RLS 정책
-- =========================================================

ALTER TABLE public.table_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_scan_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kitchen_orders ENABLE ROW LEVEL SECURITY;

-- 세션은 해당 매장 관계자 또는 세션 참여자만 접근
CREATE POLICY "Access table sessions"
ON public.table_sessions FOR ALL
USING (
    user_id = auth.uid()
    OR store_id IN (
        SELECT s.id FROM public.stores s
        JOIN public.merchant_users mu ON s.merchant_id = mu.merchant_id
        WHERE mu.user_id = auth.uid()
    )
);

-- 장바구니는 세션 접근 권한과 동일
CREATE POLICY "Access cart items"
ON public.cart_items FOR ALL
USING (
    session_id IN (
        SELECT id FROM public.table_sessions
        WHERE user_id = auth.uid()
        OR store_id IN (
            SELECT s.id FROM public.stores s
            JOIN public.merchant_users mu ON s.merchant_id = mu.merchant_id
            WHERE mu.user_id = auth.uid()
        )
    )
);

-- 주방 주문은 매장 관계자만
CREATE POLICY "Access kitchen orders"
ON public.kitchen_orders FOR ALL
USING (
    store_id IN (
        SELECT s.id FROM public.stores s
        JOIN public.merchant_users mu ON s.merchant_id = mu.merchant_id
        WHERE mu.user_id = auth.uid()
    )
);
