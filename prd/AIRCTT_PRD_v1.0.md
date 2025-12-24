1. 서비스 개요

서비스명: AIRCTT – AR 쿠폰 플랫폼

주요 목적

소비자가 **AR 이벤트(비누방울/풍선 터치)**를 통해 재미있게 쿠폰/코인 리워드를 획득

리워드는 지갑에 QR 쿠폰 형태로 저장되고, 가맹점에서 스캔하여 사용

가맹점(머천트)은 관리자 페이지에서 쿠폰 발행·배포 신청, 지역 타겟·디자인·규약에 맞춰 신청

전체 UX는 프리미엄 / 네온-LED / 다크모드 중심 UI로 통일

현재 주요 화면

/consumer : AR CTT 이벤트 존 – 소비자 참여 화면 (다크 테마 + AR 설명)

/consumer/stores : 소비자용 매장 리스트 화면 (라이트 테마, 추후 다크 토글 적용)

/consumer/ar : Unity WebView 연동을 염두에 둔 AR 카메라/이벤트용 경로 (Next 라우트 설계 상 가정)

2. 페르소나 & 유즈케이스
2.1 소비자(고객)

상황

매장, 노래방, 팝업 스토어 등에서 AR 이벤트 존을 만난다.

주요 행동

매장에 비치된 안내를 보고 QR로 /consumer/ar 접속 (또는 /consumer에서 안내)

브라우저에서 카메라 권한 허용

화면 속 비누방울/풍선을 터치 → Unity에서 리워드 계산 → WebView로 리워드 전달

웹 UI의 지갑 영역에서 QR 쿠폰 확인

매장 카운터/단말에서 QR을 스캔하여 사용

2.2 가맹점(머천트)

상황

발로레(VALORE) 플랫폼에 가입한 매장주

주요 행동

관리자 페이지에서 쿠폰 발행·배포 신청 폼을 작성

매장 정보, 쿠폰 규격, 배포 지역(반경 1km 등) 설정

쿠폰 1인 1장 규칙 및 개인지갑 저장 시 50원 비용 안내에 동의

본사(발로레)로 쿠폰 의뢰서 + 디자인 파일 제출

승인 후 실제 AR 이벤트/배포에 사용

2.3 본사(발로레 / AIRCTT 운영사)

역할

쿠폰 규약 관리, 승인/정산, 법인 계좌 공지, 개인정보/데이터 보호 정책 관리

향후: Google Play/App Store용 데이터 보안/처리 방침 화면 제공 (ARLOOPA 사례 참고)

3. 기능 요구사항 (FE 중심)
3.1 /consumer – AR CTT 이벤트 존 (소비자 참여 화면)
3.1.1 레이아웃 & 헤더

상단 로고/타이틀

좌측: AIRCTT 로고/텍스트

중앙/좌측: 페이지 타이틀

“AR CTT 이벤트 존 – 소비자 참여 화면”

우측:

연동 상태 표시 (아이콘 + "연동 상태: Web UI 준비 완료")

"현재 단계: STEP X / 5"

(추후) 다크모드 ON/OFF 토글 버튼 위치 확보

3.1.2 Unity WebView 연동 (JS 인터페이스)

이미 구현된 타입/로직 기준.

3.1.2.1 글로벌 타입
declare global {
  interface Window {
    onUnityMessage?: (msg: any) => void;
  }
}

3.1.2.2 Unity → Web (메시지 포맷)

UnityMessage 타입:

type RewardTier = 1 | 2 | 3 | 4 | 5;
type RewardKind = 'COIN' | 'COUPON';

interface Reward {
  id: string;
  label: string;
  amount: number;
  tier: RewardTier;
  kind: RewardKind;
  createdAt: string;
  qrToken: string;
}

type UnityMessage =
  | { type: 'STEP'; step: RewardTier }
  | { type: 'REWARD'; payload: Reward }
  | { type: 'LOG'; message: string }
  | any;

3.1.2.3 수신 핸들러

useEffect 내에서 다음 로직을 설정:

window.onUnityMessage 에 콜백 등록

공통 로그(appendLog)에 JSON 문자열 기록

type === 'STEP' → currentStep 상태 업데이트 (1~5 범위 제한)

type === 'REWARD' → reward 상태에 저장 + showWallet = true

type === 'LOG' → 로그 영역에 메시지 표시

언마운트 시 window.onUnityMessage = undefined로 정리

3.1.2.4 Web → Unity (옵션)

Step 버튼 클릭 시, window.Unity.call(JSON.stringify({ type: 'STEP', step: next })) 형식으로 보내도록 샘플 코드 자리 마련(현재는 로그만 남김).

3.1.3 상태 관리

컴포넌트 ConsumerARPage 기준 주요 상태:

currentStep: RewardTier – 현재 AR 이벤트 단계(1~5)

cameraAllowed: boolean | null – 카메라 권한 상태

logs: string[] – AR/Unity 이벤트 로그 (최대 80줄 유지)

reward: Reward | null – 마지막 수신 리워드

showWallet: boolean – 지갑 상세/QR 영역 표시 여부

shareUrl: string – 현재 페이지 URL (QR 인코딩용)

showQr: boolean – 상단 “/consumer/ar 바로 열기” QR 표시 여부

3.1.4 QR 공유 카드 – 휴대폰에서 /consumer/ar 열기

위치: 상단 섹션

내용:

설명 텍스트

PC에서 띄운 이 화면을 휴대폰 브라우저로도 열 수 있음

localhost 대신 192.168.xxx.xxx 사용 설명

현재 접속 주소 표시

shareUrl을 font-mono 스타일로 표시

TIP 문구

브라우저 주소창에서 localhost → 192.168.xxx.xxx 치환 후 QR 스캔 안내

“QR 코드 열기” 버튼

class: led-btn (추후 공통 LED 스타일 적용)

클릭 시 showQr 토글

QR 이미지

외부 API: https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl)}

별도 라이브러리 없이 <img> 만 사용

3.1.5 5단계 비누방울 AR 이벤트 섹션

설명 카드:

STEP 1~5에 대한 텍스트 설명 (이미 코드에 있음)

카메라 권한 상태 표시

기능:

3.1.5.1 카메라 권한 요청

버튼: “카메라 권한 요청”

로직:

navigator.mediaDevices.getUserMedia({ video: true }) 호출

성공 시 cameraAllowed = true, 로그 “✅ 카메라 권한 허용됨”

실패 시 cameraAllowed = false, 로그 “❌ 카메라 권한 거부 또는 에러”

3.1.5.2 STEP 이동 버튼

버튼 구성:

-1 버튼 (이전 스텝)

STEP {currentStep} 표시 텍스트

+1 버튼 (다음 스텝)

제약:

1 미만, 5 초과로 가지 않도록 범위 제한

클릭 시 로그에 “단계 버튼 클릭: prev → next” 기록

(향후) Unity에 STEP 변경 메시지 발송 로직 활성화

3.1.6 테스트용 리워드 트리거 카드

버튼: “더미 리워드 지급 (테스트)”

클릭 시 임의 Reward 객체 생성:

label: '테스트 AR 쿠폰 (버블 POP)'

amount: 10000

tier: currentStep

kind: 'COUPON'

createdAt: now.toISOString()

qrToken: 'CTT-' + 랜덤 토큰

reward 저장 + showWallet = true

로그: “테스트 리워드 생성: {label}”

버튼: “로그 비우기”

setLogs([]) 호출

설명 텍스트:

Unity에서 아래 형태로 호출하면 실제 AR 터치와 연결된다는 안내:

window.onUnityMessage({ type: 'REWARD', payload: ... })

3.1.7 지갑 / 리워드 표시 카드

기본 상태:

reward == null → “아직 획득한 쿠폰이 없습니다…” 안내 텍스트

리워드 수신 시:

최신 STEP 표시 (헤더 우측 “STEP {reward.tier} 리워드”)

카드 내용:

배지: “STEP {reward.tier} 리워드”

reward.label

amount 형식화 (toLocaleString() 사용)

COUPON: “쿠폰 금액: 10,000원”

COIN: “코인 수량: X개”

발급 시간: new Date(reward.createdAt).toLocaleString()

“지갑 열기” 버튼 클릭 시 showWallet = true

3.1.7.1 지갑 상세 (QR 쿠폰 토큰)

내용:

“CTT 지갑 · QR 쿠폰 토큰” 제목

쿠폰 ID, QR 토큰 각각 font-mono로 표기

QR 이미지:

https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(reward.qrToken)}

안내 문구:

“가맹점 단말기 또는 CTT 앱에서 이 QR을 스캔하면 쿠폰이 확인·사용됩니다.”

닫기 버튼: showWallet = false

3.1.8 AR / Unity 이벤트 로그 콘솔

높이: h-44

내용:

logs 배열을 순서대로 출력

logsEndRef를 이용해 변경 시 자동 스크롤

로그 없을 때 placeholder 문구

표기 형식:

[HH:MM:SS] 메시지내용 (appendLog 내부에서 생성)

3.1.9 Unity 디버그 푸터

예제 코드 텍스트:

window.onUnityMessage({ type: 'STEP', step: 3 })

window.onUnityMessage({ type: 'REWARD', payload: { ... } })

목적:

Unity 개발자가 WebView 자바스크립트 호출 형식을 쉽게 참고하도록 제공

3.2 LED 버튼 / 다크 테마 스타일 (globals.css)

정확한 CSS는 이미 src/app/globals.css에 추가된 상태 기준으로, PRD에 개념만 정리.

3.2.1 공통 LED 버튼 베이스

클래스 예:

.led-btn-base

특징:

라운드 코너(완만한 pill 형태)

배경색: 어두운 바탕에서 눈에 띄는 밝은 네온 초록/황금

텍스트: 가독성을 위해 text-black 또는 text-slate-900

살짝 두꺼운 폰트, 버튼 크기는 모바일에서도 누르기 편한 min-height 유지

transition 적용 (hover 시 scale, 밝기 미묘 변화)

3.2.2 색상별 버튼

.led-btn-green

네온 그린: (예) #22ff88 또는 Tailwind emerald 계열

.led-btn-gold

네온 골드/옐로우: (예) #ffd93b 또는 Tailwind amber 계열

두 색 모두 숨쉬기 애니메이션 공유.

3.2.3 숨쉬기 애니메이션 (@keyframes led-breath)

범위:

opacity: 0.2 ↔ 1.0 반복

box-shadow 로 네온 사인 느낌:

0%, 100%: 작은 glow (14px 정도)

50%: 더 큰 glow (40px 정도)

색상:

초록/노랑 모두 같은 애니메이션를 사용하되,

버튼 배경색에 맞게 box-shadow 색상을 초록/노랑 조합으로 설계

LED 클래스로 사용:

.led-breath or .led-btn-base 에 animation: led-breath 2.4s ease-in-out infinite;

3.3 다크모드 ON/OFF 토글 (공통 요구사항)

아직 완전히 구현되진 않았지만, 지금까지 대화에서 정한 방향을 PRD에 반영.

3.3.1 위치 & 동작

위치:

소비자 페이지 헤더 우측 (현재 지구본 아이콘 근처)

/consumer, /consumer/stores 등 소비자 영역 공통으로 노출

상태:

light / dark 두 가지 테마

브라우저 localStorage에 저장 (예: airctt-theme)

첫 진입 시:

localStorage 값이 있으면 우선

없으면 prefers-color-scheme 참조 (시스템 테마)

3.3.2 구현 방향

src/components/theme/DarkToggle.tsx (예시) 컴포넌트

아이콘: 해/달 또는 햇빛/달 조합

클릭 시:

<html> 또는 <body> 태그에 class="dark" 토글

Tailwind dark: 프리셋 활용 (프로젝트 설정에 따라)

/app/consumer/layout.tsx 에서 테마 상태를 공급

/consumer/* 하위 페이지들이 같은 테마 상태 공유

3.4 /consumer/stores – 소비자 매장 리스트 페이지 (추가 요구사항)

이미 구현된 화면 + 우리가 정한 추가 요구사항.

3.4.1 기존 기능(요약)

상단 배너:

“위치를 찾았습니다” + 좌표 표시

검색 바, 카테고리 필터(전체/식당/카페/패션/뷰티/기타)

“리스트 보기”/“지도 보기” 탭

매장 카드:

썸네일 이미지

매장 이름/카테고리

주소/영업시간

거리(km)

“길찾기” or 상세 진입 화살표

3.4.2 추가 디자인 요구사항

다크모드 토글

/consumer에서 정의한 다크 토글과 동일 컴포넌트 사용

라이트 모드: 현재처럼 밝은 배경 유지

다크 모드:

배경: 진한 남색/슬레이트

카드: 짙은 슬레이트 + 살짝 네온/LED 포인트

LED 버튼 적용

“리스트 보기” 버튼, “길찾기”, 주요 CTA에

.led-btn-base + led-btn-green/gold 클래스 적용

Hover 시 숨쉬기 느낌 + 약간 확대

4. 관리자 페이지 – 쿠폰 신청/발행 PRD (개념)

실제 코드보다 “어떤 폼과 필드를 가져가야 하는지”에 집중한 기획.

4.1 화면 구조

상단: 쿠폰 발행·배포 신청 안내

본사(발로레) 로고 + 문구

규약/주요 조건 요약:

“각 소비자 개인지갑에는 쿠폰 1장만 저장됩니다.”

“개인지갑에 쿠폰 1장을 저장할 때마다 50원의 비용이 발생합니다. (발급/정산 기준 안내)”

“쿠폰 배포는 매장 단위로 적용되며, 반경 1km ~ N km까지 설정 가능합니다.”

중앙 좌측: 쿠폰 발행 신청 폼

중앙 우측: 실시간 미리보기 카드

하단: 본사 의뢰서/규격 안내 + 다이렉트 메일 발송 버튼

4.2 쿠폰 발행 신청 폼 – 상세 필드
4.2.1 기본 정보

[필수] 업체명(매장명)

[필수] 업장 주소

[필수] 연락처(전화번호)

[필수] 사업자 등록번호

[선택] 담당자 이름 / 이메일

4.2.2 쿠폰 정보

[필수] 쿠폰 제목 (예: “XR 노래방 1시간 무료”, “피자 20% 할인”)

[필수] 쿠폰 유형

금액형 (예: 10,000원)

비율형 (예: 10%, 20%)

기타 (예: 무료 이용권)

[필수] 쿠폰 금액/할인율

[필수] 발행 수량 (예: 10,000장)

[필수] 유효기간 시작/종료

[선택] 사용 조건

최소 주문 금액

특정 요일/시간대만 사용

중복 사용 가능 여부 등

4.2.3 배포/타겟팅 설정

[필수] 배포 기준 매장 선택

현재 로그인된 업체 기준 기본 값

[필수] 배포 지역 반경

최소: 1km

최대: “무제한” 옵션

[선택] 원거리 배포 옵션

체크박스: “원거리 배포 허용”

설명: 시/도 단위 또는 특정 광역권까지 확장

[선택] 타겟 인구 속성(향후):

나이대, 관심사, 성별 등 (지금은 placeholder)

4.2.4 디자인/브랜딩

[필수] 디자인 방식 선택 (라디오 버튼)

“본인 업체 개별 디자인 발행”

파일 업로드 필드: 이미지/ai/pdf 등

권장 규격 및 용량 안내 텍스트

“본사 의뢰 디자인”

간단 요구사항 작성 필드 (textarea)

“로고/컬러/메인 문구/이미지 분위기” 체크리스트

(선택) 참고 이미지 업로드

4.2.5 정산/비용 관련

안내 문구:

“당사 플랫폼에서 발행되어 개인 지갑에 저장되는 각 쿠폰 1장당 50원의 비용이 발생합니다.”

“해당 비용은 월별 또는 정산 주기별 합산 청구됩니다.”

[필수] 동의 체크박스:

“위 비용 및 정산 규정을 이해하고 동의합니다.”

발로레 법인 계좌 정보:

“주식회사 발로레”

은행명, 계좌번호, 예금주

입금/정산 프로세스 안내 (예: 선불/후불, 세금계산서 발행 여부)

4.2.6 최종 제출

버튼:

“쿠폰 발행 의뢰서 제출” (LED 골드 버튼)

부가 동작:

백엔드 API로 신청 내역 전송

동시에 본사 담당자에게 다이렉트 메일 발송 옵션:

“본사에 이메일로 즉시 전달” 체크 시, 서버에서 메일 발송

4.3 미리보기 카드

실시간으로 폼 데이터를 반영:

쿠폰 제목/이미지/할인 정보

유효기간

“1인 1장 저장 / 개인지갑 저장 시 50원 비용 발생” 라벨

디자인:

소비자 지갑 UI와 동일한 스타일(연동성 강조)

다크 테마 + 네온/LED 포인트

5. 비기능 요구사항
5.1 데이터 보안/개인정보 (ARLOOPA 예시 참고)

구글 플레이 “데이터 보안” 화면처럼 정리할 것 (향후 앱/웹 공통):

전송 중 데이터 암호화

“데이터는 HTTPS 등 보안 연결을 통해 전송됩니다.”

수집되는 데이터 항목

앱 활동(상호작용, 검색 기록 등)

개인 정보(이름, 이메일 등 – 필요한 최소 범위)

기기 또는 기타 ID

데이터 삭제

“개발자는 이 앱에서 수집한 데이터를 삭제하는 방법을 제공합니다.”

“앱 계정 삭제 시, 관련 데이터 삭제 요청 가능”

공유되는 데이터

제3자(광고/분석) 여부 명시 (현재는 최소화 방향)

개인정보 처리방침 링크

발로레 / AIRCTT 공식 사이트로 연결

6. 버전/범위 정리
v1.0 (현재 상태)

/consumer AR 이벤트 설명 페이지

Unity WebView 연동용 JS 인터페이스

QR 공유 카드

STEP 컨트롤

테스트 리워드 생성/지갑/QR 표시

이벤트 로그 콘솔

LED 숨쉬기 효과 CSS (globals.css)

/consumer/stores 기존 매장 리스트 화면 (아직 LED/다크 토글 미적용)

v1.1 (다음 목표)

/consumer + /consumer/stores 공통 다크모드 토글 구현

/consumer/stores 주요 버튼에 LED 버튼 스타일 적용

/consumer/ar 라우트에서 실제 카메라 + Unity AR 뷰 연결

v1.2 이후

관리자 쿠폰 발행/배포 신청 페이지 실제 구현

쿠폰 스키마/DB/정산 로직과 연동

Google Play/App Store용 데이터 보안/개인정보 화면 및 정책 페이지 완성

