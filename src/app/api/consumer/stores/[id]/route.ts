import { NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';

// GET - 매장 상세 조회 (소비자용)
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const client = createPostgrestClient();

        const { data: store, error } = await client
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
                is_active,
                store_media(id, type, url, title, sort_order, status),
                store_links(id, label, url, icon, sort_order, status),
                coupons(id, title, description, discount_type, discount_value, valid_to, is_active)
            `)
            .eq('id', id)
            .eq('is_active', true)
            .single();

        if (error) {
            return NextResponse.json({ error: '매장을 찾을 수 없습니다.' }, { status: 404 });
        }

        // active 상태 미디어/링크만 필터링
        if (store.store_media) {
            store.store_media = store.store_media
                .filter((m: any) => m.status === 'active')
                .sort((a: any, b: any) => a.sort_order - b.sort_order);
        }

        if (store.store_links) {
            store.store_links = store.store_links
                .filter((l: any) => l.status === 'active')
                .sort((a: any, b: any) => a.sort_order - b.sort_order);
        }

        // active 쿠폰만 필터링
        if (store.coupons) {
            const now = new Date().toISOString();
            store.coupons = store.coupons.filter((c: any) =>
                c.is_active && (!c.valid_to || c.valid_to > now)
            );
        }

        return NextResponse.json(store);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
