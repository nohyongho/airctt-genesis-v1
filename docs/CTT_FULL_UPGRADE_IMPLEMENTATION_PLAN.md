
# CTT 관리자/소비자 풀 업그레이드 구현 계획

## 📋 프로젝트 개요

**목표**: CTT-CRM(관리자)와 ctt-consumer(소비자) 앱을 실제 서비스 수준으로 업그레이드

**기술 스택**:
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4
- Supabase (PostgreSQL + Storage + Auth)
- Zustand (상태 관리)
- 다국어 지원 (한국어/영어)

---

## ✅ 구현 체크리스트

### Phase 1: 기반 설정 (Foundation)

- [x] 타입 정의 (`src/lib/admin/types.ts`)
- [x] Zustand 스토어 (`src/lib/admin/store.ts`)
- [x] Mock 데이터 (`src/lib/admin/mock-data.ts`)
- [x] i18n 메시지 (`src/lib/admin/i18n.ts`)
- [x] 기본 레이아웃 (`src/app/crm/admin/layout.tsx`)
- [x] 헤더 컴포넌트 (`src/components/admin/AdminHeader.tsx`)
- [x] 사이드바 컴포넌트 (`src/components/admin/AdminSidebar.tsx`)
- [x] 언어 토글 (`src/components/admin/AdminLanguageToggle.tsx`)
- [ ] **Supabase 클라이언트 설정**
- [ ] **환경변수 템플릿 (.env.example)**
- [ ] **파일 업로드 유틸리티**
- [ ] **이메일 발송 stub**

### Phase 2: 관리자 기능 구현

#### 2-1. 프로필 관리
- [ ] 프로필 이미지 업로드 컴포넌트
- [ ] 프로필 영상 업로드 컴포넌트
- [ ] 프로필 수정 폼 완성
- [ ] Supabase Storage 연동

#### 2-2. 연결 관리
- [ ] 연결 목록 컴포넌트
- [ ] 연결 생성 폼
- [ ] 연결 수정 폼
- [ ] 삭제 요청 모달
- [ ] 권한별 필터링

#### 2-3. 최신 소식 관리
- [ ] 소식 목록 컴포넌트
- [ ] 소식 작성 폼
- [ ] 소식 수정 폼
- [ ] 검색/필터 기능
- [ ] 상단 고정 기능

#### 2-4. 본사 Admin 화면
- [ ] 관리자 트리 컴포넌트
- [ ] 정지/재개 버튼
- [ ] 삭제 요청 목록
- [ ] 삭제 승인/거절 기능
- [ ] 실시간 모니터링 UI

### Phase 3: 권한 및 보안

- [ ] 권한 체크 미들웨어
- [ ] 계층형 데이터 필터링
- [ ] 로그인 페이지 개선
- [ ] 세션 관리
- [ ] 자동 로그아웃

### Phase 4: UX 개선

- [ ] 반응형 모바일 메뉴
- [ ] 로딩 상태 컴포넌트
- [ ] 에러 바운더리
- [ ] 토스트 알림
- [ ] 페이지네이션

### Phase 5: 소비자 앱 연동

- [ ] Supabase Auth 연동
- [ ] 쿠폰/포인트 지갑
- [ ] QR 스캔 UI
- [ ] 상태 체크 로직 (stopped 필터링)

### Phase 6: 테스트 및 문서화

- [ ] 시나리오 테스트
- [ ] API 문서 업데이트
- [ ] 사용자 가이드
- [ ] 배포 가이드

---

## 🗂️ 파일 구조

```
src/
├── app/
│   ├── crm/
│   │   └── admin/
│   │       ├── layout.tsx ✅
│   │       ├── page.tsx ✅
│   │       ├── login/
│   │       │   └── page.tsx ✅
│   │       ├── profile/
│   │       │   └── page.tsx ⚠️ (업그레이드 필요)
│   │       ├── connections/
│   │       │   └── page.tsx ⚠️ (업그레이드 필요)
│   │       ├── news/
│   │       │   └── page.tsx ⚠️ (업그레이드 필요)
│   │       └── hq/
│   │           └── page.tsx ⚠️ (업그레이드 필요)
│   └── (consumer)/
│       └── consumer/
│           ├── page.tsx
│           ├── wallet/
│           └── ...
├── components/
│   ├── admin/
│   │   ├── AdminHeader.tsx ✅
│   │   ├── AdminSidebar.tsx ✅
│   │   ├── AdminLanguageToggle.tsx ✅
│   │   ├── AvatarUpload.tsx ⚠️ (업그레이드 필요)
│   │   ├── ProfileForm.tsx ❌ (생성 필요)
│   │   ├── ConnectionsList.tsx ❌
│   │   ├── ConnectionForm.tsx ❌
│   │   ├── NewsList.tsx ❌
│   │   ├── NewsForm.tsx ❌
│   │   ├── AdminTree.tsx ❌
│   │   ├── StopButton.tsx ❌
│   │   └── DeleteRequestModal.tsx ❌
│   └── ui/ (shadcn/ui 컴포넌트)
├── lib/
│   ├── admin/
│   │   ├── types.ts ✅
│   │   ├── store.ts ✅
│   │   ├── mock-data.ts ✅
│   │   └── i18n.ts ✅
│   ├── supabase.ts ❌ (생성 필요)
│   ├── upload.ts ❌
│   └── email.ts ❌
└── docs/
    └── CTT_FULL_UPGRADE_IMPLEMENTATION_PLAN.md ✅
```

---

## 🔧 Supabase 스키마 설계

### 테이블 구조

```sql
-- 관리자/사용자 테이블
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('HQ', 'ADMIN', 'MERCHANT')),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  profile_image_url TEXT,
  profile_video_url TEXT,
  description TEXT,
  parent_id UUID REFERENCES admin_users(id),
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'STOPPED', 'PENDING_DELETE')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 연결 테이블
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES admin_users(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('KARAOKE', 'STORE', 'ONLINE', 'OTHER')),
  icon VARCHAR(100),
  description TEXT,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 최신 소식 테이블
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES admin_users(id),
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  language VARCHAR(10) DEFAULT 'ko',
  pinned BOOLEAN DEFAULT FALSE,
  visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 삭제 요청 테이블
CREATE TABLE deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_admin_id UUID NOT NULL REFERENCES admin_users(id),
  requested_by_id UUID NOT NULL REFERENCES admin_users(id),
  reason TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'REQUESTED' CHECK (status IN ('REQUESTED', 'APPROVED', 'REJECTED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  log TEXT
);

-- 인덱스
CREATE INDEX idx_admin_users_parent_id ON admin_users(parent_id);
CREATE INDEX idx_admin_users_role ON admin_users(role);
CREATE INDEX idx_connections_owner_id ON connections(owner_id);
CREATE INDEX idx_news_owner_id ON news(owner_id);
CREATE INDEX idx_deletion_requests_status ON deletion_requests(status);
```

### Storage 버킷

- `profiles`: 프로필 이미지
- `profile-videos`: 프로필 영상

---

## 🎯 핵심 기능 명세

### 1. 계층형 권한 구조

**규칙**:
- HQ: 모든 데이터 조회/수정 가능
- ADMIN: 자신과 하위만 조회/수정 가능
- MERCHANT: 자신의 데이터만 조회/수정 가능

**구현**:
```typescript
// 데이터 필터링 예시
function getVisibleAdmins(currentUser: AdminUser, allAdmins: AdminUser[]) {
  if (currentUser.role === 'HQ') {
    return allAdmins; // 모두 볼 수 있음
  }
  
  // 자신과 하위만 필터링
  const descendants = findDescendants(currentUser.id, allAdmins);
  return [currentUser, ...descendants];
}
```

### 2. 정지 기능

**동작**:
- HQ/상위 관리자가 하위 관리자/연결을 정지
- `status` 필드를 `STOPPED`로 변경
- 소비자 앱에서 해당 연결의 쿠폰 사용 차단

### 3. 삭제 요청 프로세스

**흐름**:
1. 하위 관리자가 "삭제 요청" 버튼 클릭
2. `deletion_requests` 테이블에 레코드 생성
3. 본사 이메일로 알림 발송 (stub)
4. HQ 화면에서 요청 확인
5. 승인 → 실제 삭제 / 거절 → 상태만 변경

---

## 📧 이메일 알림 (Stub)

```typescript
// src/lib/email.ts
export async function sendDeleteRequestEmail(request: DeleteRequest) {
  console.log('📧 이메일 발송 시뮬레이션');
  console.log('수신자: hq@coupontalktalk.com');
  console.log('제목: 삭제 요청 알림');
  console.log('내용:', {
    targetId: request.targetAdminId,
    requestedBy: request.requestedById,
    reason: request.reason,
    timestamp: request.createdAt,
  });
  
  // TODO: 실제 이메일 발송 (Supabase Edge Function 또는 SMTP)
  // await fetch('/api/send-email', { ... });
}
```

---

## 🚀 다음 단계

1. ✅ Supabase 클라이언트 설정
2. ✅ 파일 업로드 유틸리티
3. ✅ 프로필 페이지 완성
4. ✅ 연결 관리 페이지 완성
5. ✅ 최신 소식 페이지 완성
6. ✅ HQ 관리자 페이지 완성
7. ✅ 권한 체크 미들웨어
8. ✅ 반응형 UI 개선
9. ✅ 소비자 앱 연동
10. ✅ 테스트 및 문서화

---

## 📝 참고사항

- 현재는 Mock 데이터로 동작
- Supabase 연동 시 `useAdminStore`의 함수들을 API 호출로 교체
- 파일 업로드는 Supabase Storage 사용
- 이메일 발송은 Supabase Edge Functions 또는 별도 서버리스 함수 사용 예정

---

**작성일**: 2024-03-15  
**버전**: 1.0.0  
**상태**: 진행 중 🚧
