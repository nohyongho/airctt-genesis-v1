
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { NextRequest } from 'next/server';
import { cttDataService } from '@/lib/ctt-data-service';

/**
 * 📡 CTT V2.0 API - 매장 쿠폰 목록 조회
 * 
 * @endpoint GET /next_api/stores/{id}/coupons
 * @description 특정 매장의 사용 가능한 쿠폰 목록을 조회합니다
 * 
 * @param {string} id - 매장 UUID
 * @query {string} status - 쿠폰 상태 필터 (기본값: 'active')
 *                          - 'active': 사용 가능한 쿠폰
 *                          - 'scheduled': 예정된 쿠폰
 *                          - 'expired': 만료된 쿠폰
 * 
 * @returns {CTTCoupon[]} 쿠폰 목록
 * 
 * @example
 * // Request
 * GET /next_api/stores/store-001/coupons?status=active
 * 
 * // Response
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "coupon-001",
 *       "store_id": "store-001",
 *       "title": "아메리카노 1+1 이벤트",
 *       "description": "아메리카노 구매 시 동일 메뉴 1잔 무료 제공!",
 *       "discount_type": "gift",
 *       "discount_value": 0,
 *       "start_at": "2024-12-19T00:00:00Z",
 *       "end_at": "2025-01-18T23:59:59Z",
 *       "status": "active",
 *       "terms_conditions": "1인 1일 1회 사용 가능",
 *       "max_usage_count": 100,
 *       "current_usage_count": 23,
 *       "ar_link": "{ar_coupon_link_001}"
 *     }
 *   ]
 * }
 * 
 * 🔄 실제 백엔드 교체 시:
 * 1. cttDataService.getStoreCoupons() 대신 PostgreSQL 쿼리 사용
 * 2. 예시:
 *    const { data } = await postgrestClient
 *      .from('coupons')
 *      .select('*')
 *      .eq('store_id', storeId)
 *      .eq('status', status);
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storeId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'active';

    // 🔧 Mock 데이터 초기화
    cttDataService.initialize();

    // 📦 매장 쿠폰 조회
    const coupons = cttDataService.getStoreCoupons(storeId);

    // 상태별 필터링 (현재는 active만 반환하지만, 추후 확장 가능)
    const filteredCoupons = status === 'active' 
      ? coupons 
      : coupons.filter(coupon => coupon.status === status);

    return createSuccessResponse(filteredCoupons);
  } catch (error) {
    console.error('Failed to fetch store coupons:', error);
    return createErrorResponse({
      errorMessage: 'Failed to fetch store coupons',
      errorCode: 'INTERNAL_SERVER_ERROR',
      status: 500,
    });
  }
}
