import { NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
}

// GET - 주변 매장 조회 (반경 필터링 적용)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const lat = parseFloat(searchParams.get('lat') || '0');
        const lng = parseFloat(searchParams.get('lng') || '0');
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const limit = parseInt(searchParams.get('limit') || '50');

        const client = createPostgrestClient();

        // 기본 쿼리 - 활성 매장만
        let query = client
            .from('stores')
            .select(`
                id,
                merchant_id,
                name,
                description,
                address,
                lat,
                lng,
                phone,
                opening_hours,
                homepage_url,
                hero_image_url,
                promo_video_url,
                order_url,
                reservation_url,
                radius_meters,
                is_active,
                store_media!inner(id, type, url, title, sort_order, status),
                store_links(id, label, url, icon, sort_order, status)
            `)
            .eq('is_active', true);

        // 검색어 필터
        if (search) {
            query = query.ilike('name', `%${search}%`);
        }

        const { data: stores, error } = await query.limit(limit * 2); // 필터링 전 여유있게 가져오기

        if (error) {
            console.error('Store fetch error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!stores || stores.length === 0) {
            return NextResponse.json([]);
        }

        // 반경 필터링 및 거리 계산
        const filteredStores = stores
            .map(store => {
                // 매장 좌표가 없으면 거리 계산 불가
                if (!store.lat || !store.lng) {
                    return { ...store, distance: null, withinRadius: true };
                }

                // 사용자 위치가 없으면 모든 매장 표시
                if (!lat || !lng) {
                    return { ...store, distance: null, withinRadius: true };
                }

                const distance = calculateDistance(lat, lng, store.lat, store.lng);
                const storeRadius = store.radius_meters || 5000; // 기본 5km

                // 고객이 매장의 반경 내에 있는지 확인
                const withinRadius = distance <= storeRadius;

                return {
                    ...store,
                    distance: Math.round(distance),
                    distanceText: formatDistance(distance),
                    withinRadius
                };
            })
            .filter(store => store.withinRadius) // 반경 내 매장만
            .filter(store => {
                // store_media에서 active 상태만 필터
                if (store.store_media) {
                    store.store_media = store.store_media.filter(
                        (m: any) => m.status === 'active'
                    );
                }
                // store_links에서 active 상태만 필터
                if (store.store_links) {
                    store.store_links = store.store_links.filter(
                        (l: any) => l.status === 'active'
                    );
                }
                return true;
            })
            .sort((a, b) => {
                // 거리순 정렬
                if (a.distance === null) return 1;
                if (b.distance === null) return -1;
                return a.distance - b.distance;
            })
            .slice(0, limit);

        return NextResponse.json(filteredStores);
    } catch (error: any) {
        console.error('Consumer stores API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

function formatDistance(meters: number): string {
    if (meters < 1000) {
        return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
}
