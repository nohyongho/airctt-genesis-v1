/**
 * AIRCTT Share Service
 * 쿠폰 공유 유틸리티
 */

interface ShareData {
  url: string;
  title: string;
  text: string;
  shortCode?: string;
}

interface CreateShareLinkResponse {
  success: boolean;
  data?: {
    share_link_id: string;
    short_code: string;
    url: string;
    share_data: {
      url: string;
      title: string;
      description: string;
      text: string;
    };
    expires_at: string;
  };
  error?: string;
}

/**
 * 쿠폰 공유 딥링크 생성
 */
export async function createShareLink(
  couponId: string,
  utm?: { source?: string; medium?: string; campaign?: string }
): Promise<CreateShareLinkResponse> {
  try {
    const response = await fetch('/api/coupons/share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        coupon_id: couponId,
        utm_source: utm?.source,
        utm_medium: utm?.medium,
        utm_campaign: utm?.campaign,
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('Create share link error:', error);
    return {
      success: false,
      error: '공유 링크 생성에 실패했습니다.',
    };
  }
}

/**
 * Web Share API를 사용한 네이티브 공유
 */
export async function shareNative(data: ShareData): Promise<boolean> {
  if (!navigator.share) {
    return false;
  }

  try {
    await navigator.share({
      title: data.title,
      text: data.text,
      url: data.url,
    });
    return true;
  } catch (error) {
    // 사용자가 취소한 경우
    if ((error as Error).name === 'AbortError') {
      return false;
    }
    console.error('Native share error:', error);
    return false;
  }
}

/**
 * 클립보드에 복사
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // 폴백: execCommand 사용
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch (e) {
      console.error('Copy to clipboard error:', e);
      return false;
    }
  }
}

/**
 * 카카오톡 공유 (카카오 SDK 필요)
 */
export function shareToKakao(data: {
  title: string;
  description: string;
  imageUrl?: string;
  link: string;
}): boolean {
  if (typeof window === 'undefined' || !(window as any).Kakao) {
    console.warn('Kakao SDK not loaded');
    return false;
  }

  const Kakao = (window as any).Kakao;

  if (!Kakao.isInitialized()) {
    console.warn('Kakao SDK not initialized');
    return false;
  }

  try {
    Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: data.title,
        description: data.description,
        imageUrl:
          data.imageUrl || 'https://ctt.kr/images/coupon-share-default.png',
        link: {
          mobileWebUrl: data.link,
          webUrl: data.link,
        },
      },
      buttons: [
        {
          title: '쿠폰 받기',
          link: {
            mobileWebUrl: data.link,
            webUrl: data.link,
          },
        },
      ],
    });
    return true;
  } catch (error) {
    console.error('Kakao share error:', error);
    return false;
  }
}

/**
 * 트위터(X) 공유
 */
export function shareToTwitter(data: ShareData): void {
  const text = encodeURIComponent(data.text);
  const url = encodeURIComponent(data.url);
  window.open(
    `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
    '_blank',
    'width=600,height=400'
  );
}

/**
 * 페이스북 공유
 */
export function shareToFacebook(url: string): void {
  const encodedUrl = encodeURIComponent(url);
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    '_blank',
    'width=600,height=400'
  );
}

/**
 * 라인 공유
 */
export function shareToLine(data: ShareData): void {
  const text = encodeURIComponent(`${data.text}\n${data.url}`);
  window.open(`https://line.me/R/msg/text/?${text}`, '_blank');
}

/**
 * SMS 공유 (모바일)
 */
export function shareToSMS(data: ShareData): void {
  const body = encodeURIComponent(`${data.text}\n${data.url}`);
  window.location.href = `sms:?body=${body}`;
}

/**
 * 이메일 공유
 */
export function shareToEmail(data: ShareData): void {
  const subject = encodeURIComponent(data.title);
  const body = encodeURIComponent(`${data.text}\n\n${data.url}`);
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

/**
 * QR 코드 URL 생성 (외부 서비스 사용)
 */
export function getQRCodeUrl(url: string, size: number = 200): string {
  const encodedUrl = encodeURIComponent(url);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedUrl}`;
}
