# AIRCTT Sprint 1 상세 설계서

> **작성일**: 2025-12-21
> **모드**: PLAN MODE (설계 전용, 코드 작성 금지)
> **검수자**: 아미 (승인 후 구현 모드 전환)
> **목표**: 가맹점 가입 시 기본틀 자동 생성 + 중복 정리

---

## 1. Sprint 1 목표 요약

| 항목 | 설명 | 우선순위 |
|------|------|----------|
| 1.1 | 가맹점 등록 → 기본 Store 자동 생성 | 🔴 필수 |
| 1.2 | 매장 전용 URL slug 자동 생성 | 🔴 필수 |
| 1.3 | 업종별 추천 쿠폰 템플릿 제공 | 🔴 필수 |
| 1.4 | 기본 QR 코드 자동 생성 | 🟡 권장 |
| 1.5 | 중복 파일/폴더 정리 | 🟡 권장 |
| 1.6 | 온보딩 가이드 UI | 🟢 선택 |

---

## 2. 현재 상태 분석

### 2.1 가맹점 등록 페이지 (`/merchant/register/page.tsx`)

**현재 상태**:
- 폼 필드: `businessName`, `ownerName`, `category`, `phone`, `address`, `description`
- 등록 후: 단순히 `/merchant/dashboard`로 리다이렉트
- API 연결: ❌ 없음 (TODO 주석만 존재)
- Store 생성: ❌ 없음
- 쿠폰 템플릿: ❌ 없음

**문제점**:
```typescript
// 현재 코드 (line 30-41)
const handleRegister = async () => {
    setLoading(true);
    // TODO: Connect to Real API (Step 3 or later)
    await new Promise(r => setTimeout(r, 1500)); // 가짜 딜레이
    toast.success('입점 신청이 완료되었습니다!');
    router.push('/merchant/dashboard');
    setLoading(false);
};
```

### 2.2 가맹점 서비스 (`merchant-service.ts`)

**현재 상태**:
- LocalStorage 기반 MVP 데모용
- `merchantProfileService`: 프로필 저장/조회
- `outletService`: 매장(아울렛) CRUD
- `couponService`: 쿠폰 CRUD
- `initDemo()`: 데모 데이터 초기화

**문제점**:
- Supabase와 이중 구조
- 등록 시 자동 Store 생성 로직 없음
- URL slug 생성 로직 없음

### 2.3 DB 스키마 (`20251210_v1_master_build.sql`)

**관련 테이블**:
```sql
-- merchants: 가맹점 기본 정보
merchants (id, name, type, homepage_url, created_at, updated_at)

-- stores: 매장 정보 (merchant 1:N store)
stores (id, merchant_id, name, description, address, lat, lng,
        phone, opening_hours, homepage_url, is_active, ...)

-- coupons: 쿠폰 (merchant 소유)
coupons (id, merchant_id, store_id, title, description,
         discount_type, discount_value, valid_from, valid_to, ...)

-- store_tables & table_qr_codes: 테이블 QR
store_tables (id, store_id, name, zone, is_active)
table_qr_codes (id, store_table_id, qr_code_path, deep_link_url)
```

**누락 필드**:
- `merchants.slug`: URL용 고유 슬러그 ❌
- `stores.slug`: 매장별 슬러그 ❌
- `merchants.approval_status`: 승인 상태 ❌ (Sprint 3)

---

## 3. 상세 설계

### 3.1 가맹점 등록 → Store 자동 생성

#### 3.1.1 프로세스 플로우

```
[가맹점 등록 폼 제출]
         │
         ▼
┌─────────────────────────────────────────┐
│  Step 1: merchants 테이블에 INSERT      │
│  - name, type, homepage_url             │
│  - slug 자동 생성                        │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Step 2: stores 테이블에 INSERT          │
│  - merchant_id (FK)                      │
│  - name = merchants.name + " 본점"       │
│  - address, phone (폼에서 입력)          │
│  - is_active = true                      │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Step 3: 기본 QR 코드 생성 (선택)        │
│  - store_tables: "기본 테이블" 1개       │
│  - table_qr_codes: QR 경로 생성          │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Step 4: 추천 쿠폰 템플릿 제안           │
│  - 업종(category)에 따라 3개 템플릿      │
│  - 저장 안 함, UI에서만 제안             │
└─────────────────────────────────────────┘
         │
         ▼
[대시보드로 이동 + 온보딩 가이드 표시]
```

#### 3.1.2 DB 스키마 변경 (마이그레이션)

```sql
-- 파일: supabase/migrations/20251221_sprint1_auto_setup.sql

-- 1. merchants 테이블에 slug 추가
ALTER TABLE public.merchants
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- 2. stores 테이블에 slug 추가
ALTER TABLE public.stores
ADD COLUMN IF NOT EXISTS slug TEXT;

-- 3. slug 자동 생성 함수
CREATE OR REPLACE FUNCTION public.generate_slug(input_name TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- 한글/영문 처리, 특수문자 제거, 공백 → 하이픈
    base_slug := lower(regexp_replace(input_name, '[^a-zA-Z0-9가-힣\s]', '', 'g'));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := trim(both '-' from base_slug);

    -- 중복 체크 및 넘버링
    final_slug := base_slug;
    WHILE EXISTS (SELECT 1 FROM public.merchants WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;

    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- 4. 가맹점 등록 시 자동 Store 생성 트리거
CREATE OR REPLACE FUNCTION public.auto_create_store_on_merchant()
RETURNS TRIGGER AS $$
BEGIN
    -- 기본 Store 생성
    INSERT INTO public.stores (merchant_id, name, is_active)
    VALUES (NEW.id, NEW.name || ' 본점', true);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_create_store ON public.merchants;
CREATE TRIGGER trg_auto_create_store
AFTER INSERT ON public.merchants
FOR EACH ROW
EXECUTE FUNCTION public.auto_create_store_on_merchant();
```

#### 3.1.3 API 엔드포인트 설계

**POST `/api/merchant/register`**

```typescript
// 요청 Body
interface MerchantRegisterRequest {
  businessName: string;       // 상호명
  ownerName: string;          // 대표자명
  category: 'restaurant' | 'cafe' | 'culture' | 'shopping' | 'beauty';
  phone: string;              // 전화번호
  address: string;            // 주소
  description?: string;       // 한줄 소개
  email?: string;             // 이메일 (선택)
}

// 응답 Body
interface MerchantRegisterResponse {
  success: boolean;
  merchant: {
    id: string;
    slug: string;
    name: string;
    type: string;
  };
  store: {
    id: string;
    name: string;
  };
  recommendedTemplates: CouponTemplate[];  // 추천 쿠폰 템플릿
  nextSteps: string[];  // 온보딩 가이드
}
```

**처리 로직**:
```
1. 입력 검증 (Zod)
2. merchants INSERT (slug 자동 생성)
3. DB 트리거로 stores 자동 생성
4. 업종에 맞는 쿠폰 템플릿 조회
5. 응답 반환
```

---

### 3.2 URL Slug 자동 생성

#### 3.2.1 Slug 생성 규칙

| 입력 | 출력 slug | 설명 |
|------|-----------|------|
| `에어씨티티 강남점` | `에어씨티티-강남점` | 한글 유지, 공백→하이픈 |
| `Jollibee Dubai` | `jollibee-dubai` | 영문 소문자화 |
| `카페 드 파리!@#` | `카페-드-파리` | 특수문자 제거 |
| `스타벅스` (중복) | `스타벅스-1`, `스타벅스-2` | 중복 시 넘버링 |

#### 3.2.2 프론트엔드 URL 구조

```
/store/{merchant_slug}           → 가맹점 대표 매장
/store/{merchant_slug}/{store_slug}  → 특정 매장 (멀티매장)

예시:
/store/에어씨티티-강남점
/store/jollibee-dubai
/store/스타벅스/강남역점
```

---

### 3.3 업종별 추천 쿠폰 템플릿

#### 3.3.1 템플릿 데이터 구조

```typescript
interface CouponTemplate {
  id: string;
  category: string;           // 업종
  title: string;              // 쿠폰명
  description: string;        // 설명
  discountType: 'percent' | 'amount';
  discountValue: number;
  minOrderAmount?: number;    // 최소 주문금액
  validDays: number;          // 유효기간 (일)
  suggested: boolean;         // 추천 여부
}
```

#### 3.3.2 업종별 템플릿 목록

**음식점 (restaurant)**
| 템플릿 ID | 제목 | 할인 | 조건 |
|-----------|------|------|------|
| `rest-001` | 첫 방문 감사 쿠폰 | 10% | 최소 15,000원 |
| `rest-002` | 점심 특가 할인 | 3,000원 | 11:00~14:00 |
| `rest-003` | 2인 이상 음료 서비스 | 음료 무료 | 2인 이상 |

**카페/디저트 (cafe)**
| 템플릿 ID | 제목 | 할인 | 조건 |
|-----------|------|------|------|
| `cafe-001` | 첫 음료 할인 | 20% | - |
| `cafe-002` | 세트 할인 | 2,000원 | 음료+디저트 |
| `cafe-003` | 스탬프 적립 쿠폰 | 1잔 무료 | 10잔 구매 시 |

**문화/공연 (culture)**
| 템플릿 ID | 제목 | 할인 | 조건 |
|-----------|------|------|------|
| `cult-001` | 평일 할인 | 20% | 월~목 |
| `cult-002` | 동반 1인 무료 | 1인 무료 | 2인 이상 |
| `cult-003` | 조기예매 할인 | 15% | D-7 이전 |

**쇼핑/패션 (shopping)**
| 템플릿 ID | 제목 | 할인 | 조건 |
|-----------|------|------|------|
| `shop-001` | 신규회원 할인 | 10% | 첫 구매 |
| `shop-002` | 5만원 이상 할인 | 5,000원 | 50,000원 이상 |
| `shop-003` | 리뷰 작성 적립금 | 2,000원 | 리뷰 작성 시 |

**뷰티/운동 (beauty)**
| 템플릿 ID | 제목 | 할인 | 조건 |
|-----------|------|------|------|
| `beau-001` | 첫 이용 할인 | 30% | 첫 방문 |
| `beau-002` | 재방문 할인 | 15% | 30일 내 재방문 |
| `beau-003` | 친구 추천 | 10,000원 | 추천인/피추천인 |

#### 3.3.3 템플릿 저장 위치

**옵션 A**: 정적 JSON 파일 (권장 - Sprint 1)
```
src/data/coupon-templates.json
```

**옵션 B**: DB 테이블 (Sprint 2+)
```sql
CREATE TABLE public.coupon_templates (
    id UUID PRIMARY KEY,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    discount_type public.discount_type,
    discount_value NUMERIC,
    min_order_amount NUMERIC,
    valid_days INTEGER,
    is_active BOOLEAN DEFAULT true
);
```

---

### 3.4 기본 QR 코드 자동 생성

#### 3.4.1 생성 시점

- **트리거**: Store 생성 직후
- **생성 내용**:
  - `store_tables`: "기본 테이블" 1개
  - `table_qr_codes`: QR 경로 및 딥링크

#### 3.4.2 QR 코드 URL 구조

```
https://ctt.kr/order/{store_id}/{table_id}
→ QR 스캔 시 테이블 주문 페이지로 이동
```

#### 3.4.3 QR 생성 라이브러리

```typescript
// 권장: qrcode 패키지
import QRCode from 'qrcode';

const qrDataUrl = await QRCode.toDataURL(deepLinkUrl, {
  width: 300,
  margin: 2,
  color: { dark: '#000000', light: '#ffffff' }
});
```

---

### 3.5 중복 파일/폴더 정리 계획

#### 3.5.1 삭제 대상

| 경로 | 이유 | 조치 |
|------|------|------|
| `CTT_MCP/` | 중복 Next.js 앱 복사본 | 🗑️ 삭제 |
| `coupon_3d.html` | 프로젝트와 무관 | 🗑️ 삭제 또는 이동 |

#### 3.5.2 통합 대상

| 현재 | 통합 후 | 이유 |
|------|---------|------|
| `/consumer/stores/[id]` | 유지 | 메인 매장 상세 |
| `/consumer/market/store/[id]` | → 리다이렉트 처리 | 중복 제거 |
| `BottomNav.tsx` | 통합 | `BottomTabNav.tsx`로 |

#### 3.5.3 마이그레이션 계획

| 단계 | 작업 | 리스크 |
|------|------|--------|
| 1 | `CTT_MCP/` 백업 후 삭제 | 낮음 |
| 2 | 중복 페이지에 리다이렉트 추가 | 낮음 |
| 3 | LocalStorage → Supabase 전환 (Sprint 2) | 중간 |

---

## 4. 파일 변경 목록

### 4.1 신규 생성 파일

| 파일 | 설명 |
|------|------|
| `supabase/migrations/20251221_sprint1_auto_setup.sql` | DB 마이그레이션 |
| `src/app/api/merchant/register/route.ts` | 가맹점 등록 API |
| `src/data/coupon-templates.json` | 쿠폰 템플릿 데이터 |
| `src/lib/slug-service.ts` | Slug 생성 유틸리티 |
| `src/lib/qr-service.ts` | QR 생성 유틸리티 |

### 4.2 수정 파일

| 파일 | 변경 내용 |
|------|-----------|
| `src/app/merchant/register/page.tsx` | API 연결, 응답 처리 |
| `src/app/merchant/dashboard/page.tsx` | 온보딩 가이드 추가 |
| `src/lib/merchant-service.ts` | Supabase 연동 준비 |

### 4.3 삭제 파일

| 파일/폴더 | 이유 |
|-----------|------|
| `CTT_MCP/` (폴더 전체) | 중복 |
| `coupon_3d.html` | 프로젝트 외부 파일 |

---

## 5. 구현 순서 (의존성 기반)

```
Phase 1: DB 준비
├── [1] 마이그레이션 파일 작성
└── [2] Supabase에 적용

Phase 2: 백엔드 API
├── [3] slug-service.ts 작성
├── [4] /api/merchant/register 엔드포인트
└── [5] coupon-templates.json 데이터

Phase 3: 프론트엔드 연결
├── [6] register/page.tsx API 연결
├── [7] dashboard에 온보딩 가이드
└── [8] 추천 쿠폰 템플릿 UI

Phase 4: 정리
├── [9] 중복 파일 삭제
└── [10] 리다이렉트 설정
```

---

## 6. 테스트 시나리오

### 6.1 가맹점 등록 테스트

| # | 시나리오 | 예상 결과 |
|---|----------|-----------|
| T1 | 정상 등록 | merchants + stores 생성, slug 자동 할당 |
| T2 | 중복 상호명 | slug에 넘버링 추가 (`-1`, `-2`) |
| T3 | 특수문자 포함 상호명 | 특수문자 제거된 slug 생성 |
| T4 | 필수 필드 누락 | 400 에러 + 검증 메시지 |

### 6.2 추천 쿠폰 템플릿 테스트

| # | 시나리오 | 예상 결과 |
|---|----------|-----------|
| T5 | 음식점 선택 | 음식점용 템플릿 3개 반환 |
| T6 | 카페 선택 | 카페용 템플릿 3개 반환 |
| T7 | 템플릿 선택 후 생성 | 쿠폰 생성 페이지로 프리필 |

---

## 7. 완료 조건 (Definition of Done)

### Sprint 1 완료 체크리스트

- [ ] 가맹점 등록 시 `merchants` 테이블에 저장
- [ ] 등록 시 `stores` 테이블에 기본 매장 자동 생성
- [ ] `slug` 필드 자동 생성 및 중복 처리
- [ ] 업종별 추천 쿠폰 템플릿 3개씩 제안
- [ ] 대시보드에 온보딩 가이드 표시
- [ ] `CTT_MCP/` 폴더 삭제 완료
- [ ] 모든 테스트 시나리오 통과

---

## 8. 리스크 및 대응

| 리스크 | 영향 | 대응 방안 |
|--------|------|-----------|
| Supabase 연결 실패 | 높음 | LocalStorage 폴백 유지 |
| 한글 slug 인코딩 이슈 | 중간 | URL 인코딩 처리 추가 |
| 기존 데모 데이터 충돌 | 낮음 | 마이그레이션 시 기존 데이터 보존 |

---

## 9. 아미 검수 항목

- [ ] 프로세스 플로우가 사업 목표와 일치하는가?
- [ ] DB 스키마 변경이 적절한가?
- [ ] API 설계가 충분한가?
- [ ] 쿠폰 템플릿 내용이 적절한가?
- [ ] 구현 순서가 합리적인가?
- [ ] 삭제 대상 파일에 동의하는가?

---

## 10. 다음 단계

**아미 승인 후**:
1. PLAN MODE 종료
2. 구현 모드 전환
3. Phase 1 (DB 준비)부터 순차 진행

---

> 📝 **문서 버전**: v1.0
> 🔒 **최종 책임**: 아미
> 🤖 **작성**: Claude (PLAN MODE)
