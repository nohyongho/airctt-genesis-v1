
# CTT V2.0 API 설계 문서

## 개요
CouponTalkTalk(CTT) 2025 버전의 RESTful API 설계 문서입니다.
CTT V2 스키마를 기반으로 하며, PostgreSQL + PostgREST를 사용합니다.

## 기본 정보
- **Base URL**: `/next_api`
- **인증**: JWT Bearer Token (추후 구현)
- **응답 형식**: JSON
- **문자 인코딩**: UTF-8

## 공통 응답 구조

### 성공 응답
```json
{
  "success": true,
  "data": { ... }
}
```

### 에러 응답
```json
{
  "success": false,
  "errorMessage": "에러 메시지",
  "errorCode": "ERROR_CODE"
}
```

## API 엔드포인트

### 1. 매장 관련 API

#### 1.1 매장 목록 조회
```
GET /next_api/stores
```

**Query Parameters:**
- `category` (optional): 카테고리 필터 (예: 카페, 패션, 뷰티)
- `search` (optional): 검색어 (매장명, 주소)
- `lat` (optional): 사용자 위도
- `lng` (optional): 사용자 경도
- `limit` (optional): 페이지당 개수 (기본값: 20)
- `offset` (optional): 오프셋 (기본값: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "merchant_id": "uuid",
      "name": "매장명",
      "slug": "store-slug",
      "category": "카페",
      "description": "매장 설명",
      "rating_avg": 4.5,
      "review_count": 128,
      "lat": 37.5012,
      "lng": 127.0396,
      "address": "서울 강남구 테헤란로 123",
      "phone": "02-1234-5678",
      "open_hours": "08:00 - 22:00",
      "distance": "500m",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 1.2 매장 상세 조회
```
GET /next_api/stores/{store_id}
```

**Path Parameters:**
- `store_id`: 매장 UUID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "merchant_id": "uuid",
    "name": "매장명",
    "slug": "store-slug",
    "category": "카페",
    "description": "매장 설명",
    "rating_avg": 4.5,
    "review_count": 128,
    "lat": 37.5012,
    "lng": 127.0396,
    "address": "서울 강남구 테헤란로 123",
    "phone": "02-1234-5678",
    "open_hours": "08:00 - 22:00",
    "created_at": "2024-01-01T00:00:00Z",
    "images": [
      {
        "id": "uuid",
        "store_id": "uuid",
        "image_url": "{store_image_url_001}",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "active_events": [...],
    "available_coupons": [...],
    "recent_reviews": [...]
  }
}
```

### 2. 쿠폰 관련 API

#### 2.1 매장 쿠폰 목록 조회
```
GET /next_api/stores/{store_id}/coupons
```

**Query Parameters:**
- `status` (optional): 쿠폰 상태 (active, scheduled, expired, hidden)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "store_id": "uuid",
      "title": "쿠폰 제목",
      "description": "쿠폰 설명",
      "discount_type": "percent",
      "discount_value": 10,
      "start_at": "2024-01-01T00:00:00Z",
      "end_at": "2024-12-31T23:59:59Z",
      "status": "active",
      "terms_conditions": "이용 약관",
      "max_usage_count": 100,
      "current_usage_count": 23,
      "ar_link": "{ar_coupon_link}",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 2.2 쿠폰 발급
```
POST /next_api/coupons/{coupon_id}/issue
```

**Request Body:**
```json
{
  "user_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_coupon_id": "uuid",
    "coupon_id": "uuid",
    "user_id": "uuid",
    "issued_at": "2024-01-01T00:00:00Z",
    "expires_at": "2024-12-31T23:59:59Z",
    "status": "available"
  }
}
```

### 3. 이벤트 관련 API

#### 3.1 매장 이벤트 목록 조회
```
GET /next_api/stores/{store_id}/events
```

**Query Parameters:**
- `status` (optional): 이벤트 상태 (active, scheduled, ended)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "store_id": "uuid",
      "title": "이벤트 제목",
      "description": "이벤트 설명",
      "event_type": "special",
      "discount_info": "할인 정보",
      "start_at": "2024-01-01T00:00:00Z",
      "end_at": "2024-12-31T23:59:59Z",
      "status": "active",
      "banner_image_url": "{event_banner_url}",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 4. 리뷰 관련 API

#### 4.1 매장 리뷰 목록 조회
```
GET /next_api/stores/{store_id}/reviews
```

**Query Parameters:**
- `limit` (optional): 페이지당 개수 (기본값: 10)
- `offset` (optional): 오프셋 (기본값: 0)
- `sort` (optional): 정렬 기준 (latest, rating_high, rating_low)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "store_id": "uuid",
      "user_id": "uuid",
      "rating": 5,
      "content": "리뷰 내용",
      "images": ["{review_image_url}"],
      "created_at": "2024-01-01T00:00:00Z",
      "user_name": "사용자명",
      "user_avatar": "{user_avatar_url}"
    }
  ]
}
```

#### 4.2 리뷰 작성
```
POST /next_api/stores/{store_id}/reviews
```

**Request Body:**
```json
{
  "user_id": "uuid",
  "rating": 5,
  "content": "리뷰 내용",
  "images": ["{review_image_url}"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "store_id": "uuid",
    "user_id": "uuid",
    "rating": 5,
    "content": "리뷰 내용",
    "images": ["{review_image_url}"],
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

## Placeholder 목록

다음 값들은 실제 구현 시 채워야 합니다:

### 이미지 URL
- `{store_image_url_001}` - 매장 메인 이미지
- `{store_image_url_002}` - 매장 서브 이미지
- `{event_banner_url}` - 이벤트 배너 이미지
- `{review_image_url}` - 리뷰 이미지
- `{user_avatar_url}` - 사용자 아바타 이미지

### AR/VR 링크
- `{ar_coupon_link}` - AR 쿠폰 링크 (Unity WebGL 또는 AR 앱 딥링크)
- `{store_vr_tour_url}` - 매장 VR 투어 URL

### 외부 서비스 URL
- `{kakao_map_api_key}` - 카카오 지도 API 키
- `{payment_gateway_url}` - 결제 게이트웨이 URL

## 데이터베이스 스키마 참조

CTT V2 스키마는 다음 테이블을 포함합니다:

1. **users** - 사용자 (UUID 기반)
2. **stores** - 매장 (slug, lat/lng 포함)
3. **store_images** - 매장 이미지 (1:N)
4. **coupons** - 쿠폰 (상태/기간 세분화)
5. **events** - 이벤트 (신규)
6. **reviews** - 리뷰 (신규)

자세한 스키마는 `CTT_Master_Schema_V1_V2.xlsx` 파일의 `CTT_V2_Schema` 시트를 참조하세요.

## 구현 우선순위

### Phase 1 (MVP)
- [x] 매장 목록 조회
- [x] 매장 상세 조회
- [x] 매장 쿠폰 목록 조회
- [x] 매장 이벤트 목록 조회
- [x] 매장 리뷰 목록 조회

### Phase 2
- [ ] 쿠폰 발급 API
- [ ] 리뷰 작성 API
- [ ] 사용자 인증 (JWT)
- [ ] 즐겨찾기 기능

### Phase 3
- [ ] AR 쿠폰 연동
- [ ] 실시간 알림
- [ ] 포인트 시스템
- [ ] 결제 연동

## 참고 사항

- 모든 날짜/시간은 ISO 8601 형식 (UTC)
- UUID는 v4 사용
- 거리 계산은 Haversine 공식 사용
- 이미지는 CDN을 통해 제공 권장
- API Rate Limiting 적용 필요 (추후)
