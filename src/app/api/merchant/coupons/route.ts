import { NextRequest, NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';

/**
 * POST /api/merchant/coupons
 * 쿠폰 발행 (머천트)
 * CUT-2 해결: Mock → 실제 DB INSERT
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            merchant_id, store_id, title, description,
            discount_type, discount_value, total_issuable,
            valid_from, valid_to, radius_km,
            center_lat, center_lng,
            min_order_amount, per_user_limit
        } = body;

        if (!merchant_id || !title) {
            return NextResponse.json(
                { success: false, error: 'merchant_id와 title은 필수입니다.' },
                { status: 400 }
            );
        }

        const postgrest = createPostgrestClient();

        // 안전핀2: center 좌표 미지정 시 매장 좌표 사용
        let lat = center_lat, lng = center_lng;
        if ((!lat || !lng) && store_id) {
            const { data: store } = await postgrest
                .from('stores').select('lat, lng').eq('id', store_id).single();
            if (store) { lat = store.lat; lng = store.lng; }
        }

        // 안전핀2: 반경 20,000km 이상이면 origin_type='nationwide'
        const effectiveRadiusKm = radius_km || 5;
        const originType = effectiveRadiusKm >= 20000 ? 'nationwide' : (store_id ? 'store' : 'custom');

        const { data, error } = await postgrest
            .from('coupons')
            .insert({
                merchant_id,
                store_id: store_id || null,
                title,
                description: description || '',
                discount_type: discount_type || 'percent',
                discount_value: discount_value || 10,
                total_issuable: total_issuable || 100,
                valid_from: valid_from || new Date().toISOString(),
                valid_to: valid_to || null,
                radius_km: effectiveRadiusKm,
                center_type: originType,
                center_lat: lat || null,
                center_lng: lng || null,
                min_order_amount: min_order_amount || 0,
                per_user_limit: per_user_limit || 1,
                is_active: true,
            })
            .select()
            .single();

        if (error) {
            console.error('Coupon create error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Merchant coupons POST error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

/**
 * GET /api/merchant/coupons
 * 머천트 쿠폰 목록 조회
 */
export async function GET(request: NextRequest) {
    const merchantId = request.nextUrl.searchParams.get('merchant_id');

    if (!merchantId) {
        return NextResponse.json(
            { success: false, error: 'merchant_id가 필요합니다.' },
            { status: 400 }
        );
    }

    const postgrest = createPostgrestClient();

    const { data, error } = await postgrest
        .from('coupons')
        .select('*, stores(name)')
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
}
