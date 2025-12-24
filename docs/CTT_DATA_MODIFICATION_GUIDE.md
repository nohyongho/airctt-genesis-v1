
# 📝 CTT AIRCTT 데모 데이터 수정 가이드

## 🎯 데모 버전 개요
이 프로젝트는 **AIRCTT 벤사/PG 데모용**으로 설정되어 있습니다.
- **AIRCTT 제휴 카페 1**: 카페 (AIRCTT 결제 시스템 사용)
- **AIRCTT 제휴 편의점 1**: 편의점 (24시간 영업, AIRCTT 결제)
- **AIRCTT 제휴 식당 1**: 한식당 (AIRCTT 결제 시 특별 할인)

---

## 📍 데이터 위치
모든 더미 데이터는 다음 파일들에 있습니다:
- **`src/lib/ctt-data-service.ts`**: CTT V2.0 스키마 기반 데이터 (매장 상세 페이지용)
- **`src/lib/store-service.ts`**: consumer-types 기반 데이터 (홈/매장 목록용)

---

## 🔧 수정 방법

### 1️⃣ 매장 정보 수정 (ctt-data-service.ts)
**위치**: `mockStores` 배열 (약 60번째 줄)

```typescript
{
  id: 'store-001',
  name: 'AIRCTT 제휴 카페 1',                    // ✏️ 매장 이름
  category: '카페',                              // ✏️ 카테고리
  description: 'AIRCTT 제휴 카페입니다...',      // ✏️ 매장 설명
  address: '서울특별시 강남구 테헤란로 123',     // ✏️ 주소
  phone: '02-1234-5678',                        // ✏️ 전화번호
  open_hours: '매일 09:00 ~ 22:00',             // ✏️ 영업시간
  rating_avg: 4.7,                              // ✏️ 평균 평점 (0.0 ~ 5.0)
  review_count: 45,                             // ✏️ 리뷰 개수
  lat: 37.5012,                                 // ✏️ 위도 (지도용)
  lng: 127.0396,                                // ✏️ 경도 (지도용)
}
```

**💡 AIRCTT 데모 매장 목록:**
- `store-001`: AIRCTT 제휴 카페 1
- `store-002`: AIRCTT 제휴 편의점 1
- `store-003`: AIRCTT 제휴 식당 1

---

### 2️⃣ 매장 이미지 수정
**위치**: `mockImages` 배열 (약 100번째 줄)

```typescript
{
  id: 'img-airctt-001',
  store_id: 'store-001',                                                      // 어느 매장의 이미지인지
  image_url: 'https://images.unsplash.com/photo-1495474472645-4d71bcdd2085', // ✏️ 실제 이미지 URL
  display_order: 1,                                                           // 표시 순서 (1부터 시작)
  is_primary: true,                                                           // 대표 이미지 여부
}
```

**💡 현재 사용 중인 Unsplash 이미지:**
- 카페: 커피, 카페 인테리어 이미지
- 편의점: 편의점 매장 이미지
- 식당: 한식, 음식 이미지

---

### 3️⃣ 쿠폰 정보 수정
**위치**: `mockCoupons` 배열 (약 150번째 줄)

```typescript
{
  id: 'coupon-airctt-001',
  store_id: 'store-001',
  title: '전체 메뉴 15% 할인',                    // ✏️ 쿠폰 제목
  description: 'AIRCTT 결제 시 모든 음료...',     // ✏️ 쿠폰 설명
  discount_type: 'percent',                        // ✏️ 할인 타입
  discount_value: 15,                              // ✏️ 할인 값
  terms_conditions: 'AIRCTT 결제 시에만...',      // ✏️ 사용 조건
  max_usage_count: 100,                            // ✏️ 최대 사용 횟수
  ar_link: '{ar_coupon_link_airctt_001}',          // ✏️ AR 쿠폰 링크
}
```

**💡 할인 타입 (discount_type):**
- `'percent'`: 퍼센트 할인 (예: 15% 할인 → `discount_value: 15`)
- `'amount'`: 금액 할인 (예: 3,000원 할인 → `discount_value: 3000`)
- `'gift'`: 사은품 (예: 아메리카노 1잔 무료 → `discount_value: 0`)

**💡 AIRCTT 쿠폰 예시:**
- 카페: 전체 메뉴 15% 할인, 아메리카노 1잔 무료
- 편의점: 전 상품 10% 할인, 3,000원 즉시 할인
- 식당: 전 메뉴 20% 할인, 5,000원 즉시 할인

---

### 4️⃣ 이벤트 정보 수정
**위치**: `mockEvents` 배열 (약 220번째 줄)

```typescript
{
  id: 'event-airctt-001',
  store_id: 'store-001',
  title: '💳 AIRCTT 결제 시 포인트 2배 적립',      // ✏️ 이벤트 제목
  description: 'AIRCTT 결제 시스템으로...',         // ✏️ 이벤트 설명
  event_type: 'promotion',                           // ✏️ 이벤트 타입
  discount_info: 'AIRCTT 결제 시 포인트 2배 적립',  // ✏️ 할인 정보 요약
  banner_image_url: 'https://...',                   // ✏️ 배너 이미지 URL
}
```

**💡 이벤트 타입 (event_type):**
- `'discount'`: 할인 이벤트
- `'promotion'`: 프로모션 이벤트
- `'special'`: 특별 이벤트

**💡 AIRCTT 이벤트 예시:**
- 카페: AIRCTT 결제 시 포인트 2배 적립
- 편의점: AIRCTT 결제 고객 특별 혜택, 주말 특가 이벤트
- 식당: AIRCTT 결제 시 무료 반찬 제공

---

### 5️⃣ 리뷰 정보 수정
**위치**: `mockReviews` 배열 (약 280번째 줄)

```typescript
{
  id: 'review-airctt-001',
  store_id: 'store-001',
  rating: 5,                                       // ✏️ 별점 (1~5)
  content: 'AIRCTT 결제 시스템이 정말...',        // ✏️ 리뷰 내용
  user_name: '김민수',                             // ✏️ 작성자 이름
  user_avatar: 'https://...',                      // ✏️ 프로필 이미지 URL
  images: ['https://...'],                         // ✏️ 리뷰 이미지 배열
}
```

**💡 AIRCTT 리뷰 특징:**
- AIRCTT 결제 시스템의 편리함과 빠른 속도 강조
- 포인트 적립, 쿠폰 혜택 등 AIRCTT 결제의 장점 언급
- 매장별 특색 (카페 분위기, 편의점 24시간 영업, 식당 맛) 포함

---

### 6️⃣ 홈/매장 목록 데이터 수정 (store-service.ts)
**위치**: `mockStores` 배열 (약 10번째 줄)

```typescript
{
  id: 'store-001',
  name: 'AIRCTT 제휴 카페 1',
  category: '카페',
  thumbnailUrl: 'https://...',                     // ✏️ 썸네일 이미지
  description: 'AIRCTT 제휴 카페입니다...',
  locationText: '서울특별시 강남구 테헤란로 123',
  latitude: 37.5012,
  longitude: 127.0396,
  openHours: '매일 09:00 ~ 22:00',
  distance: '500m',
  tags: ['커피', '디저트', 'AIRCTT'],              // ✏️ 태그
  contact: '02-1234-5678',
}
```

---

## 🎯 AIRCTT Placeholder 목록

### AR 쿠폰 링크
- `{ar_coupon_link_airctt_001}` - 카페 쿠폰 1 AR 링크
- `{ar_coupon_link_airctt_002}` - 카페 쿠폰 2 AR 링크
- `{ar_coupon_link_airctt_003}` - 편의점 쿠폰 1 AR 링크
- `{ar_coupon_link_airctt_004}` - 편의점 쿠폰 2 AR 링크
- `{ar_coupon_link_airctt_005}` - 식당 쿠폰 1 AR 링크
- `{ar_coupon_link_airctt_006}` - 식당 쿠폰 2 AR 링크

---

## 🚀 적용 방법

### 1. 파일 수정
1. **파일 열기**: `src/lib/ctt-data-service.ts` 또는 `src/lib/store-service.ts`
2. **데이터 수정**: 위 가이드를 참고하여 원하는 값으로 변경
3. **저장**: 파일 저장

### 2. 브라우저에서 확인
1. **localStorage 초기화** (중요!)
   - 브라우저 개발자 도구 열기 (`F12`)
   - Console 탭에서 입력: `localStorage.clear()`
   - Enter 키 입력
2. **페이지 새로고침**: `Ctrl + Shift + R` (캐시 삭제 새로고침)
3. **데이터 확인**: 변경된 데이터가 반영되었는지 확인

---

## 🗺️ Preview 화면 사용 가이드

### 방법 1: 홈 페이지에서 이동
1. Preview 화면 열기
2. 하단 탭 메뉴에서 **"홈"** 클릭
3. 페이지 스크롤하여 **"근처 매장"** 섹션 찾기
4. **AIRCTT 제휴 매장 카드** 클릭
5. 매장 상세 페이지 도착! 🎉

### 방법 2: 매장 목록에서 이동
1. Preview 화면 열기
2. 하단 탭 메뉴에서 **"매장"** 클릭
3. **AIRCTT 제휴 매장** 선택
4. **"상세 보기"** 버튼 클릭
5. 매장 상세 페이지 도착! 🎉

### 방법 3: 직접 URL 입력
Preview 화면 주소창에 다음 URL 중 하나를 입력:

```
/consumer/stores/store-001  (AIRCTT 제휴 카페 1)
/consumer/stores/store-002  (AIRCTT 제휴 편의점 1)
/consumer/stores/store-003  (AIRCTT 제휴 식당 1)
```

### 매장 상세 페이지에서 확인할 수 있는 정보
- ✅ 매장 기본 정보 (이름, 카테고리, 주소, 영업시간, 평점)
- ✅ 매장 이미지 갤러리 (슬라이드)
- ✅ 진행 중인 이벤트 (AIRCTT 결제 시 추가 적립 등)
- ✅ 사용 가능한 쿠폰 (15% 할인, 아메리카노 무료 등)
- ✅ 고객 리뷰 (AIRCTT 결제 경험 포함)
- ✅ 지도 (Kakao Map)

---

## 💡 팁

### 이미지 URL 찾기
- **Unsplash**: https://unsplash.com/ (무료 고품질 이미지)
- **Pexels**: https://www.pexels.com/ (무료 스톡 이미지)
- **AIRCTT 실제 이미지**: 실제 AIRCTT 결제 시스템, 제휴 매장 이미지 사용

### 날짜 설정
```typescript
// 현재 시간
new Date().toISOString()

// 30일 후
new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

// 특정 날짜
new Date('2024-12-31').toISOString()
```

### 좌표 찾기
- **Google Maps**: 원하는 위치 우클릭 → 좌표 복사
- **Kakao Map**: 지도에서 위치 검색 → URL에서 좌표 확인

---

## ❓ 문제 해결

### 데이터가 반영되지 않을 때
1. **localStorage 초기화**: `localStorage.clear()` 실행
2. **캐시 삭제 새로고침**: `Ctrl + Shift + R`
3. **개발자 도구 Console 확인**: 에러 메시지 확인

### 이미지가 표시되지 않을 때
- 이미지 URL이 올바른지 확인
- HTTPS URL 사용 (HTTP는 차단될 수 있음)
- CORS 정책 확인 (외부 이미지 사용 시)

### 매장 상세 페이지가 안 보일 때
- URL이 정확한지 확인 (`/consumer/stores/store-001`)
- localStorage 초기화 후 새로고침
- 브라우저 Console에서 에러 확인

---

## 📊 AIRCTT 데모 데이터 요약

| 매장 ID | 매장 이름 | 카테고리 | 쿠폰 개수 | 이벤트 개수 | 리뷰 개수 |
|---------|----------|---------|----------|-----------|------------|
| store-001 | AIRCTT 제휴 카페 1 | 카페 | 2개 | 1개 | 3개 |
| store-002 | AIRCTT 제휴 편의점 1 | 편의점 | 2개 | 2개 | 3개 |
| store-003 | AIRCTT 제휴 식당 1 | 한식당 | 2개 | 1개 | 3개 |

---

**📞 문의**: 추가 도움이 필요하면 언제든지 물어보세요! 🥰✨
