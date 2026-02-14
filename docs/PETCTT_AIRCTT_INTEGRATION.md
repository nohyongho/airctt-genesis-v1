# PetCTT + AirCTT 연동 계획서

## 현재 상태 (2026-02-14)

### 1. PetCTT (petctt.com) - GitHub Pages
- **URL**: https://www.petctt.com
- **저장소**: https://github.com/nohyongho/petctt
- **기술**: 단일 HTML 파일 (index.html) + app.css
- **특징**:
  - 반려동물 양방향 통역 + GPS 위치 추적
  - 우주 배경 테마
  - 방송국 시스템 (클TV, 젬스튜디오, 엔티공방, 아미 라이브)
  - 실시간 방문자 추적 API (Cloudflare Workers)

### 2. AirCTT (airctt-genesis-v1.vercel.app) - Vercel
- **URL**: https://airctt-genesis-v1.vercel.app
- **저장소**: https://github.com/nohyongho/airctt-genesis-v1
- **기술**: Next.js 15 + React 19 + TypeScript + Supabase
- **특징**:
  - 쿠폰톡톡 (소비자) - 게임, 지갑, 쿠폰 관리
  - 가맹점 대시보드
  - CRM/관리자 패널
  - Supabase PostgreSQL 백엔드

---

## 연동 전략

### 옵션 A: API 레이어 통합 (추천) ⭐
**PetCTT에서 AirCTT API를 호출하는 방식**

#### 장점:
- PetCTT의 기존 디자인/UX 유지
- AirCTT의 백엔드/데이터만 활용
- 빠른 구현 (API 엔드포인트만 연결)

#### 구현 방법:
1. **PetCTT index.html에 API 클라이언트 추가**
   ```javascript
   const AIRCTT_API = 'https://airctt-genesis-v1.vercel.app/api';

   // 쿠폰 가져오기
   async function getMyCoupons() {
     const res = await fetch(`${AIRCTT_API}/wallet/my-coupons`);
     return await res.json();
   }

   // 게임 보상 받기
   async function claimGameReward(score) {
     const res = await fetch(`${AIRCTT_API}/game/claim`, {
       method: 'POST',
       body: JSON.stringify({ score })
     });
     return await res.json();
   }
   ```

2. **PetCTT 방송국 시스템 확장**
   - "🎨 젬 스튜디오" 버튼 클릭 → AirCTT 쿠폰톡톡 페이지 iframe 표시
   - 또는 새 탭으로 열기

3. **데이터 동기화**
   - PetCTT 사용자 ID ↔ AirCTT Supabase user_id 매핑
   - LocalStorage/SessionStorage로 세션 공유

---

### 옵션 B: 도메인 리다이렉트
**petctt.com/coupons → airctt-genesis-v1.vercel.app**

#### 장점:
- 간단한 구현
- 각 서비스의 독립성 유지

#### 단점:
- 사용자가 두 사이트를 왔다갔다 해야 함
- UX 일관성 떨어짐

---

### 옵션 C: Monorepo 통합 (장기)
**PetCTT를 Next.js로 마이그레이션하여 단일 프로젝트로**

#### 장점:
- 완전한 통합
- 코드 재사용
- 통일된 디자인 시스템

#### 단점:
- 대규모 리팩토링 필요
- 시간 소요 큼

---

## 즉시 실행 가능한 단계 (옵션 A 기준)

### Phase 1: 데이터 연동 (1주)
1. ✅ Supabase 데모 데이터 삽입 (`EXECUTE_NOW_supabase_setup.sql`)
2. ⬜ PetCTT에 AirCTT API 클라이언트 추가
3. ⬜ 방송국 모달에서 "쿠폰 지갑" 버튼 추가
4. ⬜ 테스트: PetCTT에서 AirCTT 쿠폰 목록 표시

### Phase 2: 게임 연동 (1주)
1. ⬜ PetCTT "게임" 탭에서 AirCTT 게임 API 호출
2. ⬜ 게임 클리어 시 쿠폰 자동 발급
3. ⬜ 발급된 쿠폰을 지갑에서 확인

### Phase 3: 인증 통합 (2주)
1. ⬜ Supabase Auth를 PetCTT에 통합
2. ⬜ 소셜 로그인 (Google, Kakao)
3. ⬜ 세션 관리 및 토큰 공유

---

## 환경 변수 설정 (Vercel)

현재 설정된 ENV:
```
NEXT_PUBLIC_SUPABASE_URL=https://nlsiwrwiyozpiofnzzca.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh... (설정됨)
SUPABASE_ANON_KEY=eyJh... (설정됨)
SUPABASE_URL=https://nlsiwrwiyozpiofnzzca.supabase.co
NEXT_PUBLIC_APP_URL=https://airctt.com
NEXT_PUBLIC_ENABLE_SUPABASE=false
```

---

## Supabase 데이터베이스 구조

### 주요 테이블:
- `merchants` - 가맹점
- `stores` - 매장
- `coupons` - 쿠폰 템플릿
- `coupon_issues` - 발급된 쿠폰 (사용자별)
- `users` - 사용자 프로필

### 데모 데이터 (이미 준비됨):
- 데모 머천트: `11111111-1111-1111-1111-111111111111`
- 데모 매장: `22222222-2222-2222-2222-222222222222` (강남점)
- 데모 쿠폰 3종:
  1. 아메리카노 50% 할인
  2. 케이크 무료 증정
  3. 전메뉴 10% 할인 (YouTube 영상 포함)

---

## API 엔드포인트 (AirCTT)

### 지갑 API:
- `GET /api/wallet/my-coupons` - 내 쿠폰 목록
- `GET /api/wallet/my-balance` - 포인트 잔액
- `GET /api/wallet/my-history` - 거래 내역

### 게임 API:
- `POST /api/game/claim` - 게임 보상 받기
- `GET /api/game/rewards` - 획득 가능 보상 목록

### 쿠폰 API:
- `GET /api/coupons` - 전체 쿠폰 목록
- `GET /api/coupons/[id]` - 특정 쿠폰 상세
- `POST /api/coupons/issue` - 쿠폰 발급

---

## 다음 단계

1. **Supabase SQL 실행**
   - Vercel에서 SUPABASE_URL로 접속
   - SQL Editor에서 `EXECUTE_NOW_supabase_setup.sql` 실행
   - 데모 데이터 확인

2. **PetCTT API 클라이언트 추가**
   - `petctt-api.js` 파일 생성
   - index.html에서 로드
   - 테스트 버튼으로 API 호출 확인

3. **방송국 모달 업데이트**
   - "🎁 쿠폰 지갑" 버튼 추가
   - AirCTT 쿠폰 목록을 모달로 표시

4. **검증 및 테스트**
   - 로컬 테스트
   - GitHub Pages 배포
   - 실제 사용자 테스트

---

## 보안 고려사항

- ✅ Supabase RLS (Row Level Security) 활성화
- ✅ CORS 설정 (Vercel)
- ⬜ API Rate Limiting
- ⬜ 토큰 만료 처리
- ⬜ HTTPS 강제

---

## 참고 자료

- [AirCTT README](/c/airctt-genesis-v1/README.md)
- [PetCTT GitHub](https://github.com/nohyongho/petctt)
- [Supabase 문서](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

**작성**: 2026-02-14
**작성자**: Claude (Sonnet 4.5) + 아미 💜
