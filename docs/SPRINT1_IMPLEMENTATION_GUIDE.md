# AIRCTT Sprint 1 구현 가이드 (v1.0)

## 현재 상태
- ✅ Phase 1 [1] DB 마이그레이션 파일 작성 완료
- ⏳ Phase 1 [2] Supabase 마이그레이션 적용 대기
- ⏳ Phase 2 API/서비스 구현 대기

---

## Phase 1 [2] Supabase 마이그레이션 적용

### 1. 적용 전 체크리스트

| # | 항목 | 확인 |
|---|------|------|
| 1 | Supabase 프로젝트 접속 가능 | ☐ |
| 2 | Database 권한 (postgres 또는 service_role) | ☐ |
| 3 | 기존 merchants 테이블 존재 | ☐ |
| 4 | 기존 stores 테이블 존재 | ☐ |
| 5 | 기존 store_tables 테이블 존재 | ☐ |
| 6 | uuid-ossp 확장 활성화 | ☐ |

### 2. 적용 전 백업 (권장)

```sql
-- 기존 데이터 백업 (Supabase SQL Editor에서 실행)
CREATE TABLE IF NOT EXISTS public.merchants_backup_20251222 AS
SELECT * FROM public.merchants;

CREATE TABLE IF NOT EXISTS public.stores_backup_20251222 AS
SELECT * FROM public.stores;
```

### 3. 실행 순서

#### Step 1: 필수 확장 확인
```sql
-- uuid-ossp 확장 확인 및 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

#### Step 2: 마이그레이션 실행
Supabase Dashboard → SQL Editor에서 `20251221_sprint1_auto_setup.sql` 전체 내용 실행

**또는** Supabase CLI 사용:
```bash
# 프로젝트 루트에서 실행
cd C:\Users\zeus1\OneDrive\Desktop\ctt-claude
supabase db push
```

#### Step 3: 실행 순서 (수동 분할 실행 시)

```
1. generate_slug() 함수 생성
2. merchants 테이블 컬럼 추가 (slug, owner_name, phone 등)
3. merchants_slug_key UNIQUE 제약조건 추가
4. stores 테이블 slug 컬럼 추가
5. auto_generate_merchant_slug() 트리거 함수 생성
6. trg_auto_merchant_slug 트리거 생성
7. auto_create_default_store() 트리거 함수 생성
8. trg_auto_create_store 트리거 생성
9. coupon_templates 테이블 생성
10. 기본 쿠폰 템플릿 15개 삽입
11. 인덱스 생성
12. 기존 NULL slug 데이터 업데이트
```

### 4. 실행 후 검증 SQL

```sql
-- =========================================================
-- 검증 1: generate_slug() 함수 테스트
-- =========================================================
SELECT public.generate_slug('아미한정식 & 카페') AS test_slug;
-- 예상 결과: '아미한정식-카페'

SELECT public.generate_slug('Cafe Mocha!!') AS test_slug;
-- 예상 결과: 'cafe-mocha'

SELECT public.generate_slug('   ') AS test_slug;
-- 예상 결과: 'store-xxxxxxxx' (랜덤 suffix)

-- =========================================================
-- 검증 2: merchants 테이블 구조 확인
-- =========================================================
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'merchants'
ORDER BY ordinal_position;

-- 필수 컬럼 확인
SELECT
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='merchants' AND column_name='slug') AS has_slug,
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='merchants' AND column_name='owner_name') AS has_owner_name,
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='merchants' AND column_name='approval_status') AS has_approval_status;

-- =========================================================
-- 검증 3: UNIQUE 제약조건 확인
-- =========================================================
SELECT conname, contype
FROM pg_constraint
WHERE conrelid = 'public.merchants'::regclass
AND conname LIKE '%slug%';
-- 예상 결과: merchants_slug_key, u

-- =========================================================
-- 검증 4: stores 테이블 slug 컬럼 확인
-- =========================================================
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'stores'
AND column_name = 'slug';

-- =========================================================
-- 검증 5: 트리거 확인
-- =========================================================
SELECT trigger_name, event_manipulation, action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table = 'merchants';
-- 예상 결과:
-- trg_auto_merchant_slug, INSERT, BEFORE
-- trg_auto_create_store, INSERT, AFTER

-- =========================================================
-- 검증 6: 쿠폰 템플릿 데이터 확인
-- =========================================================
SELECT category, COUNT(*) as count
FROM public.coupon_templates
GROUP BY category
ORDER BY category;
-- 예상 결과: 5개 카테고리, 각 3개씩 = 15개

-- =========================================================
-- 검증 7: 인덱스 확인
-- =========================================================
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND (tablename = 'merchants' OR tablename = 'stores' OR tablename = 'coupon_templates')
AND indexname LIKE 'idx_%';

-- =========================================================
-- 검증 8: 트리거 통합 테스트 (가맹점 등록 시뮬레이션)
-- =========================================================
-- 주의: 실제 데이터가 생성됩니다. 테스트 후 삭제 필요

-- 테스트 가맹점 생성
INSERT INTO public.merchants (business_name, description, address, phone)
VALUES ('테스트 한식당', '맛있는 한식', '서울시 강남구', '02-1234-5678')
RETURNING id, business_name, slug;

-- 자동 생성된 Store 확인
SELECT s.id, s.name, s.slug, s.merchant_id
FROM public.stores s
JOIN public.merchants m ON s.merchant_id = m.id
WHERE m.business_name = '테스트 한식당';

-- 자동 생성된 테이블 확인
SELECT st.id, st.name, st.zone
FROM public.store_tables st
JOIN public.stores s ON st.store_id = s.id
JOIN public.merchants m ON s.merchant_id = m.id
WHERE m.business_name = '테스트 한식당';

-- 테스트 데이터 정리 (선택)
-- DELETE FROM public.merchants WHERE business_name = '테스트 한식당';
```

### 5. 검증 결과 체크리스트

| # | 검증 항목 | 예상 결과 | 실제 결과 | 통과 |
|---|----------|----------|----------|------|
| 1 | generate_slug() 함수 동작 | 한글+영문 slug 생성 | | ☐ |
| 2 | merchants.slug 컬럼 존재 | TRUE | | ☐ |
| 3 | merchants_slug_key 제약조건 | 존재 | | ☐ |
| 4 | stores.slug 컬럼 존재 | TRUE | | ☐ |
| 5 | trg_auto_merchant_slug 트리거 | BEFORE INSERT | | ☐ |
| 6 | trg_auto_create_store 트리거 | AFTER INSERT | | ☐ |
| 7 | coupon_templates 15개 | 5카테고리 × 3개 | | ☐ |
| 8 | 트리거 통합 테스트 | Store + Table 자동 생성 | | ☐ |

### 6. 문제 발생 시 롤백

```sql
-- 트리거 제거
DROP TRIGGER IF EXISTS trg_auto_create_store ON public.merchants;
DROP TRIGGER IF EXISTS trg_auto_merchant_slug ON public.merchants;

-- 함수 제거
DROP FUNCTION IF EXISTS public.auto_create_default_store();
DROP FUNCTION IF EXISTS public.auto_generate_merchant_slug();
DROP FUNCTION IF EXISTS public.generate_slug(text);

-- 컬럼 제거 (주의: 데이터 손실)
-- ALTER TABLE public.merchants DROP COLUMN IF EXISTS slug;
-- ALTER TABLE public.stores DROP COLUMN IF EXISTS slug;

-- 백업에서 복원
-- DROP TABLE public.merchants;
-- ALTER TABLE public.merchants_backup_20251222 RENAME TO merchants;
```

---

## Phase 2: API/서비스 구현 설계

### 1. slug-service 설계

**파일 위치**: `src/lib/slug-service.ts`

```typescript
/**
 * Slug 생성 서비스
 * - 클라이언트 측 slug 미리보기용
 * - 실제 slug 생성은 DB 트리거에서 수행 (중복 체크 포함)
 */

export interface SlugOptions {
  maxLength?: number;      // 기본값: 50
  separator?: string;      // 기본값: '-'
  lowercase?: boolean;     // 기본값: true
}

/**
 * 텍스트를 URL-safe slug로 변환
 * @param text 원본 텍스트 (한글/영문/특수문자)
 * @param options 변환 옵션
 * @returns URL-safe slug 문자열
 *
 * @example
 * generateSlug('아미한정식 & 카페') // 'ami한정식-카페'
 * generateSlug('Cafe Mocha!!') // 'cafe-mocha'
 */
export function generateSlug(text: string, options?: SlugOptions): string;

/**
 * slug 유효성 검사
 * @param slug 검사할 slug
 * @returns 유효 여부
 */
export function isValidSlug(slug: string): boolean;

/**
 * slug 중복 체크 (API 호출)
 * @param slug 체크할 slug
 * @param type 'merchant' | 'store'
 * @returns { available: boolean, suggestion?: string }
 */
export async function checkSlugAvailability(
  slug: string,
  type: 'merchant' | 'store'
): Promise<{ available: boolean; suggestion?: string }>;
```

**구현 상세**:

```typescript
// src/lib/slug-service.ts

const DEFAULT_OPTIONS: SlugOptions = {
  maxLength: 50,
  separator: '-',
  lowercase: true,
};

export function generateSlug(text: string, options?: SlugOptions): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (!text || text.trim() === '') {
    return '';
  }

  let slug = text;

  // 1. 소문자 변환
  if (opts.lowercase) {
    slug = slug.toLowerCase();
  }

  // 2. 한글, 영문, 숫자 외 문자 → separator 치환
  slug = slug.replace(/[^a-z0-9가-힣]+/gi, opts.separator!);

  // 3. 연속 separator 제거
  slug = slug.replace(new RegExp(`${opts.separator}+`, 'g'), opts.separator!);

  // 4. 앞뒤 separator 제거
  slug = slug.replace(new RegExp(`^${opts.separator}|${opts.separator}$`, 'g'), '');

  // 5. 최대 길이 제한
  if (opts.maxLength && slug.length > opts.maxLength) {
    slug = slug.substring(0, opts.maxLength);
    // 잘린 부분이 separator로 끝나면 제거
    slug = slug.replace(new RegExp(`${opts.separator}$`), '');
  }

  return slug;
}

export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length < 2 || slug.length > 50) {
    return false;
  }
  // 허용: 소문자 영문, 숫자, 한글, 하이픈
  const pattern = /^[a-z0-9가-힣]+(-[a-z0-9가-힣]+)*$/;
  return pattern.test(slug);
}

export async function checkSlugAvailability(
  slug: string,
  type: 'merchant' | 'store'
): Promise<{ available: boolean; suggestion?: string }> {
  try {
    const res = await fetch(`/api/slug/check?slug=${encodeURIComponent(slug)}&type=${type}`);
    return await res.json();
  } catch {
    return { available: false };
  }
}
```

---

### 2. /api/merchant/register API 스펙

**엔드포인트**: `POST /api/merchant/register`

**파일 위치**: `src/app/api/merchant/register/route.ts`

#### Request

```typescript
interface RegisterMerchantRequest {
  // 필수 정보
  business_name: string;        // 사업자명/상호
  business_number: string;      // 사업자등록번호
  owner_name: string;           // 대표자명

  // 연락처
  phone: string;                // 대표 전화번호
  email: string;                // 이메일

  // 주소
  address: string;              // 사업장 주소

  // 선택 정보
  description?: string;         // 업체 소개
  category?: string;            // 업종 카테고리

  // 사용자 연결 (선택)
  user_id?: string;             // Supabase Auth user ID
}
```

#### Response (성공)

```typescript
interface RegisterMerchantResponse {
  success: true;
  data: {
    merchant: {
      id: string;
      business_name: string;
      slug: string;               // 자동 생성됨
      approval_status: 'pending';
    };
    store: {
      id: string;
      name: string;               // '{business_name} 본점'
      slug: string;               // '{merchant_slug}-main'
    };
    table: {
      id: string;
      name: string;               // '테이블 1'
    };
    recommended_templates: {      // 카테고리 기반 추천
      category: string;
      templates: CouponTemplate[];
    };
    next_steps: string[];         // 다음 단계 안내
  };
}
```

#### Response (실패)

```typescript
interface RegisterMerchantErrorResponse {
  success: false;
  error: string;
  code: 'VALIDATION_ERROR' | 'DUPLICATE_BUSINESS_NUMBER' | 'DATABASE_ERROR';
  details?: Record<string, string>;
}
```

#### 구현 로직

```typescript
// src/app/api/merchant/register/route.ts

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. 입력 검증
    const validation = validateMerchantInput(body);
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        error: '입력값이 올바르지 않습니다.',
        code: 'VALIDATION_ERROR',
        details: validation.errors,
      }, { status: 400 });
    }

    // 2. 사업자번호 중복 체크
    const { data: existing } = await postgrest
      .from('merchants')
      .select('id')
      .eq('business_number', body.business_number)
      .single();

    if (existing) {
      return NextResponse.json({
        success: false,
        error: '이미 등록된 사업자번호입니다.',
        code: 'DUPLICATE_BUSINESS_NUMBER',
      }, { status: 409 });
    }

    // 3. 가맹점 생성 (트리거가 slug + store + table 자동 생성)
    const { data: merchant, error } = await postgrest
      .from('merchants')
      .insert({
        business_name: body.business_name,
        business_number: body.business_number,
        owner_name: body.owner_name,
        phone: body.phone,
        email: body.email,
        address: body.address,
        description: body.description,
        category: body.category,
        approval_status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // 4. 자동 생성된 Store 조회
    const { data: store } = await postgrest
      .from('stores')
      .select('id, name, slug')
      .eq('merchant_id', merchant.id)
      .single();

    // 5. 자동 생성된 Table 조회
    const { data: table } = await postgrest
      .from('store_tables')
      .select('id, name')
      .eq('store_id', store?.id)
      .single();

    // 6. 카테고리 기반 쿠폰 템플릿 추천
    const category = mapCategoryToTemplate(body.category);
    const { data: templates } = await postgrest
      .from('coupon_templates')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('sort_order');

    // 7. merchant_users 연결 (user_id 있는 경우)
    if (body.user_id) {
      await postgrest.from('merchant_users').insert({
        merchant_id: merchant.id,
        user_id: body.user_id,
        role: 'owner',
      });
    }

    // 8. 응답 반환
    return NextResponse.json({
      success: true,
      data: {
        merchant: {
          id: merchant.id,
          business_name: merchant.business_name,
          slug: merchant.slug,
          approval_status: merchant.approval_status,
        },
        store: store,
        table: table,
        recommended_templates: {
          category,
          templates: templates || [],
        },
        next_steps: [
          '1. 쿠폰 템플릿을 선택하여 첫 쿠폰을 발행하세요',
          '2. QR 코드를 생성하여 테이블에 부착하세요',
          '3. 관리자 승인 후 서비스가 활성화됩니다',
        ],
      },
    });

  } catch (error) {
    console.error('Merchant register error:', error);
    return NextResponse.json({
      success: false,
      error: '가맹점 등록에 실패했습니다.',
      code: 'DATABASE_ERROR',
    }, { status: 500 });
  }
}
```

---

### 3. 쿠폰 템플릿 자동 추천 흐름

```
┌─────────────────────────────────────────────────────────────────────┐
│                    쿠폰 템플릿 자동 추천 흐름                          │
└─────────────────────────────────────────────────────────────────────┘

[1] 가맹점 등록 시 업종 선택
    ├── restaurant (음식점)
    ├── cafe (카페)
    ├── culture (문화/공연)
    ├── shopping (쇼핑/패션)
    └── beauty (뷰티/운동)

          │
          ▼

[2] 업종 → 템플릿 카테고리 매핑
    ┌─────────────────────────────────────┐
    │  mapCategoryToTemplate(category)    │
    │                                     │
    │  '한식', '중식', '일식' → restaurant │
    │  '카페', '베이커리'    → cafe       │
    │  '공연', '전시'        → culture    │
    │  '의류', '쇼핑몰'      → shopping   │
    │  '헬스', '미용'        → beauty     │
    └─────────────────────────────────────┘

          │
          ▼

[3] coupon_templates 테이블에서 조회
    SELECT * FROM coupon_templates
    WHERE category = '{mapped_category}'
    AND is_active = true
    ORDER BY sort_order

          │
          ▼

[4] 추천 템플릿 반환 (카테고리별 3개)
    ┌────────────────────────────────────────────────┐
    │  restaurant 카테고리 예시:                      │
    │                                                │
    │  1. 첫 방문 감사 쿠폰 (10% 할인)                │
    │  2. 점심 특가 할인 (3,000원 할인)               │
    │  3. 2인 이상 음료 서비스 (5,000원 할인)          │
    └────────────────────────────────────────────────┘

          │
          ▼

[5] 프론트엔드에서 템플릿 선택 UI 표시
    - 추천 템플릿 3개 카드 형태로 표시
    - "이 템플릿으로 첫 쿠폰 만들기" 버튼
    - 커스텀 생성 옵션도 제공

          │
          ▼

[6] 선택 시 쿠폰 생성 API 호출
    POST /api/coupons
    {
      merchant_id: "{merchant_id}",
      template_id: "{selected_template_id}",  // 또는 custom 데이터
      ...
    }
```

#### 카테고리 매핑 함수

```typescript
// src/lib/category-mapper.ts

const CATEGORY_MAP: Record<string, string> = {
  // 음식점
  '한식': 'restaurant',
  '중식': 'restaurant',
  '일식': 'restaurant',
  '양식': 'restaurant',
  '분식': 'restaurant',
  '패스트푸드': 'restaurant',

  // 카페
  '카페': 'cafe',
  '베이커리': 'cafe',
  '디저트': 'cafe',

  // 문화
  '공연': 'culture',
  '전시': 'culture',
  '영화': 'culture',
  '문화센터': 'culture',

  // 쇼핑
  '의류': 'shopping',
  '잡화': 'shopping',
  '쇼핑몰': 'shopping',
  '편의점': 'shopping',

  // 뷰티
  '미용실': 'beauty',
  '헬스': 'beauty',
  '스파': 'beauty',
  '네일': 'beauty',
};

export function mapCategoryToTemplate(category: string): string {
  return CATEGORY_MAP[category] || 'restaurant'; // 기본값: restaurant
}

export function getTemplateCategories(): string[] {
  return ['restaurant', 'cafe', 'culture', 'shopping', 'beauty'];
}
```

---

## 다음 단계 (Phase 2 구현)

Phase 1 [2] 마이그레이션 적용 완료 후:

1. **slug-service.ts 구현**
   - `src/lib/slug-service.ts` 파일 생성
   - 테스트 코드 작성

2. **/api/merchant/register 구현**
   - `src/app/api/merchant/register/route.ts` 수정
   - 입력 검증 로직 추가
   - 에러 핸들링 강화

3. **/api/slug/check API 추가**
   - slug 중복 체크 엔드포인트
   - 실시간 미리보기용

4. **프론트엔드 연동**
   - 가맹점 등록 폼 수정
   - 쿠폰 템플릿 선택 UI 추가
   - 성공 화면 업데이트

---

## 부록: 파일 구조

```
src/
├── lib/
│   ├── slug-service.ts          # Slug 생성/검증
│   ├── category-mapper.ts       # 카테고리 매핑
│   └── postgrest.ts             # Supabase 클라이언트
├── app/
│   └── api/
│       ├── merchant/
│       │   └── register/
│       │       └── route.ts     # 가맹점 등록 API
│       └── slug/
│           └── check/
│               └── route.ts     # Slug 중복 체크 API
└── data/
    └── coupon-templates.json    # 쿠폰 템플릿 (클라이언트 캐시용)

supabase/
└── migrations/
    └── 20251221_sprint1_auto_setup.sql
```
