import { NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';

// GET - 매장 상세 조회
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
                *,
                store_media(id, type, url, title, sort_order, status),
                store_links(id, label, url, icon, sort_order, status)
            `)
            .eq('id', id)
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }

        return NextResponse.json(store);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH - 매장 정보 수정 (반경, URL 등)
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const client = createPostgrestClient();

        // 허용된 필드만 업데이트
        const allowedFields = [
            'name', 'description', 'address', 'phone', 'opening_hours',
            'homepage_url', 'radius_meters', 'hero_image_url',
            'promo_video_url', 'order_url', 'reservation_url',
            'lat', 'lng', 'is_active'
        ];

        const updateData: Record<string, any> = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        }

        // radius_meters 유효성 검사 (0 ~ 20,000km)
        if (updateData.radius_meters !== undefined) {
            const radius = Number(updateData.radius_meters);
            if (isNaN(radius) || radius < 0 || radius > 20000000) {
                return NextResponse.json(
                    { error: '반경은 0~20,000km 사이여야 합니다.' },
                    { status: 400 }
                );
            }
            updateData.radius_meters = radius;
        }

        const { data, error } = await client
            .from('stores')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
