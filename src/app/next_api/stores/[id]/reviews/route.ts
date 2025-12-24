
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { NextRequest } from 'next/server';
import { cttDataService } from '@/lib/ctt-data-service';

/**
 * 📡 CTT V2.0 API - 매장 리뷰 목록 조회
 * 
 * @endpoint GET /next_api/stores/{id}/reviews
 * @description 특정 매장의 리뷰 목록을 조회합니다
 * 
 * @param {string} id - 매장 UUID
 * @query {number} limit - 페이지당 개수 (기본값: 10)
 * @query {number} offset - 오프셋 (기본값: 0)
 * @query {string} sort - 정렬 기준 (기본값: 'recent')
 *                        - 'recent': 최신순
 *                        - 'rating_high': 평점 높은순
 *                        - 'rating_low': 평점 낮은순
 * 
 * @returns {CTTReview[]} 리뷰 목록
 * 
 * @example
 * // Request
 * GET /next_api/stores/store-001/reviews?limit=10&offset=0&sort=recent
 * 
 * // Response
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "review-001",
 *       "store_id": "store-001",
 *       "user_id": "user-001",
 *       "rating": 5,
 *       "content": "커피 맛이 정말 훌륭해요!",
 *       "images": ["{review_image_url_001}"],
 *       "created_at": "2024-12-17T00:00:00Z",
 *       "user_name": "김민수",
 *       "user_avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=user001"
 *     }
 *   ]
 * }
 * 
 * 🔄 실제 백엔드 교체 시:
 * 1. cttDataService.getStoreReviews() 대신 PostgreSQL 쿼리 사용
 * 2. 예시:
 *    const { data } = await postgrestClient
 *      .from('reviews')
 *      .select('*, users(name, avatar)')
 *      .eq('store_id', storeId)
 *      .order('created_at', { ascending: false })
 *      .range(offset, offset + limit - 1);
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storeId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sort = searchParams.get('sort') || 'recent';

    // 🔧 Mock 데이터 초기화
    cttDataService.initialize();

    // 📦 매장 리뷰 조회
    let reviews = cttDataService.getStoreReviews(storeId);

    // 정렬
    if (sort === 'rating_high') {
      reviews = reviews.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'rating_low') {
      reviews = reviews.sort((a, b) => a.rating - b.rating);
    }
    // 'recent'는 이미 getStoreReviews()에서 정렬됨

    // 페이지네이션
    const paginatedReviews = reviews.slice(offset, offset + limit);

    return createSuccessResponse(paginatedReviews);
  } catch (error) {
    console.error('Failed to fetch store reviews:', error);
    return createErrorResponse({
      errorMessage: 'Failed to fetch store reviews',
      errorCode: 'INTERNAL_SERVER_ERROR',
      status: 500,
    });
  }
}

/**
 * 📡 CTT V2.0 API - 리뷰 작성
 * 
 * @endpoint POST /next_api/stores/{id}/reviews
 * @description 특정 매장에 리뷰를 작성합니다
 * 
 * @param {string} id - 매장 UUID
 * @body {object} review - 리뷰 데이터
 * @body {string} review.user_id - 사용자 UUID
 * @body {number} review.rating - 별점 (1~5)
 * @body {string} review.content - 리뷰 내용
 * @body {string[]} review.images - 리뷰 이미지 URL 배열 (선택)
 * 
 * @returns {CTTReview} 생성된 리뷰
 * 
 * @example
 * // Request
 * POST /next_api/stores/store-001/reviews
 * {
 *   "user_id": "user-123",
 *   "rating": 5,
 *   "content": "정말 좋았어요!",
 *   "images": ["{review_image_url}"]
 * }
 * 
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "id": "review-new-001",
 *     "store_id": "store-001",
 *     "user_id": "user-123",
 *     "rating": 5,
 *     "content": "정말 좋았어요!",
 *     "images": ["{review_image_url}"],
 *     "created_at": "2024-12-19T10:30:00Z"
 *   }
 * }
 * 
 * 🔄 실제 백엔드 교체 시:
 * 1. localStorage 저장 대신 PostgreSQL INSERT 사용
 * 2. 예시:
 *    const { data } = await postgrestClient
 *      .from('reviews')
 *      .insert([{ store_id: storeId, ...body }])
 *      .select()
 *      .single();
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storeId } = await params;
    const body = await request.json();

    // 입력 검증
    if (!body.user_id || !body.rating || body.rating < 1 || body.rating > 5) {
      return createErrorResponse({
        errorMessage: 'Invalid review data. user_id and rating (1-5) are required.',
        errorCode: 'INVALID_INPUT',
        status: 400,
      });
    }

    // 🔧 Mock 데이터: 새 리뷰 생성 (실제로는 DB에 저장)
    const newReview = {
      id: `review-new-${Date.now()}`,
      store_id: storeId,
      user_id: body.user_id,
      rating: body.rating,
      content: body.content || '',
      images: body.images || [],
      created_at: new Date().toISOString(),
      user_name: '새 사용자', // 실제로는 users 테이블에서 조회
      user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=newuser',
    };

    // 💡 실제 백엔드에서는 여기서 DB에 INSERT하고 결과를 반환
    // 현재는 Mock이므로 생성된 객체만 반환

    return createSuccessResponse(newReview, 201);
  } catch (error) {
    console.error('Failed to create review:', error);
    return createErrorResponse({
      errorMessage: 'Failed to create review',
      errorCode: 'INTERNAL_SERVER_ERROR',
      status: 500,
    });
  }
}
