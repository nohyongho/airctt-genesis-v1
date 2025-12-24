import { NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';

// GET - 매장 링크 목록 조회
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const client = createPostgrestClient();

        const { data, error } = await client
            .from('store_links')
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

// POST - 링크 추가
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { label, url, icon } = body;

        if (!label || !url) {
            return NextResponse.json(
                { error: '라벨과 URL이 필요합니다.' },
                { status: 400 }
            );
        }

        // URL 유효성 검사
        try {
            new URL(url);
        } catch {
            return NextResponse.json(
                { error: '유효한 URL 형식이 아닙니다.' },
                { status: 400 }
            );
        }

        const client = createPostgrestClient();

        // 현재 최대 sort_order 조회
        const { data: existing } = await client
            .from('store_links')
            .select('sort_order')
            .eq('store_id', id)
            .order('sort_order', { ascending: false })
            .limit(1);

        const nextOrder = existing && existing.length > 0
            ? (existing[0].sort_order || 0) + 1
            : 0;

        const { data, error } = await client
            .from('store_links')
            .insert({
                store_id: id,
                label,
                url,
                icon: icon || null,
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
            link: data
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH - 링크 수정
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { linkId, label, url, icon, sort_order } = body;

        if (!linkId) {
            return NextResponse.json(
                { error: 'linkId가 필요합니다.' },
                { status: 400 }
            );
        }

        const updateData: Record<string, any> = {};
        if (label !== undefined) updateData.label = label;
        if (url !== undefined) {
            try {
                new URL(url);
                updateData.url = url;
            } catch {
                return NextResponse.json(
                    { error: '유효한 URL 형식이 아닙니다.' },
                    { status: 400 }
                );
            }
        }
        if (icon !== undefined) updateData.icon = icon;
        if (sort_order !== undefined) updateData.sort_order = sort_order;

        const client = createPostgrestClient();

        const { data, error } = await client
            .from('store_links')
            .update(updateData)
            .eq('id', linkId)
            .eq('store_id', id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            link: data
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - 링크 삭제 (soft delete)
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const linkId = searchParams.get('linkId');

        if (!linkId) {
            return NextResponse.json(
                { error: 'linkId가 필요합니다.' },
                { status: 400 }
            );
        }

        const client = createPostgrestClient();

        const { data, error } = await client
            .from('store_links')
            .update({ status: 'deleted' })
            .eq('id', linkId)
            .eq('store_id', id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            link: data
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
