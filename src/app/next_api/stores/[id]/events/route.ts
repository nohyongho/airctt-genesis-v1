
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { NextRequest } from 'next/server';
import { cttDataService } from '@/lib/ctt-data-service';

/**
 * 📡 CTT V2.0 API - 매장 이벤트 목록 조회
 * 
 * @endpoint GET /next_api/stores/{id}/events
 * @description 특정 매장의 진행 중인 이벤트 목록을 조회합니다
 * 
 * @param {string} id - 매장 UUID
 * @query {string} status - 이벤트 상태 필터 (기본값: 'active')
 *                          - 'active': 진행 중인 이벤트
 *                          - 'scheduled': 예정된 이벤트
 *                          - 'ended': 종료된 이벤트
 * 
 * @returns {CTTEvent[]} 이벤트 목록
 * 
 * @example
 * // Request
 * GET /next_api/stores/store-001/events?status=active
 * 
 * // Response
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "event-001",
 *       "store_id": "store-001",
 *       "title": "🎄 크리스마스 특별 이벤트",
 *       "description": "크리스마스 시즌 한정 메뉴 출시!",
 *       "event_type": "special",
 *       "discount_info": "시즌 메뉴 15% 할인",
 *       "start_at": "2024-12-19T00:00:00Z",
 *       "end_at": "2025-01-13T23:59:59Z",
 *       "status": "active",
 *       "banner_image_url": "{event_banner_url_001}"
 *     }
 *   ]
 * }
 * 
 * 🔄 실제 백엔드 교체 시:
 * 1. cttDataService.getStoreEvents() 대신 PostgreSQL 쿼리 사용
 * 2. 예시:
 *    const { data } = await postgrestClient
 *      .from('events')
 *      .select('*')
 *      .eq('store_id', storeId)
 *      .eq('status', status)
 *      .order('start_at', { ascending: false });
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

    // 📦 매장 이벤트 조회
    const events = cttDataService.getStoreEvents(storeId);

    // 상태별 필터링
    const filteredEvents = status === 'active'
      ? events
      : events.filter(event => event.status === status);

    return createSuccessResponse(filteredEvents);
  } catch (error) {
    console.error('Failed to fetch store events:', error);
    return createErrorResponse({
      errorMessage: 'Failed to fetch store events',
      errorCode: 'INTERNAL_SERVER_ERROR',
      status: 500,
    });
  }
}
