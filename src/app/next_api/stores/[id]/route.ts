
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { NextRequest } from 'next/server';
import { cttDataService } from '@/lib/ctt-data-service';

/**
 * 📡 CTT V2.0 API - 매장 상세 조회
 * 
 * @endpoint GET /next_api/stores/{id}
 * @description 특정 매장의 상세 정보를 조회합니다 (이미지, 쿠폰, 이벤트, 리뷰 포함)
 * 
 * @param {string} id - 매장 UUID (예: "store-001")
 * 
 * @returns {CTTStoreDetail} 매장 상세 정보
 * 
 * @example
 * // Request
 * GET /next_api/stores/store-001
 * 
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "id": "store-001",
 *     "name": "카페 모카 강남점",
 *     "category": "카페",
 *     "rating_avg": 4.5,
 *     "images": [...],
 *     "active_events": [...],
 *     "available_coupons": [...],
 *     "recent_reviews": [...]
 *   }
 * }
 * 
 * 🔄 실제 백엔드 교체 시:
 * 1. cttDataService.initialize() 제거
 * 2. cttDataService.getStoreDetail() 대신 PostgreSQL 쿼리 사용
 * 3. 예시:
 *    const { data, error } = await postgrestClient
 *      .from('stores')
 *      .select(`
 *        *,
 *        images:store_images(*),
 *        active_events:events!inner(*)
 *      `)
 *      .eq('id', storeId)
 *      .single();
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storeId } = await params;

    // 🔧 Mock 데이터 초기화 (localStorage 기반)
    // 💡 실제 백엔드 연동 시 이 줄을 제거하세요
    cttDataService.initialize();

    // 📦 매장 상세 정보 조회 (이미지, 쿠폰, 이벤트, 리뷰 포함)
    const storeDetail = cttDataService.getStoreDetail(storeId);

    if (!storeDetail) {
      return createErrorResponse({
        errorMessage: `Store not found: ${storeId}`,
        errorCode: 'STORE_NOT_FOUND',
        status: 404,
      });
    }

    return createSuccessResponse(storeDetail);
  } catch (error) {
    console.error('Failed to fetch store detail:', error);
    return createErrorResponse({
      errorMessage: 'Failed to fetch store detail',
      errorCode: 'INTERNAL_SERVER_ERROR',
      status: 500,
    });
  }
}
