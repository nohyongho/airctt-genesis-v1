# AIRCTT 구조 심장 진단서 🫀
> 2026-02-13 | 코드 레벨 정밀 분석

---

## 🔍 1. 현재 상태 진단

### 순환구조 한 줄 요약
```
노출(반경) → 획득(발급) → 보관(지갑) → 사용(결제) → 인증(사용처리) → 정산(머천트) → 재발행
```

### 각 단계별 코드 연결 상태

| # | 단계 | API | 페이지 | DB | 연결 |
|---|------|-----|--------|----|----|
| 1 | **반경 노출** | `/api/coupons/nearby` ✅ | 없음 ❌ | `coupons.radius_km` ✅ | ⚠️ API 있으나 호출하는 페이지 없음 |
| 2 | **게임 획득** | `/api/game/finish` ✅ | `/consumer/game` ✅ | `coupon_issues` ✅ | ✅ 동작 |
| 3 | **지갑 저장** | `/api/wallet/my-coupons` ✅ | `/consumer/wallet` ✅ | `coupon_issues` ✅ | ⚠️ 하드코딩 user_id |
| 4 | **쿠폰→매장이동** | 없음 ❌ | CouponCard 클릭 → ❌ | `stores.id` ✅ | ❌ **완전 끊김** |
| 5 | **구매/결제** | `/api/order/submit` ✅ | 테이블오더만 ✅ | `orders`, `payments` ✅ | ⚠️ 쿠폰→주문 연결은 있으나 일반구매 없음 |
| 6 | **쿠폰 사용처리** | `/api/coupons/use` ✅ | 없음 ❌ | `coupon_issues.is_used` ✅ | ⚠️ API 있으나 자동 호출 없음 |
| 7 | **정산** | `/api/merchant/settlements` ✅ | `/merchant/settlements` ✅ | `settlements` ✅ | ⚠️ 쿠폰 할인분 미반영 |
| 8 | **재발행** | 머천트 `/api/merchant/coupons` 없음 ❌ | `/merchant/coupons/new` ⚠️ Mock | `coupons` ✅ | ❌ Mock API |

---

## ❗ 2. 끊긴 흐름 목록 (8개)

### 🔴 CUT-1: 쿠폰 클릭 → 매장 이동 (심장 핵심!)
- **현상**: 지갑에서 쿠폰 카드 클릭 시 아무 일도 안 일어남
- **원인**: `CouponCard` 컴포넌트에 `store_id` 연결 없음. `coupon_issues` 쿼리에서 `stores` JOIN 없음
- **위치**: `src/app/consumer/wallet/page.tsx` L284-291, `src/components/consumer/CouponCard.tsx`
- **수정안**:
```tsx
// wallet/my-coupons API에서 store_id를 함께 리턴
.select(`*, coupons!inner(*, stores(id, name, slug))`)
// CouponCard 클릭 시 매장 이동
onClick={() => router.push(`/consumer/stores/${coupon.storeId}`)}
```

### 🔴 CUT-2: 머천트 쿠폰 발행 = Mock API
- **현상**: `/merchant/coupons/new` 에서 "발행하기" 클릭 → `setTimeout` 1초 후 성공 토스트만 표시
- **원인**: `handleCreate()` (L42-53)가 실제 API 호출 없이 `await new Promise(r => setTimeout(r, 1000))`
- **위치**: `src/app/merchant/coupons/new/page.tsx` L42-53
- **수정안**: `/api/merchant/coupons` POST API 생성 필요

### 🔴 CUT-3: 반경 설정 UI 없음
- **현상**: 머천트 쿠폰 발행 폼에 "자동 노출 (반경 500m)" 스위치만 있음. 반경 수치 변경 불가
- **원인**: `formData`에 `autoTargeting: true` Boolean만 있고 `radius_km` 필드 없음
- **위치**: `src/app/merchant/coupons/new/page.tsx` L21-31
- **수정안**: 반경 슬라이더(50m~20,000km) + 유효기간 캘린더 추가

### 🟡 CUT-4: 쿠폰 발급 API 스키마 불일치
- **현상**: `/api/coupons/issue`는 `consumer_id` + `status: 'ISSUED'` 사용
- **문제**: Master Schema는 `user_id` + `is_used: boolean` 사용 (`v1_master_build.sql`)
- **위치**: `src/app/api/coupons/issue/route.ts` L8, L18-23
- **수정안**: `consumer_id` → `user_id`, `status` → 제거 (is_used 사용)

### 🟡 CUT-5: 주문→결제→쿠폰사용 자동 체인 없음
- **현상**: `order/submit`에서 `coupon_issue_id`로 할인 계산은 하지만, 쿠폰의 `is_used=true` 처리 안함
- **원인**: `order/submit` L72-98에서 쿠폰 조회만 하고 사용 처리(update) 안 함
- **위치**: `src/app/api/order/submit/route.ts` L72-98
- **수정안**: 주문 확정 시 `coupon_issues.is_used = true` 업데이트 추가

### 🟡 CUT-6: 정산에 쿠폰 할인분 미반영
- **현상**: `settlements` POST에서 `payments.final_amount` 합산만 함. 쿠폰 할인으로 인한 매장 부담분 미계산
- **원인**: 정산 로직이 결제 금액만 집계, 쿠폰 비용(장당 50원) 차감 없음
- **위치**: `src/app/api/merchant/settlements/route.ts` L116-137
- **수정안**: `coupon_issues` WHERE `used_store_id = merchant.store_id` COUNT * 50 차감

### 🟠 CUT-7: 채팅 시스템 완전 부재
- **현상**: 채팅 관련 코드/테이블/API 전무
- **수정안**: `chat_rooms`, `chat_members`, `chat_messages` 테이블 + Supabase Realtime

### 🟠 CUT-8: 예약/배달 stub 없음
- **현상**: 매장 상세 페이지에 `reservation_url` 외부 링크만 있고 자체 예약 시스템 없음
- **위치**: `src/app/consumer/stores/[id]/page.tsx` L462-470
- **수정안**: `reservations` 테이블 + `/api/reservations/create` API

---

## 🛠 3. 수정 코드/SQL

### 3-A. 쿠폰→매장 이동 수정 (CUT-1 해결)

**`/api/wallet/my-coupons/route.ts`** 수정:
```ts
// 기존: coupons!inner(title, description, discount_value, valid_to, merchants(name))
// 수정: stores 정보 추가
.select(`
  id, is_used, issued_at,
  coupons!inner(
    title, description, discount_value, discount_type, valid_to,
    store_id,
    merchants(name),
    stores(id, name, slug)
  )
`)

// formatted에 store_id 추가
const formatted = data.map((issue: any) => ({
  ...기존필드,
  storeId: issue.coupons.store_id,
  storeName: issue.coupons.stores?.name,
  storeSlug: issue.coupons.stores?.slug,
}));
```

### 3-B. 머천트 쿠폰 발행 API 신규 (CUT-2 해결)

**`/api/merchant/coupons/route.ts`** 신규:
```ts
export async function POST(request: Request) {
  const body = await request.json();
  const { merchant_id, store_id, title, description,
    discount_type, discount_value, total_issuable,
    valid_from, valid_to, radius_km, center_lat, center_lng,
    min_order_amount, per_user_limit } = body;

  const client = createPostgrestClient();

  const { data, error } = await client
    .from('coupons')
    .insert({
      merchant_id, store_id, title, description,
      discount_type, discount_value, total_issuable,
      valid_from, valid_to,
      radius_km: radius_km || 5,
      center_type: 'store',
      center_lat, center_lng,
      min_order_amount: min_order_amount || 0,
      per_user_limit: per_user_limit || 1,
      is_active: true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}
```

### 3-C. 주문 시 쿠폰 자동 사용처리 (CUT-5 해결)

**`/api/order/submit/route.ts`** L98 뒤에 추가:
```ts
// 쿠폰 사용 처리 (순환구조 핵심!)
if (coupon_issue_id && discountAmount > 0) {
  await postgrest
    .from('coupon_issues')
    .update({
      is_used: true,
      used_at: new Date().toISOString(),
      used_store_id: session.store_id,
    })
    .eq('id', coupon_issue_id);
}
```

### 3-D. 반경 시스템 DB 보완 SQL

```sql
-- origin_type: 매장 기준 / 임의 좌표 기준
ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS origin_type TEXT DEFAULT 'store',
  -- 'store' = 매장 좌표 기준, 'custom' = 임의 좌표 기준, 'nationwide' = 전국
  ADD COLUMN IF NOT EXISTS radius_m INTEGER DEFAULT 5000,
  -- 미터 단위 (50 ~ 20000000 = 20,000km)
  ADD COLUMN IF NOT EXISTS distribution_start_time TIME,
  ADD COLUMN IF NOT EXISTS distribution_end_time TIME,
  ADD COLUMN IF NOT EXISTS distribution_days INTEGER[] DEFAULT '{1,2,3,4,5,6,7}';

-- 반경 검색 함수 (PostGIS 없이 Haversine)
CREATE OR REPLACE FUNCTION get_nearby_coupons(
  user_lat NUMERIC, user_lng NUMERIC,
  radius_km NUMERIC DEFAULT 5,
  category_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  coupon_id UUID, title TEXT, description TEXT,
  discount_type TEXT, discount_value NUMERIC,
  store_name TEXT, store_address TEXT,
  distance_km NUMERIC, valid_to TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id, c.title, c.description,
    c.discount_type::TEXT, c.discount_value,
    s.name, s.address,
    (6371 * acos(cos(radians(user_lat)) * cos(radians(
      COALESCE(c.center_lat, s.lat))) *
      cos(radians(COALESCE(c.center_lng, s.lng)) -
      radians(user_lng)) +
      sin(radians(user_lat)) *
      sin(radians(COALESCE(c.center_lat, s.lat))))
    )::NUMERIC AS distance_km,
    c.valid_to
  FROM coupons c
  JOIN stores s ON s.id = c.store_id
  WHERE c.is_active = true
    AND (c.valid_from IS NULL OR c.valid_from <= NOW())
    AND (c.valid_to IS NULL OR c.valid_to >= NOW())
    AND (6371 * acos(cos(radians(user_lat)) * cos(radians(
      COALESCE(c.center_lat, s.lat))) *
      cos(radians(COALESCE(c.center_lng, s.lng)) -
      radians(user_lng)) +
      sin(radians(user_lat)) *
      sin(radians(COALESCE(c.center_lat, s.lat))))
    ) <= COALESCE(c.radius_km, radius_km)
  ORDER BY distance_km ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 채팅 시스템 (Supabase Realtime 기반)
CREATE TABLE IF NOT EXISTS public.chat_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id),
  consumer_user_id UUID NOT NULL REFERENCES users(id),
  merchant_user_id UUID REFERENCES users(id),
  subject TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'resolved', 'closed'
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_thread ON chat_messages(thread_id, created_at DESC);

ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own threads" ON chat_threads
  FOR SELECT USING (
    consumer_user_id = auth.uid() OR merchant_user_id = auth.uid()
  );

CREATE POLICY "Users see own messages" ON chat_messages
  FOR SELECT USING (
    thread_id IN (SELECT id FROM chat_threads WHERE
      consumer_user_id = auth.uid() OR merchant_user_id = auth.uid())
  );

-- Supabase Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
```

---

## 🚀 4. 최종 흐름 다이어그램 (수정 후)

```
╔══════════════════════════════════════════════════════════════╗
║              AIRCTT 구조 심장 - 돈이 도는 순환                  ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║   ① 머천트: 쿠폰 발행                                        ║
║   ┌────────────────────────────┐                              ║
║   │ /merchant/coupons/new      │                              ║
║   │ → POST /api/merchant/coupons│ ←── 💰 발행비용(50원/장)     ║
║   │ → DB: coupons INSERT       │      merchant_wallets 차감   ║
║   │ → radius_m, valid_from/to  │                              ║
║   │ → origin_type, center_lat  │                              ║
║   └────────────┬───────────────┘                              ║
║                │                                              ║
║                ▼                                              ║
║   ② 시스템: 반경 노출                                         ║
║   ┌────────────────────────────┐                              ║
║   │ GET /api/coupons/nearby    │                              ║
║   │ → GPS(lat,lng) + radius_km │                              ║
║   │ → Haversine 거리 계산       │                              ║
║   │ → 유효기간/배포시간 필터     │                              ║
║   │ → 게임에 쿠폰 삽입          │                              ║
║   └────────────┬───────────────┘                              ║
║                │                                              ║
║                ▼                                              ║
║   ③ 소비자: 획득 → 지갑                                       ║
║   ┌────────────────────────────┐                              ║
║   │ /consumer/game (3D 게임)   │                              ║
║   │ → POST /api/game/finish    │                              ║
║   │ → coupon_issues INSERT     │                              ║
║   │ → merchant_customers 등록  │ ←── 고객DB 자동                ║
║   │ → wallet 카운트 업데이트    │                              ║
║   └────────────┬───────────────┘                              ║
║                │                                              ║
║                ▼                                              ║
║   ④ 지갑에서 쿠폰 클릭 → 매장 이동  ★ CUT-1 수정              ║
║   ┌────────────────────────────┐                              ║
║   │ /consumer/wallet           │                              ║
║   │ → 쿠폰카드 클릭            │                              ║
║   │ → router.push(/stores/:id) │ ←── store_id 연결!           ║
║   └────────────┬───────────────┘                              ║
║                │                                              ║
║                ▼                                              ║
║   ⑤ 매장에서 구매/예약/배달                                    ║
║   ┌────────────────────────────┐                              ║
║   │ /consumer/stores/[id]      │                              ║
║   │ → 메뉴 보기 / 상품 보기    │                              ║
║   │ → 구매하기 (order_url)     │                              ║
║   │ → 예약하기 (reservation)   │                              ║
║   │ → 테이블오더 (QR 스캔)     │                              ║
║   │ → 🛒 장바구니 → 주문확정    │                              ║
║   └────────────┬───────────────┘                              ║
║                │                                              ║
║                ▼                                              ║
║   ⑥ 결제 + 쿠폰 사용처리  ★ CUT-5 수정                        ║
║   ┌────────────────────────────┐                              ║
║   │ POST /api/order/submit     │                              ║
║   │ → 쿠폰 할인 계산            │                              ║
║   │ → coupon_issues.is_used=T  │ ←── 사용처리 자동!            ║
║   │ → POST /api/payment/confirm│                              ║
║   │ → 토스페이먼츠 PG 승인      │                              ║
║   │ → payments.status='paid'   │                              ║
║   └────────────┬───────────────┘                              ║
║                │                                              ║
║                ▼                                              ║
║   ⑦ 머천트 정산  ★ CUT-6 수정                                 ║
║   ┌────────────────────────────┐                              ║
║   │ POST /api/merchant/settlements│                           ║
║   │ → 기간 내 payments 집계     │                              ║
║   │ → 수수료(3.5%) 차감         │                              ║
║   │ → 쿠폰 할인분 정산 포함     │ ←── 할인분 머천트 부담!       ║
║   │ → 정산금 = 매출-수수료-환불 │                              ║
║   │ → settlements INSERT       │                              ║
║   └────────────┬───────────────┘                              ║
║                │                                              ║
║                ▼                                              ║
║   ⑧ 리워드 & 재발행 → ①로 순환                                ║
║   ┌────────────────────────────┐                              ║
║   │ 머천트 대시보드 분석        │                              ║
║   │ → 고객DB 확인 → 리타겟팅    │                              ║
║   │ → 새 쿠폰 발행 → ① 반복   │                              ║
║   └────────────────────────────┘                              ║
║                                                              ║
║   💬 채팅(쿠톡방): 전 단계 어디서든 소통 가능                    ║
║   ┌────────────────────────────┐                              ║
║   │ Supabase Realtime          │                              ║
║   │ → chat_threads + messages  │                              ║
║   │ → 소비자 ↔ 가맹점 상담     │                              ║
║   │ → 쿠폰 공유/선물           │                              ║
║   └────────────────────────────┘                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 📊 5. 스키마 요약 (테이블/관계/RLS)

### 핵심 테이블 관계도
```
users ─┬─→ consumers ──→ wallets
       ├─→ merchant_users ──→ merchants ──→ stores
       │                         │            │
       │                         ▼            ▼
       │                      coupons ──→ coupon_issues ──→ (지갑)
       │                         │            │
       │                         ▼            ▼
       │                   coupon_schedules  orders ──→ payments
       │                                       │         │
       │                                       ▼         ▼
       │                               kitchen_orders  settlements
       │
       └─→ chat_threads ──→ chat_messages (Realtime)
```

### 테이블별 RLS 정책
| 테이블 | SELECT | INSERT | UPDATE | 비고 |
|--------|--------|--------|--------|------|
| users | 자기자신 | Auth 트리거 | 자기자신 | |
| coupons | 모두 (active) | merchant만 | merchant 소유 | |
| coupon_issues | 자기자신 | 시스템/게임 | 시스템만 | |
| orders | 자기자신+매장 | 인증유저 | 매장주인 | |
| payments | 자기자신+매장 | 시스템 | 시스템 | |
| settlements | merchant 소유 | 관리자 | 관리자 | |
| chat_threads | 참여자만 | 인증유저 | 참여자 | Realtime |
| chat_messages | 참여자만 | 참여자 | 발신자 | Realtime |

---

## 📁 6. 핵심 폴더 구조

```
airctt-genesis-v1/           ← 프로젝트 루트
├── src/
│   ├── app/
│   │   ├── api/              ← ★ API 레이어 (44개 라우트)
│   │   │   ├── coupons/      ← 쿠폰 (issue/use/nearby/share)
│   │   │   ├── game/         ← 게임 (start/finish)
│   │   │   ├── wallet/       ← 지갑 (my-balance/my-coupons/my-history)
│   │   │   ├── order/        ← 주문 (cart/session/submit)
│   │   │   ├── payment/      ← 결제 (confirm/topup)
│   │   │   └── merchant/     ← 머천트 (settlements/stats/wallet/...)
│   │   ├── consumer/         ← ★ 소비자 페이지 (17개)
│   │   └── merchant/         ← ★ 머천트 페이지 (19개)
│   ├── components/           ← UI 컴포넌트 (98개)
│   ├── lib/                  ← ★ 서비스 레이어 (39개)
│   │   ├── postgrest.ts      ← Supabase PostgREST 클라이언트
│   │   ├── wallet-service.ts ← 지갑 서비스
│   │   ├── store-service.ts  ← 매장 서비스
│   │   └── crm-service.ts    ← CRM 서비스
│   ├── hooks/                ← 커스텀 훅 (useGeolocation 등)
│   └── contexts/             ← React Context (I18n)
├── supabase/
│   └── migrations/           ← ★ DB 스키마 (14개 SQL)
├── docs/                     ← 기획서/진단서
└── prd/                      ← PRD + ERD
```

---

*이 진단서는 실제 코드 파일을 한 줄씩 분석하여 작성되었습니다.*
*❌ 표시된 8개 끊긴 지점을 수정하면 심장이 뜁니다.* 🫀🔥
