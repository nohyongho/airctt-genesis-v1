# AIRCTT / PETCTT 종합 기획서 v2.0
> 작성일: 2026-02-13 | 작성: Antigravity (엔티)

---

## 📌 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **서비스명** | AIRCTT (에어CTT) / PETCTT (펫CTT, 쿠폰톡톡) |
| **핵심 컨셉** | AR 기반 쿠폰 배포·게임·지갑·장터·정산 통합 플랫폼 |
| **특허** | 10-2019-0071298 / 10-2022-0166543 |
| **기술 스택** | Next.js 14 (App Router), Supabase, Tailwind, Framer Motion |
| **배포** | Vercel (airctt.com / petctt.com) |

---

## 🔄 2. 핵심 순환구조 (Circular Flow)

### 2.1 메인 순환 루프

```
┌─────────────────────────────────────────────────────────────────┐
│                    AIRCTT 쿠폰 순환 생태계                        │
│                                                                  │
│  ┌──────────┐    쿠폰 발행     ┌──────────────┐                  │
│  │ 머천트    │ ──────────────→ │ 쿠폰 배포     │                  │
│  │ (가맹점)  │                 │ (반경/시간/   │                  │
│  │          │ ←────────────── │  유효기간설정) │                  │
│  │          │    정산금 수령   └──────┬───────┘                  │
│  └────┬─────┘                        │                           │
│       │                              │ GPS 반경 내 노출           │
│       │ 매출/고객DB                   │ 게임/이벤트                │
│       │                              ▼                           │
│  ┌────┴─────┐                 ┌──────────────┐                  │
│  │ 정산     │                 │ 소비자       │                  │
│  │ 시스템   │                 │ (유저)       │                  │
│  │          │                 │              │                  │
│  │ • 주간정산│                 │ • 게임 플레이│                  │
│  │ • 수수료 │                 │ • 쿠폰 획득  │                  │
│  │ • 세금   │                 │ • 지갑 저장  │                  │
│  └────┬─────┘                 └──────┬───────┘                  │
│       │                              │                           │
│       │                              │ 쿠폰 클릭                 │
│       │                              ▼                           │
│  ┌────┴─────┐                 ┌──────────────┐                  │
│  │ 결제     │ ←────────────── │ 매장 사이트  │                  │
│  │ (PG연동) │    결제 요청    │ (발행매장)   │                  │
│  │          │ ──────────────→ │              │                  │
│  │          │    결제 완료    │ • 메뉴 보기  │                  │
│  └──────────┘                 │ • 구매/계산  │                  │
│                               │ • 예약       │                  │
│                               │ • 배달 주문  │                  │
│                               └──────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 상세 순환 흐름 (Step-by-Step)

```
[Step 1] 머천트: 쿠폰 발행 신청
    → 쿠폰 제목, 할인율, 수량, 유효기간 설정
    → 배포 반경 설정 (50m ~ 20,000km)
    → 배포 시간/날짜 설정
    → 쿠폰 디자인 업로드
    → 발행 비용: 지갑 저장 시 50원/장

[Step 2] 시스템: 쿠폰 배포
    → GPS 기반 반경 내 소비자에게 노출
    → 이벤트 게임(3D 터치)에 쿠폰 삽입
    → 시간/날짜 스케줄링으로 자동 배포

[Step 3] 소비자: 쿠폰 획득
    → 3D 터치 게임 플레이 → 쿠폰 획득
    → 근처 쿠폰 검색으로 획득
    → 획득 즉시 → 지갑(Wallet)에 자동 저장
    → 고객 DB에 자동 등록 (merchant_customers)

[Step 4] 소비자: 쿠폰 사용 (★ 핵심 순환 포인트)
    → 지갑에서 쿠폰 클릭
    → 발행 매장 사이트(홈페이지)로 이동
    → 매장에서 메뉴/상품 보기
    → 구매/계산 진행 (쿠폰 자동 적용)
    → 또는 예약/배달 주문
    → QR 스캔으로 오프라인 사용

[Step 5] 머천트: 정산
    → 사용된 쿠폰 → 주간 자동 정산
    → 매출 - 수수료(3.5%) = 정산금 지급
    → 쿠폰 발행 비용 차감
    → 대시보드에서 매출/고객 분석

[Step 6] 순환 반복
    → 머천트: 고객 데이터 기반 새 쿠폰 발행
    → 소비자: 재방문 → 추가 쿠폰 획득
    → 생태계 확장
```

### 2.3 채팅 순환 (쿠톡방)

```
[소비자 A] ←→ [쿠톡방 채팅] ←→ [소비자 B]
                   │
                   ├── 쿠폰 공유/선물
                   ├── 매장 리뷰/추천
                   ├── 실시간 이벤트 알림
                   └── 머천트 고객 상담
```

---

## 🔍 3. 현재 구현 상태 vs 빠진 기능

### 3.1 구현 완료 ✅

| 모듈 | 상태 | 설명 |
|------|------|------|
| 홈페이지 | ✅ | PETCTT 랜딩 페이지 (Next.js + Static HTML) |
| 3D 쿠폰 게임 | ✅ | 떨어지는 쿠폰 잡기 게임 |
| 소비자 지갑 | ✅ 부분 | localStorage 기반, Supabase 연동 일부 |
| 매장 리스트 | ✅ | 카테고리 필터, 검색 |
| 머천트 대시보드 | ✅ 부분 | 데모 데이터, 통계 차트 |
| 쿠폰 발행 UI | ✅ 기본 | 제목/할인율/수량만, 세부 설정 없음 |
| 테이블 오더 | ✅ | QR → 메뉴 → 장바구니 → 주문 |
| 주방 모니터 | ✅ | 실시간 주문 표시 |
| 문화공연 | ✅ | 공연 등록/좌석/티켓 |
| 결제 시스템 | ✅ 준비 | PG 연동 구조 (토스/이니시스 자리) |
| 정산 시스템 | ✅ DB | 테이블/함수 있음, UI 기본 |
| DB 스키마 | ✅ | 30+ 테이블 (Supabase) |
| RLS 정책 | ✅ | Row Level Security 적용 |

### 3.2 빠진 기능 ❌

| # | 기능 | 현재 상태 | 중요도 |
|---|------|----------|--------|
| 1 | **쿠폰→매장사이트 이동** | 쿠폰 클릭 시 매장 홈페이지 이동 로직 없음 | 🔴 필수 |
| 2 | **구매/계산 연결** | 테이블오더만, 일반 구매 플로우 없음 | 🔴 필수 |
| 3 | **예약 시스템** | 완전 미구현 | 🟡 중요 |
| 4 | **배달 주문** | 완전 미구현 | 🟡 중요 |
| 5 | **쿠폰 배포 시간/날짜** | DB에 valid_from/to 있으나 UI 없음 | 🔴 필수 |
| 6 | **반경 설정 50m~20,000km** | DB에 radius_km 있으나 UI 없음 (PRD는 1km 최소) | 🔴 필수 |
| 7 | **채팅창 (쿠톡방)** | 완전 미구현 | 🟡 중요 |
| 8 | **쿠폰→지갑 자동 저장** | 게임→지갑 일부, 근처 쿠폰→지갑 미완 | 🔴 필수 |
| 9 | **머천트 정산-쿠폰발행 연동** | 정산 테이블 있으나 쿠폰 비용 차감 로직 없음 | 🟡 중요 |
| 10 | **고객DB 자동등록** | merchant_customers 테이블 있으나 자동 트리거 없음 | 🟡 중요 |
| 11 | **알림/푸시** | 완전 미구현 | 🟠 보통 |
| 12 | **쿠폰 업그레이드** | upgraded_from_issue_id 필드만 있음, 로직 없음 | 🟠 보통 |

---

## 📐 4. 전체 DB 스키마 (ERD 텍스트)

### 4.1 현재 스키마 테이블 목록

```
┌─────────────────────────────────────────────────┐
│              AIRCTT DB Schema (Supabase)         │
├─────────────────────────────────────────────────┤
│                                                  │
│  [인증/사용자]                                    │
│  ├── auth.users (Supabase Auth)                  │
│  ├── public.users (id→auth.users)                │
│  ├── public.user_roles                           │
│  └── public.consumers                            │
│                                                  │
│  [지갑/경제]                                      │
│  ├── public.wallets (소비자 지갑)                  │
│  └── public.wallet_transactions (소비자 거래내역)   │
│                                                  │
│  [가맹점]                                         │
│  ├── public.merchants                            │
│  ├── public.merchant_users                       │
│  ├── public.merchant_customers                   │
│  ├── public.merchant_wallets (가맹점 지갑)         │
│  ├── public.stores                               │
│  └── public.store_categories                     │
│                                                  │
│  [상품/테이블]                                     │
│  ├── public.products                             │
│  ├── public.product_media                        │
│  ├── public.store_tables                         │
│  └── public.table_qr_codes                       │
│                                                  │
│  [쿠폰]                                          │
│  ├── public.coupons (템플릿)                      │
│  │   ├── radius_km, center_lat/lng               │
│  │   ├── valid_from, valid_to                    │
│  │   ├── per_user_limit, total_issuable          │
│  │   └── discount_type (percent/amount)          │
│  └── public.coupon_issues (발행 인스턴스)          │
│      ├── is_used, used_at, used_order_id         │
│      └── upgraded_from_issue_id (자기참조)         │
│                                                  │
│  [이벤트/게임]                                     │
│  ├── public.events                               │
│  ├── public.event_participations                 │
│  ├── public.game_sessions                        │
│  └── public.game_rewards                         │
│                                                  │
│  [주문/결제]                                      │
│  ├── public.orders                               │
│  ├── public.order_items                          │
│  └── public.payments                             │
│                                                  │
│  [문화공연]                                       │
│  ├── public.cultural_events                      │
│  ├── public.event_showtimes                      │
│  ├── public.event_seat_maps                      │
│  ├── public.event_seats                          │
│  ├── public.tickets                              │
│  └── public.ticket_types                         │
│                                                  │
│  [정산]                                           │
│  ├── public.settlements                          │
│  └── public.settlement_items                     │
│                                                  │
│  [공통]                                           │
│  ├── public.categories                           │
│  ├── public.media_assets                         │
│  └── public.topup_packages                       │
│                                                  │
└─────────────────────────────────────────────────┘
```

### 4.2 추가 필요 테이블 (신규)

```sql
-- ============================================
-- 1. 채팅 시스템 (쿠톡방)
-- ============================================

CREATE TABLE public.chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    type TEXT NOT NULL DEFAULT 'direct',
    -- 'direct' (1:1), 'group', 'merchant_support', 'coupon_share'
    store_id UUID REFERENCES public.stores(id),
    created_by UUID REFERENCES public.users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.chat_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- 'admin', 'member'
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id),
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    -- 'text', 'image', 'coupon_share', 'location', 'system'
    metadata JSONB DEFAULT '{}',
    -- 쿠폰 공유 시: { coupon_issue_id, coupon_title, discount }
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. 예약 시스템
-- ============================================

CREATE TABLE public.reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id),
    user_id UUID REFERENCES public.users(id),
    phone TEXT,
    name TEXT NOT NULL,
    party_size INTEGER DEFAULT 1,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status TEXT DEFAULT 'pending',
    -- 'pending', 'confirmed', 'cancelled', 'completed', 'no_show'
    coupon_issue_id UUID REFERENCES public.coupon_issues(id),
    special_requests TEXT,
    confirmed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. 배달 시스템
-- ============================================

CREATE TABLE public.delivery_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id),
    store_id UUID NOT NULL REFERENCES public.stores(id),
    user_id UUID REFERENCES public.users(id),
    delivery_address TEXT NOT NULL,
    delivery_lat NUMERIC(9,6),
    delivery_lng NUMERIC(9,6),
    delivery_phone TEXT NOT NULL,
    delivery_memo TEXT,
    estimated_minutes INTEGER,
    delivery_fee NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'pending',
    -- 'pending', 'accepted', 'preparing', 'picked_up', 'delivering', 'delivered', 'cancelled'
    driver_id UUID REFERENCES public.users(id),
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. 알림/푸시
-- ============================================

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT,
    type TEXT NOT NULL,
    -- 'coupon_received', 'coupon_expiring', 'order_status', 'chat_message',
    -- 'settlement_complete', 'reservation_confirmed', 'delivery_update'
    reference_id UUID,
    reference_type TEXT,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. 쿠폰 배포 스케줄
-- ============================================

CREATE TABLE public.coupon_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
    schedule_type TEXT NOT NULL DEFAULT 'once',
    -- 'once', 'daily', 'weekly', 'monthly'
    start_date DATE NOT NULL,
    end_date DATE,
    start_time TIME, -- 하루 중 배포 시작 시간
    end_time TIME,   -- 하루 중 배포 종료 시간
    days_of_week INTEGER[], -- {1,2,3,4,5} = 월~금
    radius_min_m INTEGER DEFAULT 50,      -- 최소 반경 (미터)
    radius_max_m INTEGER DEFAULT 20000000, -- 최대 반경 (미터) = 20,000km
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🗺️ 5. 페이지 구조 (라우트 맵)

### 5.1 소비자 앱 (`/consumer/*`)

```
/                          → 메인 랜딩 (PETCTT)
/consumer                  → 소비자 홈
/consumer/game             → 3D 쿠폰 게임
/consumer/wallet           → 내 지갑 (쿠폰 목록, QR, 포인트)
/consumer/stores           → 매장 리스트
/consumer/stores/[id]      → 매장 상세 → 메뉴/구매/예약/배달
/consumer/market           → 구름장터 마켓
/consumer/market/store/[id]→ 마켓 매장 상세
/consumer/orders           → 내 주문 내역
/consumer/profile          → 프로필
/consumer/ar               → AR 이벤트
/consumer/culture/*        → 문화공연
/consumer/chat             → 쿠톡방 (채팅) ← ❌ 미구현
/consumer/reservations     → 내 예약 내역 ← ❌ 미구현
```

### 5.2 머천트 앱 (`/merchant/*`)

```
/merchant                  → 머천트 홈
/merchant/dashboard        → 대시보드
/merchant/coupons          → 쿠폰 관리
/merchant/coupons/new      → 쿠폰 발행 (★ 반경/시간/유효기간 설정)
/merchant/products         → 상품 관리
/merchant/orders           → 주문 관리
/merchant/kitchen          → 주방 모니터
/merchant/wallet           → 가맹점 지갑
/merchant/topup            → 충전
/merchant/settlements      → 정산 내역
/merchant/marketing        → 마케팅
/merchant/stats            → 통계
/merchant/settings         → 설정
/merchant/qr               → QR 코드
/merchant/chat             → 고객 상담 채팅 ← ❌ 미구현
/merchant/reservations     → 예약 관리 ← ❌ 미구현
/merchant/delivery         → 배달 관리 ← ❌ 미구현
```

---

## 🚀 6. 개발 우선순위 (로드맵)

### Phase 1: 순환구조 핵심 (2주)
1. ✅ 쿠폰 → 매장사이트 이동 연결
2. ✅ 쿠폰 → 지갑 자동 저장(완성)
3. ✅ 쿠폰 발행 UI: 반경(50m~20,000km) 슬라이더
4. ✅ 쿠폰 발행 UI: 시간/날짜/유효기간 캘린더
5. ✅ 머천트-정산-쿠폰발행 비용 연동

### Phase 2: 거래 확장 (2주)
6. 구매/계산 플로우 (일반 주문)
7. 예약 시스템 (reservations)
8. 배달 주문 시스템 (delivery_orders)
9. 고객DB 자동등록 트리거

### Phase 3: 커뮤니케이션 (1주)
10. 쿠톡방 채팅 (Supabase Realtime)
11. 쿠폰 공유/선물 기능
12. 알림/푸시 시스템

### Phase 4: 고급 기능 (2주)
13. 쿠폰 업그레이드 로직
14. AI 추천 알고리즘
15. PG 실제 연동 (토스페이먼츠)
16. 배포 스케줄 자동화 (coupon_schedules)

---

## 📋 7. API 현황 및 추가 필요 API

### 7.1 현재 API (44개)

| 카테고리 | 엔드포인트 | 상태 |
|---------|-----------|------|
| 쿠폰 | `/api/coupons/issue` | ✅ |
| 쿠폰 | `/api/coupons/use` | ✅ |
| 쿠폰 | `/api/coupons/nearby` | ✅ |
| 쿠폰 | `/api/coupons/share` | ✅ |
| 게임 | `/api/game/start` | ✅ |
| 게임 | `/api/game/finish` | ✅ |
| 지갑 | `/api/wallet/my-balance` | ✅ |
| 지갑 | `/api/wallet/my-coupons` | ✅ |
| 지갑 | `/api/wallet/my-history` | ✅ |
| 지갑 | `/api/wallet/transaction` | ✅ |
| 주문 | `/api/order/cart` | ✅ |
| 주문 | `/api/order/session` | ✅ |
| 주문 | `/api/order/submit` | ✅ |
| 결제 | `/api/payment/confirm` | ✅ |
| 결제 | `/api/payment/topup` | ✅ |
| 머천트 | `/api/merchant/*` (9개) | ✅ |
| 티켓 | `/api/tickets/*` (2개) | ✅ |
| 관리자 | `/api/admin/*` (3개) | ✅ |

### 7.2 추가 필요 API

| 카테고리 | 엔드포인트 | 설명 |
|---------|-----------|------|
| 채팅 | `/api/chat/rooms` | 채팅방 생성/목록 |
| 채팅 | `/api/chat/messages` | 메시지 전송/조회 |
| 예약 | `/api/reservations/create` | 예약 생성 |
| 예약 | `/api/reservations/manage` | 예약 관리 (머천트) |
| 배달 | `/api/delivery/create` | 배달 주문 |
| 배달 | `/api/delivery/status` | 배달 상태 업데이트 |
| 알림 | `/api/notifications` | 알림 조회/읽음처리 |
| 쿠폰 | `/api/coupons/schedule` | 배포 스케줄 설정 |
| 쿠폰 | `/api/coupons/to-wallet` | 쿠폰→지갑 자동 저장 |
| 쿠폰 | `/api/coupons/upgrade` | 쿠폰 업그레이드 |
| 정산 | `/api/settlements/auto` | 자동 정산 실행 |

---

## 📊 8. 쿠폰 발행 설정 상세 스펙

### 8.1 반경 설정

| 범위 | 값 | 용도 |
|------|---|------|
| 초근접 | 50m ~ 500m | 매장 앞 즉시 배포 |
| 동네 | 500m ~ 3km | 동네 가맹점 |
| 지역 | 3km ~ 10km | 지역 이벤트 |
| 광역 | 10km ~ 50km | 시/군 단위 |
| 전국 | 50km ~ 500km | 프랜차이즈 |
| 글로벌 | 500km ~ 20,000km | 해외/전세계 |

### 8.2 시간/날짜 설정

```
쿠폰 스케줄 설정:
├── 배포 시작일: [캘린더]
├── 배포 종료일: [캘린더]
├── 하루 중 배포 시간: [시작 시간] ~ [종료 시간]
├── 요일 선택: □월 □화 □수 □목 □금 □토 □일
├── 유효기간: 쿠폰 획득 후 [N]일간 유효
└── 반복: ○ 1회성 ○ 매일 ○ 매주 ○ 매월
```

---

*이 기획서는 코드 분석을 기반으로 작성되었습니다.*
*빠진 기능들을 Phase별로 구현하면 완전한 순환구조가 완성됩니다.* 🚀
