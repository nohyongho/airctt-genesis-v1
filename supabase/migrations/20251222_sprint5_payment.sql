-- AIRCTT Sprint 5: 결제 시스템 (PG 연동 준비)
-- Date: 2025-12-22

-- =========================================================
-- 1. 결제 트랜잭션 테이블
-- =========================================================

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    store_id UUID REFERENCES public.stores(id),

    -- 결제 유형
    payment_type TEXT NOT NULL, -- 'order', 'topup', 'ticket', 'subscription'

    -- 연관 데이터
    session_id UUID REFERENCES public.table_sessions(id),
    order_id UUID,
    ticket_id UUID,

    -- 금액
    amount NUMERIC NOT NULL,
    discount_amount NUMERIC DEFAULT 0,
    final_amount NUMERIC NOT NULL,

    -- PG 정보
    pg_provider TEXT, -- 'toss', 'inicis', 'kakaopay', 'naverpay'
    pg_transaction_id TEXT,
    pg_order_id TEXT UNIQUE,
    pg_payment_key TEXT,

    -- 결제 수단
    payment_method TEXT, -- 'card', 'transfer', 'vbank', 'phone', 'point'
    card_company TEXT,
    card_number TEXT, -- 마스킹된 카드번호

    -- 상태
    status TEXT DEFAULT 'pending', -- 'pending', 'ready', 'paid', 'cancelled', 'failed', 'refunded'

    -- 환불 정보
    refund_amount NUMERIC DEFAULT 0,
    refund_reason TEXT,
    refunded_at TIMESTAMP WITH TIME ZONE,

    -- 메타데이터
    metadata JSONB DEFAULT '{}',

    -- 시간
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_merchant ON public.payments(merchant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_pg_order ON public.payments(pg_order_id);

-- =========================================================
-- 2. 가맹점 지갑 (충전금)
-- =========================================================

CREATE TABLE IF NOT EXISTS public.merchant_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL UNIQUE REFERENCES public.merchants(id) ON DELETE CASCADE,

    -- 잔액
    balance NUMERIC DEFAULT 0 CHECK (balance >= 0),
    pending_balance NUMERIC DEFAULT 0, -- 정산 대기 금액

    -- 누적
    total_charged NUMERIC DEFAULT 0,
    total_used NUMERIC DEFAULT 0,
    total_refunded NUMERIC DEFAULT 0,

    -- 상태
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================
-- 3. 지갑 거래 내역
-- =========================================================

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES public.merchant_wallets(id),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id),

    -- 거래 유형
    transaction_type TEXT NOT NULL, -- 'charge', 'use', 'refund', 'settlement', 'bonus'

    -- 금액
    amount NUMERIC NOT NULL,
    balance_before NUMERIC NOT NULL,
    balance_after NUMERIC NOT NULL,

    -- 연관 데이터
    payment_id UUID REFERENCES public.payments(id),
    reference_id TEXT,

    -- 설명
    description TEXT,
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet ON public.wallet_transactions(wallet_id, created_at DESC);

-- =========================================================
-- 4. 충전 패키지 (보너스 포함)
-- =========================================================

CREATE TABLE IF NOT EXISTS public.topup_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    name TEXT NOT NULL,
    description TEXT,

    -- 금액
    amount NUMERIC NOT NULL, -- 충전 금액
    bonus_amount NUMERIC DEFAULT 0, -- 보너스
    bonus_percent NUMERIC DEFAULT 0, -- 보너스 %

    -- 표시
    display_order INTEGER DEFAULT 0,
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,

    -- 기간
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기본 충전 패키지 삽입
INSERT INTO public.topup_packages (name, amount, bonus_amount, bonus_percent, display_order, is_popular)
VALUES
    ('기본', 50000, 0, 0, 1, false),
    ('인기', 100000, 5000, 5, 2, true),
    ('프리미엄', 200000, 20000, 10, 3, false),
    ('비즈니스', 500000, 75000, 15, 4, false),
    ('엔터프라이즈', 1000000, 200000, 20, 5, false)
ON CONFLICT DO NOTHING;

-- =========================================================
-- 5. PG 주문번호 생성 함수
-- =========================================================

CREATE OR REPLACE FUNCTION public.generate_pg_order_id(
    p_prefix TEXT DEFAULT 'CTT'
)
RETURNS TEXT AS $$
DECLARE
    v_timestamp TEXT;
    v_random TEXT;
BEGIN
    v_timestamp := to_char(NOW(), 'YYYYMMDDHH24MISS');
    v_random := substr(md5(random()::text), 1, 6);
    RETURN p_prefix || '_' || v_timestamp || '_' || upper(v_random);
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- 6. 지갑 생성 트리거 (가맹점 생성 시)
-- =========================================================

CREATE OR REPLACE FUNCTION public.create_merchant_wallet()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.merchant_wallets (merchant_id)
    VALUES (NEW.id)
    ON CONFLICT (merchant_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_create_merchant_wallet ON public.merchants;
CREATE TRIGGER trg_create_merchant_wallet
AFTER INSERT ON public.merchants
FOR EACH ROW
EXECUTE FUNCTION public.create_merchant_wallet();

-- 기존 가맹점에 대해 지갑 생성
INSERT INTO public.merchant_wallets (merchant_id)
SELECT id FROM public.merchants
WHERE id NOT IN (SELECT merchant_id FROM public.merchant_wallets)
ON CONFLICT DO NOTHING;

-- =========================================================
-- 7. 결제 완료 시 지갑 업데이트 함수
-- =========================================================

CREATE OR REPLACE FUNCTION public.process_topup_payment(
    p_payment_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_payment RECORD;
    v_wallet_id UUID;
    v_current_balance NUMERIC;
    v_bonus NUMERIC;
    v_total_credit NUMERIC;
BEGIN
    -- 결제 정보 조회
    SELECT * INTO v_payment
    FROM public.payments
    WHERE id = p_payment_id AND payment_type = 'topup' AND status = 'paid';

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- 지갑 조회 (잠금)
    SELECT id, balance INTO v_wallet_id, v_current_balance
    FROM public.merchant_wallets
    WHERE merchant_id = v_payment.merchant_id
    FOR UPDATE;

    -- 보너스 계산 (메타데이터에서)
    v_bonus := COALESCE((v_payment.metadata->>'bonus_amount')::numeric, 0);
    v_total_credit := v_payment.final_amount + v_bonus;

    -- 지갑 잔액 업데이트
    UPDATE public.merchant_wallets
    SET
        balance = balance + v_total_credit,
        total_charged = total_charged + v_payment.final_amount,
        updated_at = NOW()
    WHERE id = v_wallet_id;

    -- 거래 내역 기록 (충전)
    INSERT INTO public.wallet_transactions (
        wallet_id, merchant_id, transaction_type,
        amount, balance_before, balance_after,
        payment_id, description
    ) VALUES (
        v_wallet_id, v_payment.merchant_id, 'charge',
        v_payment.final_amount, v_current_balance, v_current_balance + v_payment.final_amount,
        p_payment_id, '충전'
    );

    -- 보너스가 있으면 별도 기록
    IF v_bonus > 0 THEN
        INSERT INTO public.wallet_transactions (
            wallet_id, merchant_id, transaction_type,
            amount, balance_before, balance_after,
            payment_id, description
        ) VALUES (
            v_wallet_id, v_payment.merchant_id, 'bonus',
            v_bonus, v_current_balance + v_payment.final_amount, v_current_balance + v_total_credit,
            p_payment_id, '충전 보너스'
        );
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- 8. RLS 정책
-- =========================================================

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topup_packages ENABLE ROW LEVEL SECURITY;

-- 결제: 해당 가맹점 관계자만
CREATE POLICY "Access own payments"
ON public.payments FOR ALL
USING (
    merchant_id IN (
        SELECT merchant_id FROM public.merchant_users
        WHERE user_id = auth.uid()
    )
);

-- 지갑: 해당 가맹점 관계자만
CREATE POLICY "Access own wallet"
ON public.merchant_wallets FOR ALL
USING (
    merchant_id IN (
        SELECT merchant_id FROM public.merchant_users
        WHERE user_id = auth.uid()
    )
);

-- 지갑 거래: 해당 가맹점 관계자만
CREATE POLICY "Access own wallet transactions"
ON public.wallet_transactions FOR ALL
USING (
    merchant_id IN (
        SELECT mu.merchant_id FROM public.merchant_users mu
        WHERE mu.user_id = auth.uid()
    )
);

-- 충전 패키지: 모두 조회 가능
CREATE POLICY "View topup packages"
ON public.topup_packages FOR SELECT
USING (is_active = true);
