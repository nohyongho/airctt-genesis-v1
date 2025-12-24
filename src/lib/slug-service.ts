/**
 * AIRCTT Slug Service
 * URL용 슬러그 생성 유틸리티
 */

export interface SlugOptions {
  maxLength?: number;
  separator?: string;
  lowercase?: boolean;
}

const DEFAULT_OPTIONS: SlugOptions = {
  maxLength: 50,
  separator: '-',
  lowercase: true,
};

/**
 * 한글/영문 문자열을 URL 친화적인 slug로 변환
 * @param input 원본 문자열
 * @param options 옵션
 * @returns slug 문자열
 * @example
 * generateSlug('아미한정식 & 카페') // '아미한정식-카페'
 * generateSlug('Cafe Mocha!!') // 'cafe-mocha'
 */
export function generateSlug(input: string, options?: SlugOptions): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (!input || typeof input !== 'string' || input.trim() === '') {
    return 'store';
  }

  let slug = input;

  // 1. 소문자 변환
  if (opts.lowercase) {
    slug = slug.toLowerCase();
  }

  // 2. 한글, 영문, 숫자 외 문자 → separator 치환
  slug = slug.replace(/[^a-z0-9가-힣]+/gi, opts.separator!);

  // 3. 연속 separator 제거
  slug = slug.replace(/-+/g, opts.separator!);

  // 4. 앞뒤 separator 제거
  slug = slug.replace(/^-+|-+$/g, '');

  // 5. 최대 길이 제한
  if (opts.maxLength && slug.length > opts.maxLength) {
    slug = slug.substring(0, opts.maxLength);
    slug = slug.replace(/-$/, '');
  }

  // 빈 문자열 방지
  if (!slug) {
    slug = 'store';
  }

  return slug;
}

/**
 * 중복 체크를 포함한 고유 slug 생성
 * @param input 원본 문자열
 * @param existingSlugs 기존 slug 목록
 * @returns 고유한 slug
 */
export function generateUniqueSlug(input: string, existingSlugs: string[]): string {
  const baseSlug = generateSlug(input);
  let finalSlug = baseSlug;
  let counter = 0;

  while (existingSlugs.includes(finalSlug)) {
    counter++;
    finalSlug = `${baseSlug}-${counter}`;
  }

  return finalSlug;
}

/**
 * 매장 URL 경로 생성
 * @param merchantSlug 가맹점 slug
 * @param storeSlug 매장 slug (선택)
 * @returns URL 경로
 */
export function getStoreUrl(merchantSlug: string, storeSlug?: string): string {
  if (storeSlug && storeSlug !== `${merchantSlug}-main`) {
    return `/store/${merchantSlug}/${storeSlug}`;
  }
  return `/store/${merchantSlug}`;
}

/**
 * 쿠폰 공유 딥링크 생성
 * @param couponId 쿠폰 ID
 * @param merchantSlug 가맹점 slug
 * @returns 공유용 URL
 */
export function getCouponShareUrl(couponId: string, merchantSlug: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ctt.kr';
  return `${baseUrl}/coupon/${merchantSlug}/${couponId}`;
}

/**
 * 테이블 오더 QR용 딥링크 생성
 * @param storeId 매장 ID
 * @param tableId 테이블 ID
 * @returns QR 딥링크 URL
 */
export function getTableOrderUrl(storeId: string, tableId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ctt.kr';
  return `${baseUrl}/order/${storeId}/${tableId}`;
}

/**
 * slug 유효성 검사
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length < 2 || slug.length > 50) {
    return false;
  }
  // 허용: 소문자 영문, 숫자, 한글, 하이픈
  const pattern = /^[a-z0-9가-힣]+(-[a-z0-9가-힣]+)*$/;
  return pattern.test(slug);
}

/**
 * slug 중복 체크 (API 호출)
 */
export async function checkSlugAvailability(
  slug: string,
  type: 'merchant' | 'store' = 'merchant'
): Promise<{ available: boolean; suggestion?: string }> {
  try {
    const res = await fetch(`/api/slug/check?slug=${encodeURIComponent(slug)}&type=${type}`);
    if (!res.ok) {
      return { available: false };
    }
    return await res.json();
  } catch {
    return { available: false };
  }
}

/**
 * 업종 카테고리를 쿠폰 템플릿 카테고리로 매핑
 */
export function mapCategoryToTemplate(category: string): string {
  const CATEGORY_MAP: Record<string, string> = {
    // 음식점
    '한식': 'restaurant',
    '중식': 'restaurant',
    '일식': 'restaurant',
    '양식': 'restaurant',
    '분식': 'restaurant',
    '패스트푸드': 'restaurant',
    '음식점': 'restaurant',

    // 카페
    '카페': 'cafe',
    '베이커리': 'cafe',
    '디저트': 'cafe',
    '커피': 'cafe',

    // 문화
    '공연': 'culture',
    '전시': 'culture',
    '영화': 'culture',
    '문화센터': 'culture',
    '문화': 'culture',

    // 쇼핑
    '의류': 'shopping',
    '잡화': 'shopping',
    '쇼핑몰': 'shopping',
    '편의점': 'shopping',
    '쇼핑': 'shopping',

    // 뷰티
    '미용실': 'beauty',
    '헬스': 'beauty',
    '스파': 'beauty',
    '네일': 'beauty',
    '뷰티': 'beauty',
    '운동': 'beauty',
  };

  return CATEGORY_MAP[category] || 'restaurant';
}

/**
 * 사용 가능한 템플릿 카테고리 목록
 */
export function getTemplateCategories(): string[] {
  return ['restaurant', 'cafe', 'culture', 'shopping', 'beauty'];
}
