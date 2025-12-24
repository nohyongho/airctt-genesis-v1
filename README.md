# AIRCTT - AR/XR 기반 쿠폰 & 이벤트 플랫폼

위치 기반 AR 쿠폰 플랫폼으로, 가맹점과 소비자를 실시간 프로모션, 리워드, 게이미피케이션으로 연결합니다.

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 15+, React 19, TypeScript |
| 스타일링 | Tailwind CSS 4 |
| UI 컴포넌트 | Radix UI, Lucide Icons |
| 3D/AR | Three.js, React Three Fiber |
| 데이터베이스 | Supabase (PostgreSQL) |
| 폼 검증 | React Hook Form, Zod |
| 차트 | Recharts |
| 애니메이션 | Framer Motion |

## 주요 기능

### 소비자 앱
- 카테고리별 매장 탐색 (카페, 음식점, 리테일, 문화, 서비스)
- 실시간 쿠폰 및 이벤트 확인
- 위치 기반 게임으로 쿠폰/포인트 획득
- AR 가상 피팅 체험
- 지갑 관리 (쿠폰, 포인트, 거래 내역)
- AI 챗봇 지원
- 문화 이벤트 예매 (공연, 콘서트)

### 가맹점 대시보드
- 매장 프로필 및 지점 관리
- 쿠폰 생성 및 발급
- 실시간 매출/쿠폰 사용 통계
- QR 기반 테이블 주문
- 마케팅 캠페인 관리
- AI 마케팅 추천

### 관리자/CRM 패널
- 가맹점 및 매장 관리
- 글로벌 이벤트 관리
- 뉴스/공지 배포
- 시스템 분석

## 프로젝트 구조

```
ctt-claude/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API 라우트
│   │   ├── consumer/           # 소비자 페이지
│   │   ├── merchant/           # 가맹점 페이지
│   │   └── crm/admin/          # 관리자 페이지
│   ├── components/
│   │   ├── consumer/           # 소비자 UI (19개 컴포넌트)
│   │   ├── merchant/           # 가맹점 UI
│   │   ├── admin/              # 관리자 UI
│   │   └── ui/                 # Radix UI 래퍼
│   ├── lib/                    # 서비스 & 유틸리티
│   │   ├── merchant-service.ts # 가맹점 비즈니스 로직
│   │   ├── wallet-service.ts   # 지갑/포인트 관리
│   │   ├── database.types.ts   # Supabase 타입 (자동 생성)
│   │   └── i18n.ts             # 다국어 지원
│   ├── contexts/               # React Context (I18n)
│   └── hooks/                  # 커스텀 훅
├── supabase/
│   ├── migrations/             # DB 마이그레이션
│   └── seed_demo.sql           # 데모 데이터
├── docs/                       # API 문서
├── CTT_MCP/                    # 시스템 아키텍처 문서
├── prd/                        # 기획 문서 (PRD)
└── public/                     # 정적 자산 (이미지, 사운드)
```

## 주요 페이지 라우트

### 소비자
| 라우트 | 설명 |
|--------|------|
| `/consumer` | 메인 마켓플레이스 |
| `/consumer/market/store/[id]` | 매장 상세 (쿠폰, 이벤트, 리뷰) |
| `/consumer/game` | 쿠폰 획득 게임 |
| `/consumer/ar/[id]` | AR 체험 |
| `/consumer/wallet` | 지갑 관리 |
| `/consumer/culture/performance/[id]` | 공연 상세 |

### 가맹점
| 라우트 | 설명 |
|--------|------|
| `/merchant/dashboard` | 메인 대시보드 |
| `/merchant/coupons` | 쿠폰 관리 |
| `/merchant/marketing` | 마케팅 도구 |
| `/merchant/stats` | 통계 분석 |
| `/merchant/ai-assistant` | AI 마케팅 어시스턴트 |

### 관리자
| 라우트 | 설명 |
|--------|------|
| `/crm/admin` | 관리자 대시보드 |
| `/crm/admin/connections` | 파트너십 관리 |
| `/crm/admin/news` | 글로벌 뉴스 관리 |

## API 엔드포인트

### 쿠폰
- `POST /api/coupons/issue` - 소비자에게 쿠폰 발급
- `POST /api/coupons/use` - 쿠폰 사용 처리

### 게임
- `POST /api/game/start` - 게임 세션 시작
- `POST /api/game/finish` - 게임 완료 및 리워드 지급

### 지갑
- `GET /api/wallet/my-balance` - 포인트 잔액 조회
- `GET /api/wallet/my-coupons` - 보유 쿠폰 목록
- `POST /api/wallet/transaction` - 포인트 트랜잭션

### 리워드
- `POST /api/rewards/claim` - 리워드 수령

## 데이터베이스 스키마

### 핵심 테이블
- `users` - 사용자 정보
- `merchants` - 가맹점 (restaurant/retail/culture/service)
- `stores` - 매장 (위치, 영업시간)
- `coupons` - 쿠폰 (할인율, 유효기간, 반경)
- `coupon_issues` - 발급된 쿠폰 추적
- `wallets` - 소비자 지갑 (포인트, 잔액)
- `transactions` - 포인트 거래 내역
- `game_sessions` - 게임 세션
- `events` - 이벤트 (글로벌/카테고리/매장)
- `orders` - 주문 (테이블/온라인/티켓)

### 타입 정의
```typescript
merchant_type: 'restaurant' | 'retail' | 'culture' | 'service' | 'other'
discount_type: 'percent' | 'amount'
issue_origin: 'event' | 'merchant' | 'admin' | 'table_order'
order_status: 'pending' | 'paid' | 'preparing' | 'completed' | 'cancelled'
```

## 시작하기

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env.example`을 복사하여 `.env.local` 생성:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
POSTGREST_URL=your_postgrest_url
POSTGREST_API_KEY=your_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. 데이터베이스 설정
```bash
# Supabase 마이그레이션 적용
npx supabase db push

# 데모 데이터 시드 (선택)
# supabase/seed_demo.sql 참조
```

### 4. 개발 서버 실행
```bash
npm run dev
```
[http://localhost:3000](http://localhost:3000)에서 확인

## 스크립트

```bash
npm run dev      # 개발 서버 (Turbopack)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버
npm run lint     # ESLint 검사
```

## 주요 컴포넌트

### 소비자 컴포넌트 (`src/components/consumer/`)
- `AIChatBot.tsx` - AI 지원 챗봇
- `ARCamera.tsx` - AR 카메라 인터페이스
- `EventGameWindow.tsx` - 게이미피케이션 UI
- `MapView.tsx` / `StoreMapView.tsx` - 위치 기반 지도
- `CouponCard.tsx`, `StoreCard.tsx` - 카드 컴포넌트
- `BottomTabNav.tsx` - 모바일 네비게이션
- `RabbitReward.tsx` - 리워드 애니메이션
- `MissionOverlay.tsx`, `MonsterPin.tsx` - 게임 UI

### 서비스 (`src/lib/`)
- `merchant-service.ts` - 가맹점 CRUD 및 비즈니스 로직
- `wallet-service.ts` - 지갑, 쿠폰, 포인트 관리
- `ar-camera-service.ts` - AR 체험 처리
- `fitting-service.ts` - 가상 피팅
- `google-maps-service.ts` - 지도 및 위치 서비스
- `i18n.ts` - 다국어 지원 (한국어, 영어)

## 아키텍처 특징

- **멀티테넌트**: 소비자/가맹점/관리자 역할 분리
- **RLS 정책**: Supabase Row-Level Security로 데이터 격리
- **PostgREST 사용**: @supabase/supabase-js 대신 PostgREST 클라이언트 사용
- **모바일 퍼스트**: 반응형 디자인
- **타입 안전성**: TypeScript + 자동 생성 DB 타입

## 문서

- `docs/CTT_API_OVERVIEW_FOR_PARTNERS.md` - 파트너용 API 레퍼런스
- `docs/CTT_V2_API_DESIGN.md` - v2 API 설계
- `docs/CTT_DATA_MODIFICATION_GUIDE.md` - 데이터 수정 가이드
- `CTT_MCP/architecture.md` - 시스템 아키텍처
- `prd/AIRCTT_PRD_v1.0.md` - 제품 요구사항 문서

## 환경 변수 옵션

```env
NEXT_PUBLIC_ENABLE_SUPABASE=false   # Supabase 활성화
NEXT_PUBLIC_ENABLE_EMAIL=false       # 이메일 기능 활성화
NEXT_PUBLIC_ENABLE_FILE_UPLOAD=false # 파일 업로드 활성화
```

## 개발 시 참고사항

1. **데모 모드**: 환경 변수 미설정 시 목업 데이터 사용
2. **인증**: 세션 기반 + Bearer 토큰
3. **API 응답 패턴**: `{ success: boolean, data?: any, errorMessage?: string }`
4. **다국어**: I18nContext로 언어 전환 지원
