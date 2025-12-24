
# 📡 CTT V2.0 API 응답 예시 문서

## 개요
이 문서는 CTT V2.0 API의 실제 응답 예시를 제공합니다.
현재는 **localStorage 기반 Mock 데이터**를 사용하며, 실제 백엔드 연동 시 동일한 형식으로 응답합니다.

---

## 1️⃣ GET /next_api/stores/[id]
**매장 상세 정보 조회**

### 📥 Request
```http
GET /next_api/stores/store-001
```

### 📤 Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "store-001",
    "merchant_id": "merchant-001",
    "name": "카페 모카 강남점",
    "slug": "cafe-mocha-gangnam",
    "category": "카페",
    "description": "프리미엄 스페셜티 커피와 수제 디저트를 즐길 수 있는 감성 카페입니다. 아늑한 분위기에서 여유로운 시간을 보내세요.",
    "rating_avg": 4.5,
    "review_count": 128,
    "lat": 37.5012,
    "lng": 127.0396,
    "address": "서울특별시 강남구 테헤란로 123, 2층",
    "phone": "02-1234-5678",
    "open_hours": "평일 08:00 - 22:00 / 주말 09:00 - 23:00",
    "created_at": "2024-12-19T10:30:00.000Z",
    "images": [
      {
        "id": "img-001",
        "store_id": "store-001",
        "image_url": "{store_image_url_1}",
        "display_order": 1,
        "is_primary": true,
        "created_at": "2024-12-19T10:30:00.000Z"
      },
      {
        "id": "img-002",
        "store_id": "store-001",
        "image_url": "{store_image_url_2}",
        "display_order": 2,
        "is_primary": false,
        "created_at": "2024-12-19T10:30:00.000Z"
      }
    ],
    "active_events": [
      {
        "id": "event-001",
        "store_id": "store-001",
        "title": "🎄 크리스마스 특별 이벤트",
        "description": "크리스마스 시즌 한정 메뉴 출시! 진저브레드 라떼, 페퍼민트 모카 등 특별한 메뉴를 만나보세요.",
        "event_type": "special",
        "discount_info": "시즌 메뉴 15% 할인",
        "start_at": "2024-12-19T00:00:00.000Z",
        "end_at": "2025-01-13T23:59:59.000Z",
        "status": "active",
        "banner_image_url": "{event_banner_url_001}",
        "created_at": "2024-12-19T10:30:00.000Z"
      }
    ],
    "available_coupons": [
      {
        "id": "coupon-001",
        "store_id": "store-001",
        "title": "아메리카노 1+1 이벤트",
        "description": "아메리카노 구매 시 동일 메뉴 1잔 무료 제공! 친구와 함께 즐기세요.",
        "discount_type": "gift",
        "discount_value": 0,
        "start_at": "2024-12-19T00:00:00.000Z",
        "end_at": "2025-01-18T23:59:59.000Z",
        "status": "active",
        "terms_conditions": "1인 1일 1회 사용 가능 / 다른 쿠폰과 중복 사용 불가",
        "max_usage_count": 100,
        "current_usage_count": 23,
        "ar_link": "{ar_coupon_link_001}",
        "created_at": "2024-12-19T10:30:00.000Z"
      }
    ],
    "recent_reviews": [
      {
        "id": "review-001",
        "store_id": "store-001",
        "user_id": "user-001",
        "rating": 5,
        "content": "커피 맛이 정말 훌륭해요! 원두 향이 진하고 부드러워서 매일 찾게 되는 카페입니다.",
        "images": ["{review_image_url_001}"],
        "created_at": "2024-12-17T00:00:00.000Z",
        "user_name": "김민수",
        "user_avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=user001"
      }
    ]
  }
}
```

### 📤 Response (404 Not Found)
```json
{
  "success": false,
  "errorMessage": "Store not found: store-999",
  "errorCode": "STORE_NOT_FOUND"
}
```

---

## 2️⃣ GET /next_api/stores/[id]/coupons
**매장 쿠폰 목록 조회**

### 📥 Request
```http
GET /next_api/stores/store-001/coupons?status=active
```

**Query Parameters:**
- `status` (optional): 쿠폰 상태 (`active` | `scheduled` | `expired`)

### 📤 Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "coupon-001",
      "store_id": "store-001",
      "title": "아메리카노 1+1 이벤트",
      "description": "아메리카노 구매 시 동일 메뉴 1잔 무료 제공! 친구와 함께 즐기세요.",
      "discount_type": "gift",
      "discount_value": 0,
      "start_at": "2024-12-19T00:00:00.000Z",
      "end_at": "2025-01-18T23:59:59.000Z",
      "status": "active",
      "terms_conditions": "1인 1일 1회 사용 가능 / 다른 쿠폰과 중복 사용 불가",
      "max_usage_count": 100,
      "current_usage_count": 23,
      "ar_link": "{ar_coupon_link_001}",
      "created_at": "2024-12-19T10:30:00.000Z"
    },
    {
      "id": "coupon-002",
      "store_id": "store-001",
      "title": "전 메뉴 15% 할인",
      "description": "모든 음료 및 디저트 15% 할인 혜택! 프리미엄 메뉴도 할인됩니다.",
      "discount_type": "percent",
      "discount_value": 15,
      "start_at": "2024-12-19T00:00:00.000Z",
      "end_at": "2025-01-03T23:59:59.000Z",
      "status": "active",
      "terms_conditions": "최소 주문 금액 10,000원 이상 / 다른 쿠폰과 중복 사용 불가",
      "max_usage_count": 200,
      "current_usage_count": 87,
      "ar_link": "{ar_coupon_link_002}",
      "created_at": "2024-12-19T10:30:00.000Z"
    },
    {
      "id": "coupon-003",
      "store_id": "store-001",
      "title": "5,000원 즉시 할인",
      "description": "20,000원 이상 구매 시 5,000원 즉시 할인!",
      "discount_type": "amount",
      "discount_value": 5000,
      "start_at": "2024-12-19T00:00:00.000Z",
      "end_at": "2025-01-08T23:59:59.000Z",
      "status": "active",
      "terms_conditions": "최소 주문 금액 20,000원 이상 / 1인 1회 사용 가능",
      "max_usage_count": 50,
      "current_usage_count": 12,
      "ar_link": "{ar_coupon_link_003}",
      "created_at": "2024-12-19T10:30:00.000Z"
    }
  ]
}
```

**💡 할인 타입 (discount_type):**
- `percent`: 퍼센트 할인 (예: 15% → `discount_value: 15`)
- `amount`: 금액 할인 (예: 5,000원 → `discount_value: 5000`)
- `gift`: 사은품/증정 (예: 1+1 → `discount_value: 0`)

---

## 3️⃣ GET /next_api/stores/[id]/events
**매장 이벤트 목록 조회**

### 📥 Request
```http
GET /next_api/stores/store-001/events?status=active
```

**Query Parameters:**
- `status` (optional): 이벤트 상태 (`active` | `scheduled` | `ended`)

### 📤 Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "event-001",
      "store_id": "store-001",
      "title": "🎄 크리스마스 특별 이벤트",
      "description": "크리스마스 시즌 한정 메뉴 출시! 진저브레드 라떼, 페퍼민트 모카 등 특별한 메뉴를 만나보세요. 시즌 메뉴 구매 시 15% 할인 혜택을 드립니다.",
      "event_type": "special",
      "discount_info": "시즌 메뉴 15% 할인",
      "start_at": "2024-12-19T00:00:00.000Z",
      "end_at": "2025-01-13T23:59:59.000Z",
      "status": "active",
      "banner_image_url": "{event_banner_url_001}",
      "created_at": "2024-12-19T10:30:00.000Z"
    },
    {
      "id": "event-002",
      "store_id": "store-001",
      "title": "☕ 신메뉴 출시 기념 이벤트",
      "description": "시그니처 콜드브루 신메뉴 출시를 기념하여 특별 할인 이벤트를 진행합니다. 첫 주문 시 30% 할인!",
      "event_type": "promotion",
      "discount_info": "신메뉴 첫 주문 30% 할인",
      "start_at": "2024-12-19T00:00:00.000Z",
      "end_at": "2025-01-02T23:59:59.000Z",
      "status": "active",
      "banner_image_url": "{event_banner_url_002}",
      "created_at": "2024-12-19T10:30:00.000Z"
    }
  ]
}
```

**💡 이벤트 타입 (event_type):**
- `discount`: 할인 이벤트
- `promotion`: 프로모션 이벤트
- `special`: 특별 이벤트 (시즌, 기념일 등)

---

## 4️⃣ GET /next_api/stores/[id]/reviews
**매장 리뷰 목록 조회**

### 📥 Request
```http
GET /next_api/stores/store-001/reviews?limit=10&offset=0&sort=recent
```

**Query Parameters:**
- `limit` (optional): 페이지당 개수 (기본값: 10)
- `offset` (optional): 오프셋 (기본값: 0)
- `sort` (optional): 정렬 기준 (`recent` | `rating_high` | `rating_low`)

### 📤 Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "review-001",
      "store_id": "store-001",
      "user_id": "user-001",
      "rating": 5,
      "content": "커피 맛이 정말 훌륭해요! 원두 향이 진하고 부드러워서 매일 찾게 되는 카페입니다. 분위기도 아늑하고 직원분들도 정말 친절하세요. 디저트도 맛있어서 강력 추천합니다! 🥰",
      "images": ["{review_image_url_001}"],
      "created_at": "2024-12-17T00:00:00.000Z",
      "user_name": "김민수",
      "user_avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=user001"
    },
    {
      "id": "review-002",
      "store_id": "store-001",
      "user_id": "user-002",
      "rating": 4,
      "content": "디저트가 정말 맛있어요! 특히 티라미수가 일품입니다. 다만 주말에는 사람이 많아서 조금 시끄러운 편이에요.",
      "images": ["{review_image_url_002}", "{review_image_url_003}"],
      "created_at": "2024-12-14T00:00:00.000Z",
      "user_name": "이지은",
      "user_avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=user002"
    },
    {
      "id": "review-003",
      "store_id": "store-001",
      "user_id": "user-003",
      "rating": 5,
      "content": "강남에서 제일 좋아하는 카페입니다! 커피도 맛있고 케이크도 훌륭해요. 💜",
      "images": [],
      "created_at": "2024-12-12T00:00:00.000Z",
      "user_name": "박서준",
      "user_avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=user003"
    }
  ]
}
```

---

## 5️⃣ POST /next_api/stores/[id]/reviews
**리뷰 작성**

### 📥 Request
```http
POST /next_api/stores/store-001/reviews
Content-Type: application/json

{
  "user_id": "user-123",
  "rating": 5,
  "content": "정말 좋았어요! 다음에 또 올게요.",
  "images": ["{review_image_url}"]
}
```

**Request Body:**
- `user_id` (required): 사용자 UUID
- `rating` (required): 별점 (1~5)
- `content` (optional): 리뷰 내용
- `images` (optional): 리뷰 이미지 URL 배열

### 📤 Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "review-new-1734601234567",
    "store_id": "store-001",
    "user_id": "user-123",
    "rating": 5,
    "content": "정말 좋았어요! 다음에 또 올게요.",
    "images": ["{review_image_url}"],
    "created_at": "2024-12-19T10:33:54.567Z",
    "user_name": "새 사용자",
    "user_avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=newuser"
  }
}
```

### 📤 Response (400 Bad Request)
```json
{
  "success": false,
  "errorMessage": "Invalid review data. user_id and rating (1-5) are required.",
  "errorCode": "INVALID_INPUT"
}
```

---

## 🔄 실제 백엔드 교체 가이드

### 📁 수정할 파일 위치
```
src/app/next_api/stores/
├── [id]/
│   ├── route.ts              ← 매장 상세 조회
│   ├── coupons/route.ts      ← 쿠폰 목록 조회
│   ├── events/route.ts       ← 이벤트 목록 조회
│   └── reviews/route.ts      ← 리뷰 조회/작성
```

### 🔧 교체 작업 순서

#### Step 1: Mock 데이터 초기화 제거
```typescript
// ❌ 제거할 코드
cttDataService.initialize();
```

#### Step 2: PostgreSQL 쿼리로 교체
```typescript
// ✅ 실제 백엔드 코드 예시
import { createPostgrestClient } from '@/lib/postgrest';

const client = createPostgrestClient();
const { data, error } = await client
  .from('stores')
  .select(`
    *,
    images:store_images(*),
    active_events:events!inner(*),
    available_coupons:coupons!inner(*),
    recent_reviews:reviews(*, users(name, avatar))
  `)
  .eq('id', storeId)
  .eq('events.status', 'active')
  .eq('coupons.status', 'active')
  .order('reviews.created_at', { ascending: false })
  .limit(10, { foreignTable: 'reviews' })
  .single();
```

#### Step 3: 환경 변수 설정
```bash
# .env.local
POSTGREST_URL=https://your-postgrest-url.com
POSTGREST_SCHEMA=public
POSTGREST_API_KEY=your_api_key_here
```

---

## 🧪 API 테스트 방법

### 브라우저 개발자 도구 (Console)
```javascript
// 1. 매장 상세 조회
fetch('/next_api/stores/store-001')
  .then(r => r.json())
  .then(console.log);

// 2. 쿠폰 목록 조회
fetch('/next_api/stores/store-001/coupons?status=active')
  .then(r => r.json())
  .then(console.log);

// 3. 이벤트 목록 조회
fetch('/next_api/stores/store-001/events')
  .then(r => r.json())
  .then(console.log);

// 4. 리뷰 목록 조회
fetch('/next_api/stores/store-001/reviews?limit=5')
  .then(r => r.json())
  .then(console.log);

// 5. 리뷰 작성
fetch('/next_api/stores/store-001/reviews', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 'user-test',
    rating: 5,
    content: '테스트 리뷰입니다!'
  })
})
  .then(r => r.json())
  .then(console.log);
```

### cURL 명령어
```bash
# 매장 상세 조회
curl http://localhost:3000/next_api/stores/store-001

# 쿠폰 목록 조회
curl "http://localhost:3000/next_api/stores/store-001/coupons?status=active"

# 리뷰 작성
curl -X POST http://localhost:3000/next_api/stores/store-001/reviews \
  -H "Content-Type: application/json" \
  -d '{"user_id":"user-test","rating":5,"content":"테스트 리뷰"}'
```

---

## 📊 현재 상태 요약

| API 엔드포인트 | 상태 | 데이터 소스 | 실제 백엔드 교체 필요 |
|--------------|------|-----------|-------------------|
| GET /stores/[id] | ✅ 동작 | localStorage (Mock) | ⚠️ Yes |
| GET /stores/[id]/coupons | ✅ 동작 | localStorage (Mock) | ⚠️ Yes |
| GET /stores/[id]/events | ✅ 동작 | localStorage (Mock) | ⚠️ Yes |
| GET /stores/[id]/reviews | ✅ 동작 | localStorage (Mock) | ⚠️ Yes |
| POST /stores/[id]/reviews | ✅ 동작 | localStorage (Mock) | ⚠️ Yes |

**💡 참고:**
- 현재 모든 API는 `localStorage` 기반 Mock 데이터를 사용합니다
- 실제 프로덕션 환경에서는 PostgreSQL + PostgREST로 교체해야 합니다
- Mock 데이터 수정은 `src/lib/ctt-data-service.ts` 파일에서 가능합니다

---

**📞 문의**: 추가 도움이 필요하면 언제든지 물어보세요! 🥰✨
