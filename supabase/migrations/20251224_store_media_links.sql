-- =====================================================
-- AIRCTT Store Media & Links Migration
-- 매장 이미지/영상/링크 및 반경 설정 기능 추가
-- =====================================================

-- 1. stores 테이블에 새 컬럼 추가 (기존 유지 + 추가)
ALTER TABLE stores ADD COLUMN IF NOT EXISTS radius_meters INTEGER DEFAULT 5000;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS promo_video_url TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS order_url TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS reservation_url TEXT;

-- 2. store_media 테이블 생성 (갤러리 이미지/영상)
CREATE TABLE IF NOT EXISTS store_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('image', 'video')),
    url TEXT NOT NULL,
    title TEXT,
    sort_order INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'deleted')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. store_links 테이블 생성 (외부 링크)
CREATE TABLE IF NOT EXISTS store_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'deleted')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. admin_audit_logs 테이블 생성 (관리자 변경 기록)
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID,
    old_value JSONB,
    new_value JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_store_media_store_id ON store_media(store_id);
CREATE INDEX IF NOT EXISTS idx_store_media_status ON store_media(status);
CREATE INDEX IF NOT EXISTS idx_store_links_store_id ON store_links(store_id);
CREATE INDEX IF NOT EXISTS idx_store_links_status ON store_links(status);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_target ON admin_audit_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created ON admin_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_stores_radius ON stores(radius_meters);
CREATE INDEX IF NOT EXISTS idx_stores_location ON stores(lat, lng);

-- 6. RLS 정책 설정

-- store_media RLS
ALTER TABLE store_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "store_media_select" ON store_media;
CREATE POLICY "store_media_select" ON store_media
    FOR SELECT USING (status = 'active' OR status = 'hidden');

DROP POLICY IF EXISTS "store_media_insert" ON store_media;
CREATE POLICY "store_media_insert" ON store_media
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "store_media_update" ON store_media;
CREATE POLICY "store_media_update" ON store_media
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "store_media_delete" ON store_media;
CREATE POLICY "store_media_delete" ON store_media
    FOR DELETE USING (true);

-- store_links RLS
ALTER TABLE store_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "store_links_select" ON store_links;
CREATE POLICY "store_links_select" ON store_links
    FOR SELECT USING (status = 'active' OR status = 'hidden');

DROP POLICY IF EXISTS "store_links_insert" ON store_links;
CREATE POLICY "store_links_insert" ON store_links
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "store_links_update" ON store_links;
CREATE POLICY "store_links_update" ON store_links
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "store_links_delete" ON store_links;
CREATE POLICY "store_links_delete" ON store_links
    FOR DELETE USING (true);

-- admin_audit_logs RLS
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_audit_logs_select" ON admin_audit_logs;
CREATE POLICY "admin_audit_logs_select" ON admin_audit_logs
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin_audit_logs_insert" ON admin_audit_logs;
CREATE POLICY "admin_audit_logs_insert" ON admin_audit_logs
    FOR INSERT WITH CHECK (true);

-- 7. updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_store_media_updated_at ON store_media;
CREATE TRIGGER update_store_media_updated_at
    BEFORE UPDATE ON store_media
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_store_links_updated_at ON store_links;
CREATE TRIGGER update_store_links_updated_at
    BEFORE UPDATE ON store_links
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Supabase Storage 버킷 설정 (수동 또는 대시보드에서)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('store-media', 'store-media', true)
-- ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE store_media IS '매장 갤러리 미디어 (이미지/영상)';
COMMENT ON TABLE store_links IS '매장 외부 링크 (홈페이지, 구매, 예약 등)';
COMMENT ON TABLE admin_audit_logs IS '관리자 변경 이력 로그';
COMMENT ON COLUMN stores.radius_meters IS '매장 노출 반경 (0~20,000,000 미터)';
COMMENT ON COLUMN stores.hero_image_url IS '매장 대표 이미지 URL';
COMMENT ON COLUMN stores.promo_video_url IS '홍보 영상 URL (유튜브 등)';
COMMENT ON COLUMN stores.order_url IS '구매 페이지 외부 링크';
COMMENT ON COLUMN stores.reservation_url IS '예약 페이지 외부 링크';
