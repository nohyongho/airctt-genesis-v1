import { NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';

// GET - 매장 미디어 목록 조회
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const client = createPostgrestClient();

        const { data, error } = await client
            .from('store_media')
            .select('*')
            .eq('store_id', id)
            .neq('status', 'deleted')
            .order('sort_order', { ascending: true });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data || []);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - 미디어 추가 (이미지 또는 영상)
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { url, type, title } = body;

        if (!url || !type) {
            return NextResponse.json(
                { error: 'URL과 타입이 필요합니다.' },
                { status: 400 }
            );
        }

        if (!['image', 'video'].includes(type)) {
            return NextResponse.json(
                { error: '타입은 image 또는 video여야 합니다.' },
                { status: 400 }
            );
        }

        const client = createPostgrestClient();

        // 현재 최대 sort_order 조회
        const { data: existing } = await client
            .from('store_media')
            .select('sort_order')
            .eq('store_id', id)
            .order('sort_order', { ascending: false })
            .limit(1);

        const nextOrder = existing && existing.length > 0
            ? (existing[0].sort_order || 0) + 1
            : 0;

        const { data, error } = await client
            .from('store_media')
            .insert({
                store_id: id,
                type,
                url,
                title: title || null,
                sort_order: nextOrder,
                status: 'active'
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            media: data
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - 미디어 삭제 (soft delete)
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const mediaId = searchParams.get('mediaId');

        if (!mediaId) {
            return NextResponse.json(
                { error: 'mediaId가 필요합니다.' },
                { status: 400 }
            );
        }

        const client = createPostgrestClient();

        const { data, error } = await client
            .from('store_media')
            .update({ status: 'deleted' })
            .eq('id', mediaId)
            .eq('store_id', id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            media: data
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
