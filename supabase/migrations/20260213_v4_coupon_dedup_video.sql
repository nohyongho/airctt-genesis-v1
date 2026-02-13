-- =====================================================
-- AIRCTT v4: 쿠폰 구조 심장 정리
-- 2026-02-13
-- 1) 중복 발급 방지
-- 2) 영상 쿠폰 필드
-- 3) 캠페인 확장 대비
-- =====================================================

-- =====================================================
-- 1. 중복 발급 방지 유니크 인덱스
-- 동일 유저 + 동일 쿠폰 = 1장만
-- (캠페인 분리 시 campaign_id 추가 가능)
-- =====================================================

-- 같은 유저가 같은 쿠폰을 중복 발급받지 못하게
CREATE UNIQUE INDEX IF NOT EXISTS idx_coupon_issues_no_duplicate
  ON public.coupon_issues(user_id, coupon_id)
  WHERE is_used = false;

COMMENT ON INDEX idx_coupon_issues_no_duplicate
  IS '동일 유저+쿠폰 중복 발급 방지 (미사용 기준). 사용 후 재발급 가능.';

-- 향후 캠페인 분리용 컬럼 (선택적)
ALTER TABLE public.coupon_issues
  ADD COLUMN IF NOT EXISTS campaign_id UUID;

COMMENT ON COLUMN public.coupon_issues.campaign_id
  IS '캠페인별 분리 발급 시 사용. NULL이면 기본 발급.';

-- =====================================================
-- 2. 영상 쿠폰 필드 추가
-- video_url: 광고 영상 URL
-- video_autoplay_game: 게임에서 자동재생 여부
-- video_autoplay_wallet: 지갑에서 자동재생 여부
-- =====================================================

ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS video_autoplay_game BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS video_autoplay_wallet BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.coupons.video_url IS '쿠폰 광고 영상 URL (YouTube/MP4)';
COMMENT ON COLUMN public.coupons.video_autoplay_game IS '게임 내 muted autoplay 여부';
COMMENT ON COLUMN public.coupons.video_autoplay_wallet IS '지갑에서 클릭 시 sound ON 재생';

-- =====================================================
-- 완료! 🫀
-- 게임은 화려하게, 발급은 똑똑하게,
-- 지갑은 깔끔하게, 영상은 몰입감 있게
-- =====================================================
