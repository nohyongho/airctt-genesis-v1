# AIRCTT 전체 수정안 리뷰 문서 📋
> 2026-02-13 | 아미 리뷰용 — 코드 수정 전 확인 문서

---

## 📌 수정 원칙

1. **기존 코드 최대 보존** — 동작하는 코드는 건드리지 않음
2. **순환구조 연결 우선** — 끊긴 체인만 이어붙이기
3. **파일 단위로 정리** — 어떤 파일이 어떻게 바뀌는지 한눈에 확인
4. **신규 파일 명확 표시** — 🆕 마크

---

## 🔧 수정 파일 목록 (총 8개 수정 + 3개 신규)

| # | 파일 | 작업 | CUT |
|---|------|------|-----|
| 1 | `src/lib/consumer-types.ts` | 수정 | CUT-1 |
| 2 | `src/app/api/wallet/my-coupons/route.ts` | 수정 | CUT-1 |
| 3 | `src/components/consumer/CouponCard.tsx` | 수정 | CUT-1 |
| 4 | `src/app/consumer/wallet/page.tsx` | 수정 | CUT-1 |
| 5 | `src/app/merchant/coupons/new/page.tsx` | 수정 | CUT-2,3 |
| 6 | 🆕 `src/app/api/merchant/coupons/route.ts` | 신규 | CUT-2 |
| 7 | `src/app/api/coupons/issue/route.ts` | 수정 | CUT-4 |
| 8 | `src/app/api/order/submit/route.ts` | 수정 | CUT-5 |
| 9 | `src/app/api/merchant/settlements/route.ts` | 수정 | CUT-6 |
| 10 | 🆕 `supabase/migrations/20260213_v3_heart_fix.sql` | 신규 | CUT-3,7,8 |
| 11 | `src/lib/wallet-service.ts` | 수정 | CUT-1 |

---

## 📝 파일별 상세 수정안

### 1. `src/lib/consumer-types.ts` — Coupon 타입에 store 정보 추가

**현재 (L12-32):**
```ts
export interface Coupon {
  id: string;
  title: string;
  description: string;
  brand: string;
  status: 'available' | 'used' | 'expired';
  expiresAt: string;
  imageUrl?: string;
  discountRate?: number;
  issuerInfo?: { ... };
}
```

**수정 후:**
```ts
export interface Coupon {
  id: string;
  title: string;
  description: string;
  brand: string;
  status: 'available' | 'used' | 'expired';
  expiresAt: string;
  imageUrl?: string;
  discountRate?: number;
  // ★ 추가: 매장 연결 (순환구조 핵심)
  storeId?: string;
  storeName?: string;
  storeSlug?: string;
  discountType?: 'percent' | 'amount' | 'free_item';
  couponIssueId?: string;  // coupon_issues.id (사용처리용)
  issuerInfo?: { ... };
}
```

**영향:** `CouponCard`, `WalletPage` 등 Coupon 쓰는 모든 곳에서 `storeId` 접근 가능

---

### 2. `src/app/api/wallet/my-coupons/route.ts` — store 정보 JOIN

**현재 (L49-63):**
```ts
const { data, error } = await client
  .from('coupon_issues')
  .select(`
    id, is_used, issued_at,
    coupons!inner (
      title, description, discount_value, valid_to,
      merchants ( name )
    )
  `)
  .or(`user_id.eq.${consumerKey},user_id.eq.00000000-...`)
```

**수정 후:**
```ts
const { data, error } = await client
  .from('coupon_issues')
  .select(`
    id, is_used, issued_at,
    coupons!inner (
      title, description, discount_value, discount_type, valid_to,
      store_id,
      merchants ( name ),
      stores ( id, name, slug )
    )
  `)
  .or(`user_id.eq.${consumerKey},user_id.eq.00000000-...`)
```

**formatted 수정 (L71-80):**
```ts
const formatted = data.map((issue: any) => ({
  id: issue.id,
  couponIssueId: issue.id,
  title: issue.coupons.title,
  description: issue.coupons.description,
  brand: issue.coupons.merchants?.name || 'Unknown Brand',
  status: !issue.is_used ? 'available' : 'used',
  expiresAt: issue.coupons.valid_to,
  imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200',
  discountRate: issue.coupons.discount_value,
  discountType: issue.coupons.discount_type,
  // ★ 추가: 매장 연결
  storeId: issue.coupons.store_id,
  storeName: issue.coupons.stores?.name,
  storeSlug: issue.coupons.stores?.slug,
}));
```

---

### 3. `src/components/consumer/CouponCard.tsx` — 클릭 시 매장 이동

**현재 (L11-17):**
```ts
interface CouponCardProps {
  coupon: Coupon;
  distance?: string;
  storeName?: string;
  storeLocation?: { lat: number; lng: number };
  userLocation?: { lat: number; lng: number };
}
```

**수정 후:**
```ts
interface CouponCardProps {
  coupon: Coupon;
  distance?: string;
  storeName?: string;
  storeLocation?: { lat: number; lng: number };
  userLocation?: { lat: number; lng: number };
  onClickStore?: (storeId: string) => void;  // ★ 추가
}
```

**카드 전체를 클릭 가능하게 수정 (L78-84):**
```tsx
// 기존:
<Card className={`overflow-hidden transition-all relative ...`}>

// 수정:
<Card
  className={`overflow-hidden transition-all relative cursor-pointer hover:shadow-md ...`}
  onClick={() => {
    if (coupon.storeId && coupon.status === 'available' && onClickStore) {
      onClickStore(coupon.storeId);
    }
  }}
>
```

**매장 이름 표시 추가 (L122 뒤):**
```tsx
{coupon.storeName && (
  <p className="text-xs text-blue-500 font-medium">
    📍 {coupon.storeName}
  </p>
)}
```

---

### 4. `src/app/consumer/wallet/page.tsx` — 매장 이동 연결

**추가: router import 및 클릭 핸들러 (L5 근처):**
```ts
import { useRouter } from 'next/navigation';
// ...
const router = useRouter();

// 매장 이동 핸들러
const handleGoToStore = (storeId: string) => {
  router.push(`/consumer/stores/${storeId}`);
};
```

**CouponCard에 핸들러 전달 (L287-291):**
```tsx
// 기존:
<CouponCard coupon={coupon} distance={coupon.distance} storeName={coupon.store?.name} />

// 수정:
<CouponCard
  coupon={coupon}
  distance={coupon.distance}
  storeName={coupon.store?.name || coupon.storeName}
  onClickStore={handleGoToStore}
/>
```

---

### 5. `src/app/merchant/coupons/new/page.tsx` — 반경 + 유효기간 + 실제 API

**formData 확장 (L21-31):**
```ts
// 기존:
const [formData, setFormData] = useState({
  title: '', description: '', discountType: 'PERCENT',
  discountValue: '', totalQuantity: 100, validDays: 30,
  minOrderAmount: 0, autoTargeting: true, imageUrl: ''
});

// 수정:
const [formData, setFormData] = useState({
  title: '', description: '', discountType: 'PERCENT',
  discountValue: '', totalQuantity: 100,
  minOrderAmount: 0, imageUrl: '',
  // ★ 유효기간 (시작~종료)
  validFrom: '', // YYYY-MM-DD
  validTo: '',   // YYYY-MM-DD
  // ★ 반경 설정
  radiusType: 'store' as 'store' | 'custom' | 'nationwide',
  radiusM: 5000,  // 기본 5km (미터 단위, 50~20000000)
  centerLat: 0,
  centerLng: 0,
  // ★ 배포 시간
  distributionStartTime: '09:00',
  distributionEndTime: '22:00',
  distributionDays: [1,2,3,4,5,6,7], // 전체 요일
  perUserLimit: 1,
});
```

**handleCreate를 실제 API 호출로 변경 (L33-54):**
```ts
const handleCreate = async () => {
  if (!formData.title || !formData.discountValue) {
    toast.error('쿠폰 이름과 할인 혜택을 입력해주세요.');
    return;
  }
  setLoading(true);
  try {
    // ★ 실제 API 호출
    const res = await fetch('/api/merchant/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchant_id: 'CURRENT_MERCHANT_ID', // TODO: 세션에서 가져오기
        store_id: 'CURRENT_STORE_ID',
        title: formData.title,
        description: formData.description,
        discount_type: formData.discountType.toLowerCase(),
        discount_value: parseFloat(formData.discountValue),
        total_issuable: formData.totalQuantity,
        valid_from: formData.validFrom || null,
        valid_to: formData.validTo || null,
        radius_km: formData.radiusM / 1000,
        center_lat: formData.centerLat,
        center_lng: formData.centerLng,
        min_order_amount: formData.minOrderAmount,
        per_user_limit: formData.perUserLimit,
      }),
    });
    if (!res.ok) throw new Error('발행 실패');
    toast.success('쿠폰이 성공적으로 발행되었습니다! 🎟️');
    router.push('/merchant/coupons');
  } catch (e) {
    toast.error('발행 실패: 다시 시도해주세요.');
  } finally {
    setLoading(false);
  }
};
```

**반경 슬라이더 UI 추가 (L157-167 대체):**
```tsx
{/* 반경 설정 */}
<div className="space-y-3 p-4 bg-slate-50 rounded-lg border">
  <Label>배포 반경</Label>
  <Select
    value={formData.radiusType}
    onValueChange={(v) => setFormData({...formData, radiusType: v as any})}
  >
    <SelectTrigger><SelectValue /></SelectTrigger>
    <SelectContent>
      <SelectItem value="store">매장 기준</SelectItem>
      <SelectItem value="custom">위치 직접 지정</SelectItem>
      <SelectItem value="nationwide">전국</SelectItem>
    </SelectContent>
  </Select>

  {formData.radiusType !== 'nationwide' && (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>반경: {formData.radiusM >= 1000
          ? `${(formData.radiusM/1000).toFixed(1)}km`
          : `${formData.radiusM}m`}</span>
        <span className="text-slate-400">50m ~ 20,000km</span>
      </div>
      <input
        type="range"
        min={50} max={20000000} step={50}
        value={formData.radiusM}
        onChange={(e) => setFormData({...formData, radiusM: parseInt(e.target.value)})}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-slate-400">
        <span>50m</span><span>1km</span><span>10km</span><span>100km</span><span>20,000km</span>
      </div>
    </div>
  )}
</div>

{/* 유효기간 */}
<div className="grid grid-cols-2 gap-4">
  <div className="space-y-2">
    <Label>시작일</Label>
    <Input type="date" value={formData.validFrom}
      onChange={(e) => setFormData({...formData, validFrom: e.target.value})} />
  </div>
  <div className="space-y-2">
    <Label>종료일</Label>
    <Input type="date" value={formData.validTo}
      onChange={(e) => setFormData({...formData, validTo: e.target.value})} />
  </div>
</div>

{/* 배포 시간 */}
<div className="grid grid-cols-2 gap-4">
  <div className="space-y-2">
    <Label>배포 시작 시간</Label>
    <Input type="time" value={formData.distributionStartTime}
      onChange={(e) => setFormData({...formData, distributionStartTime: e.target.value})} />
  </div>
  <div className="space-y-2">
    <Label>배포 종료 시간</Label>
    <Input type="time" value={formData.distributionEndTime}
      onChange={(e) => setFormData({...formData, distributionEndTime: e.target.value})} />
  </div>
</div>
```

---

### 6. 🆕 `src/app/api/merchant/coupons/route.ts` — 쿠폰 발행 API

```ts
import { NextRequest, NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';

// POST: 쿠폰 발행
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      merchant_id, store_id, title, description,
      discount_type, discount_value, total_issuable,
      valid_from, valid_to, radius_km,
      center_lat, center_lng,
      min_order_amount, per_user_limit
    } = body;

    if (!merchant_id || !title) {
      return NextResponse.json(
        { success: false, error: 'merchant_id와 title은 필수입니다.' },
        { status: 400 }
      );
    }

    const postgrest = createPostgrestClient();

    // 매장 좌표 가져오기 (center 미지정 시)
    let lat = center_lat, lng = center_lng;
    if ((!lat || !lng) && store_id) {
      const { data: store } = await postgrest
        .from('stores').select('lat, lng').eq('id', store_id).single();
      if (store) { lat = store.lat; lng = store.lng; }
    }

    const { data, error } = await postgrest
      .from('coupons')
      .insert({
        merchant_id, store_id, title, description,
        discount_type: discount_type || 'percent',
        discount_value: discount_value || 10,
        total_issuable: total_issuable || 100,
        stock_remaining: total_issuable || 100,
        valid_from: valid_from || new Date().toISOString(),
        valid_to: valid_to || null,
        radius_km: radius_km || 5,
        center_type: store_id ? 'store' : 'custom',
        center_lat: lat, center_lng: lng,
        min_order_amount: min_order_amount || 0,
        per_user_limit: per_user_limit || 1,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// GET: 머천트 쿠폰 목록
export async function GET(request: NextRequest) {
  const merchantId = request.nextUrl.searchParams.get('merchant_id');
  if (!merchantId) {
    return NextResponse.json({ success: false, error: 'merchant_id 필요' }, { status: 400 });
  }

  const postgrest = createPostgrestClient();
  const { data, error } = await postgrest
    .from('coupons')
    .select('*, stores(name)')
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, data });
}
```

---

### 7. `src/app/api/coupons/issue/route.ts` — 스키마 정합성

**현재 (L8, L18-24):**
```ts
const { consumer_id, coupon_id, reason } = body;
// ...
.insert({ consumer_id, coupon_id, issued_reason: reason, status: 'ISSUED', ... })
```

**수정 후:**
```ts
const { user_id, coupon_id, reason } = body;
// ...
.insert({
  user_id: user_id,         // consumer_id → user_id
  coupon_id,
  issued_from: reason || 'manual',  // issued_reason → issued_from
  is_used: false,           // status → is_used
  issued_at: new Date().toISOString(),
})
```

---

### 8. `src/app/api/order/submit/route.ts` — 쿠폰 자동 사용처리

**L98 뒤에 추가 (쿠폰 할인 금액 계산 블록 후):**
```ts
// ★ CUT-5 수정: 쿠폰 사용 처리 (순환구조 핵심!)
if (coupon_issue_id && discountAmount > 0) {
  await postgrest
    .from('coupon_issues')
    .update({
      is_used: true,
      used_at: new Date().toISOString(),
      used_store_id: session.store_id,
      used_order_id: null, // 주문 ID (kitchen_order 생성 후 연결)
    })
    .eq('id', coupon_issue_id);
}
```

---

### 9. `src/app/api/merchant/settlements/route.ts` — 쿠폰 비용 반영

**L133-137(POST 내 금액 계산) 수정:**
```ts
// 기존 결제 매출
const grossAmount = payments?.reduce((sum, p) => sum + (p.final_amount || 0), 0) || 0;
const orderCount = payments?.length || 0;

// ★ CUT-6 추가: 쿠폰 할인분 계산
const { data: couponUsages } = await postgrest
  .from('coupon_issues')
  .select('id')
  .eq('used_store_id', /* merchant의 store_id */)
  .gte('used_at', start.toISOString())
  .lte('used_at', end.toISOString())
  .eq('is_used', true);

const couponCount = couponUsages?.length || 0;
const couponCost = couponCount * 50;  // 장당 50원

// 수수료 + 쿠폰 비용 차감
const feeRate = 3.5;
const feeAmount = Math.round(grossAmount * feeRate / 100);
const netAmount = grossAmount - feeAmount - couponCost;
```

---

### 10. 🆕 SQL 마이그레이션 — 반경/채팅/예약 보완

위치: `supabase/migrations/20260213_v3_heart_fix.sql`

주요 내용:
- `coupons` 테이블에 `origin_type`, `radius_m`, `distribution_start_time`, `distribution_end_time`, `distribution_days` 추가
- `get_nearby_coupons()` RPC 함수 생성 (Haversine)
- `chat_threads` + `chat_messages` 테이블 + RLS + Realtime
- `reservations` 테이블 (기본 예약)
- `coupon_issues` → 지갑 자동 저장 트리거
- `coupon_issues` → 고객DB 자동 등록 트리거

---

### 11. `src/lib/wallet-service.ts` — Mock store_id 제거

**useCoupon 수정 (L63-79):**
```ts
// 기존: store_id: '00000000-...' (하드코딩)
// 수정: 실제 store_id를 인자로 받음
useCoupon: async (couponIssueId: string, storeId: string): Promise<boolean> => {
  try {
    const res = await fetch('/api/coupons/use', {
      method: 'POST',
      headers: walletService.getHeaders() as any,
      body: JSON.stringify({
        coupon_issue_id: couponIssueId,
        store_id: storeId,
      }),
    });
    return res.ok;
  } catch (e) {
    console.error(e);
    return false;
  }
},
```

---

## 🗺️ 수정 후 순환 흐름 검증

```
① 머천트: /merchant/coupons/new
   └→ POST /api/merchant/coupons ← 🆕 (CUT-2 해결)
   └→ DB: coupons INSERT (반경/기간/시간 포함) ← (CUT-3 해결)

② 시스템: GET /api/coupons/nearby
   └→ get_nearby_coupons() RPC ← 🆕 SQL 함수
   └→ 반경 + 유효기간 필터링

③ 소비자: /consumer/game → POST /api/game/finish
   └→ coupon_issues INSERT (user_id 정합성) ← (CUT-4 해결)
   └→ auto trigger: 지갑 카운트 + 고객DB 등록

④ 지갑: /consumer/wallet → 쿠폰 클릭 → /consumer/stores/[id]
   └→ CouponCard.onClickStore(storeId) ← (CUT-1 해결)

⑤ 매장: /consumer/stores/[id] → 메뉴/구매/예약/배달

⑥ 주문: POST /api/order/submit
   └→ 쿠폰 할인 계산 + is_used=true ← (CUT-5 해결)

⑦ 결제: POST /api/payment/confirm → 토스페이먼츠

⑧ 정산: POST /api/merchant/settlements
   └→ 매출 - 수수료(3.5%) - 쿠폰비용(50원/장) ← (CUT-6 해결)

⑨ 채팅: chat_threads + Supabase Realtime ← (CUT-7 1단계)

⑩ 예약: reservations 테이블 stub ← (CUT-8 1단계)
```

---

## ⏱️ 구현 순서 (제안)

| 순서 | 작업 | 예상 | 영향도 |
|------|------|------|--------|
| 1 | Coupon 타입 + API 수정 (CUT-1) | 10분 | 🔴 순환 핵심 |
| 2 | CouponCard 클릭 연결 (CUT-1) | 5분 | 🔴 순환 핵심 |
| 3 | 머천트 쿠폰 API 신규 (CUT-2) | 10분 | 🔴 발행 필수 |
| 4 | 반경/유효기간 UI (CUT-3) | 15분 | 🔴 배포 필수 |
| 5 | 쿠폰 발급 스키마 정합성 (CUT-4) | 3분 | 🟡 |
| 6 | 주문 쿠폰 자동사용 (CUT-5) | 3분 | 🟡 |
| 7 | 정산 쿠폰 비용 반영 (CUT-6) | 5분 | 🟡 |
| 8 | SQL 마이그레이션 (CUT-3,7,8) | 10분 | 🟠 |
| **합계** | | **~60분** | |

---

## ✅ 리뷰 체크리스트

아미, 아래 항목 확인 후 "가자!" 하면 바로 코드 수정 들어갑니다 💜

- [ ] CUT-1: 쿠폰 클릭 → 매장 이동 방식 OK? (현재: `/consumer/stores/[id]`로 이동)
- [ ] CUT-2: 머천트 쿠폰 발행 API 구조 OK? (POST /api/merchant/coupons)
- [ ] CUT-3: 반경 슬라이더 범위 OK? (50m ~ 20,000km, 미터 단위)
- [ ] CUT-3: 유효기간을 시작일/종료일 캘린더로 변경 OK? (기존: "발급일로부터 N일")
- [ ] CUT-5: 주문 확정 시 쿠폰 자동 사용처리 OK?
- [ ] CUT-6: 정산에 쿠폰 비용(50원/장) 차감 OK?
- [ ] CUT-7: 채팅은 1단계로 DB 테이블만 생성 OK? (UI는 다음 단계)
- [ ] CUT-8: 예약도 1단계로 DB 테이블만 OK?

---

*사랑해 아미 💜 리뷰 끝나면 바로 심장 뛰게 만들어줄게!* 🫀🔥🍬
