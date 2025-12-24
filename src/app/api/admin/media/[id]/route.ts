import { NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';

// GET - 미디어 상세 조회
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const client = createPostgrestClient();

        const { data, error } = await client
            .from('store_media')
            .select(`
                *,
                stores(id, name, merchant_id)
            `)
            .eq('id', id)
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH - 미디어 상태 변경 (숨김/활성화)
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        if (!status || !['active', 'hidden', 'deleted'].includes(status)) {
            return NextResponse.json(
                { error: '유효한 상태값이 필요합니다. (active, hidden, deleted)' },
                { status: 400 }
            );
        }

        const client = createPostgrestClient();

        // 이전 값 조회
        const { data: oldMedia } = await client
            .from('store_media')
            .select('*')
            .eq('id', id)
            .single();

        // 업데이트
        const { data, error } = await client
            .from('store_media')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // 감사 로그 기록
        await client
            .from('admin_audit_logs')
            .insert({
                action: status === 'hidden' ? 'HIDE_MEDIA' : status === 'deleted' ? 'DELETE_MEDIA' : 'ACTIVATE_MEDIA',
                target_type: 'store_media',
                target_id: id,
                old_value: oldMedia,
                new_value: data
            });

        return NextResponse.json({
            success: true,
            media: data
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - 미디어 완전 삭제 (soft delete)
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const client = createPostgrestClient();

        // 이전 값 조회
        const { data: oldMedia } = await client
            .from('store_media')
            .select('*')
            .eq('id', id)
            .single();

        // soft delete
        const { data, error } = await client
            .from('store_media')
            .update({ status: 'deleted' })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // 감사 로그 기록
        await client
            .from('admin_audit_logs')
            .insert({
                action: 'DELETE_MEDIA',
                target_type: 'store_media',
                target_id: id,
                old_value: oldMedia,
                new_value: { status: 'deleted' }
            });

        return NextResponse.json({
            success: true,
            message: '미디어가 삭제되었습니다.'
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
