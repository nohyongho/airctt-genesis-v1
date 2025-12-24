-- AIRCTT Sprint 3: 관리자 승인 & 황금토끼 모니터링
-- Date: 2025-12-21

-- =========================================================
-- 1. 가맹점 승인 상태 Enum
-- =========================================================

DO $$ BEGIN
    CREATE TYPE public.approval_status AS ENUM (
        'pending',      -- 대기
        'reviewing',    -- 검토중
        'approved',     -- 승인됨
        'rejected',     -- 반려됨
        'suspended'     -- 정지됨
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =========================================================
-- 2. 가맹점 승인 이력 테이블
-- =========================================================

CREATE TABLE IF NOT EXISTS public.merchant_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,

    -- 상태
    status public.approval_status NOT NULL DEFAULT 'pending',
    previous_status public.approval_status,

    -- 처리자
    reviewed_by UUID REFERENCES public.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,

    -- 사유
    reason TEXT,
    internal_note TEXT,

    -- 메타
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_merchant_approvals_merchant ON public.merchant_approvals(merchant_id);
CREATE INDEX IF NOT EXISTS idx_merchant_approvals_status ON public.merchant_approvals(status);

-- =========================================================
-- 3. 황금토끼 감사 로그 테이블
-- =========================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- 액션 주체
    actor_id UUID REFERENCES public.users(id),
    actor_type TEXT, -- 'user', 'merchant', 'admin', 'system'

    -- 대상
    target_type TEXT NOT NULL, -- 'merchant', 'coupon', 'order', 'user', 'store'
    target_id UUID,

    -- 액션
    action TEXT NOT NULL, -- 'create', 'update', 'delete', 'approve', 'reject', 'issue', 'use'
    action_detail TEXT,

    -- 데이터
    old_data JSONB,
    new_data JSONB,

    -- 컨텍스트
    ip_address TEXT,
    user_agent TEXT,
    session_id TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON public.audit_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- =========================================================
-- 4. 실시간 거래 이벤트 테이블 (스트림용)
-- =========================================================

CREATE TABLE IF NOT EXISTS public.transaction_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- 이벤트 유형
    event_type TEXT NOT NULL, -- 'coupon_issued', 'coupon_used', 'order_created', 'payment_completed', 'game_won'

    -- 관련 엔티티
    merchant_id UUID REFERENCES public.merchants(id),
    store_id UUID REFERENCES public.stores(id),
    user_id UUID REFERENCES public.users(id),
    coupon_id UUID REFERENCES public.coupons(id),
    order_id UUID REFERENCES public.orders(id),

    -- 금액
    amount NUMERIC,
    discount_amount NUMERIC,

    -- 메타
    metadata JSONB,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transaction_events_type ON public.transaction_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transaction_events_merchant ON public.transaction_events(merchant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transaction_events_created ON public.transaction_events(created_at DESC);

-- =========================================================
-- 5. 가맹점 건강도 지표 테이블
-- =========================================================

CREATE TABLE IF NOT EXISTS public.merchant_health_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- 점수 (0-100)
    overall_score INTEGER DEFAULT 50,

    -- 세부 지표
    activity_score INTEGER DEFAULT 50,      -- 활동 빈도
    coupon_score INTEGER DEFAULT 50,        -- 쿠폰 성과
    customer_score INTEGER DEFAULT 50,      -- 고객 만족도
    compliance_score INTEGER DEFAULT 100,   -- 정책 준수

    -- 위험 플래그
    risk_level TEXT DEFAULT 'normal', -- 'normal', 'warning', 'critical'
    risk_factors JSONB,

    -- 권장 조치
    recommendations JSONB,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(merchant_id, date)
);

CREATE INDEX IF NOT EXISTS idx_merchant_health_date ON public.merchant_health_scores(merchant_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_merchant_health_risk ON public.merchant_health_scores(risk_level, date);

-- =========================================================
-- 6. 이상 거래 탐지 알림 테이블
-- =========================================================

CREATE TABLE IF NOT EXISTS public.anomaly_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- 대상
    merchant_id UUID REFERENCES public.merchants(id),
    user_id UUID REFERENCES public.users(id),

    -- 알림 유형
    alert_type TEXT NOT NULL, -- 'high_volume', 'unusual_pattern', 'rapid_redemption', 'duplicate_issue'
    severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'

    -- 내용
    title TEXT NOT NULL,
    description TEXT,
    details JSONB,

    -- 상태
    status TEXT DEFAULT 'new', -- 'new', 'acknowledged', 'investigating', 'resolved', 'dismissed'
    resolved_by UUID REFERENCES public.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_note TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anomaly_alerts_status ON public.anomaly_alerts(status, severity);
CREATE INDEX IF NOT EXISTS idx_anomaly_alerts_merchant ON public.anomaly_alerts(merchant_id, created_at DESC);

-- =========================================================
-- 7. 쿠폰 발급 시 거래 이벤트 자동 기록 트리거
-- =========================================================

CREATE OR REPLACE FUNCTION public.log_coupon_issue_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.transaction_events (
        event_type,
        merchant_id,
        user_id,
        coupon_id,
        metadata
    )
    SELECT
        'coupon_issued',
        c.merchant_id,
        NEW.user_id,
        NEW.coupon_id,
        jsonb_build_object(
            'issue_id', NEW.id,
            'issued_from', NEW.issued_from
        )
    FROM public.coupons c
    WHERE c.id = NEW.coupon_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_coupon_issue ON public.coupon_issues;
CREATE TRIGGER trg_log_coupon_issue
AFTER INSERT ON public.coupon_issues
FOR EACH ROW
EXECUTE FUNCTION public.log_coupon_issue_event();

-- =========================================================
-- 8. 쿠폰 사용 시 거래 이벤트 자동 기록 트리거
-- =========================================================

CREATE OR REPLACE FUNCTION public.log_coupon_use_event()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_used = true AND (OLD.is_used = false OR OLD.is_used IS NULL) THEN
        INSERT INTO public.transaction_events (
            event_type,
            merchant_id,
            store_id,
            user_id,
            coupon_id,
            order_id,
            metadata
        )
        SELECT
            'coupon_used',
            c.merchant_id,
            c.store_id,
            NEW.user_id,
            NEW.coupon_id,
            NEW.used_order_id,
            jsonb_build_object(
                'issue_id', NEW.id,
                'used_at', NEW.used_at
            )
        FROM public.coupons c
        WHERE c.id = NEW.coupon_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_coupon_use ON public.coupon_issues;
CREATE TRIGGER trg_log_coupon_use
AFTER UPDATE ON public.coupon_issues
FOR EACH ROW
EXECUTE FUNCTION public.log_coupon_use_event();

-- =========================================================
-- 9. 가맹점 건강도 계산 함수
-- =========================================================

CREATE OR REPLACE FUNCTION public.calculate_merchant_health(p_merchant_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_activity_score INTEGER := 50;
    v_coupon_score INTEGER := 50;
    v_customer_score INTEGER := 50;
    v_compliance_score INTEGER := 100;
    v_overall INTEGER;
    v_recent_activity INTEGER;
    v_coupon_conversion NUMERIC;
BEGIN
    -- 1. 활동 점수: 최근 7일 활동 기반
    SELECT COUNT(*) INTO v_recent_activity
    FROM public.transaction_events
    WHERE merchant_id = p_merchant_id
    AND created_at >= NOW() - INTERVAL '7 days';

    IF v_recent_activity >= 50 THEN
        v_activity_score := 100;
    ELSIF v_recent_activity >= 20 THEN
        v_activity_score := 80;
    ELSIF v_recent_activity >= 10 THEN
        v_activity_score := 60;
    ELSIF v_recent_activity >= 5 THEN
        v_activity_score := 40;
    ELSE
        v_activity_score := 20;
    END IF;

    -- 2. 쿠폰 점수: 전환율 기반
    SELECT
        CASE WHEN SUM(issued_count) > 0
            THEN (SUM(used_count)::NUMERIC / SUM(issued_count)) * 100
            ELSE 0
        END INTO v_coupon_conversion
    FROM public.coupon_stats cs
    JOIN public.coupons c ON cs.coupon_id = c.id
    WHERE c.merchant_id = p_merchant_id
    AND cs.date >= CURRENT_DATE - 30;

    IF v_coupon_conversion >= 40 THEN
        v_coupon_score := 100;
    ELSIF v_coupon_conversion >= 25 THEN
        v_coupon_score := 80;
    ELSIF v_coupon_conversion >= 15 THEN
        v_coupon_score := 60;
    ELSIF v_coupon_conversion >= 5 THEN
        v_coupon_score := 40;
    ELSE
        v_coupon_score := 20;
    END IF;

    -- 3. 종합 점수 계산
    v_overall := (v_activity_score * 0.3 + v_coupon_score * 0.3 +
                  v_customer_score * 0.2 + v_compliance_score * 0.2)::INTEGER;

    -- 4. 건강도 기록 저장
    INSERT INTO public.merchant_health_scores (
        merchant_id,
        date,
        overall_score,
        activity_score,
        coupon_score,
        customer_score,
        compliance_score,
        risk_level
    )
    VALUES (
        p_merchant_id,
        CURRENT_DATE,
        v_overall,
        v_activity_score,
        v_coupon_score,
        v_customer_score,
        v_compliance_score,
        CASE
            WHEN v_overall >= 70 THEN 'normal'
            WHEN v_overall >= 40 THEN 'warning'
            ELSE 'critical'
        END
    )
    ON CONFLICT (merchant_id, date)
    DO UPDATE SET
        overall_score = EXCLUDED.overall_score,
        activity_score = EXCLUDED.activity_score,
        coupon_score = EXCLUDED.coupon_score,
        risk_level = EXCLUDED.risk_level,
        updated_at = NOW();

    RETURN v_overall;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- 10. RLS 정책
-- =========================================================

ALTER TABLE public.merchant_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anomaly_alerts ENABLE ROW LEVEL SECURITY;

-- 관리자만 승인 이력 조회/수정 가능
CREATE POLICY "Admins can manage approvals"
ON public.merchant_approvals FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('HQ', 'ADMIN')
    )
);

-- 감사 로그는 관리자만 조회 가능
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('HQ', 'ADMIN')
    )
);

-- 거래 이벤트는 관리자 또는 해당 가맹점만 조회 가능
CREATE POLICY "View transaction events"
ON public.transaction_events FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('HQ', 'ADMIN')
    )
    OR
    merchant_id IN (
        SELECT mu.merchant_id FROM public.merchant_users mu
        WHERE mu.user_id = auth.uid()
    )
);
