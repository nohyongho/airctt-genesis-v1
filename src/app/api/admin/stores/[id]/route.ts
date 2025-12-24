import { NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';

// GET - 매장 상세 조회 (관리자용 - 모든 정보)
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
                merchants(id, name, type, homepage_url),
                store_media(id, type, url, title, sort_order, status, created_at),
                store_links(id, label, url, icon, sort_order, status, created_at)
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

// PATCH - 매장 정보 수정 (관리자 - 모든 필드 수정 가능)
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const client = createPostgrestClient();

        // 이전 값 조회 (감사 로그용)
        const { data: oldStore } = await client
            .from('stores')
            .select('*')
            .eq('id', id)
            .single();

        // 업데이트
        const { data, error } = await client
            .from('stores')
            .update(body)
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
                action: 'UPDATE_STORE',
                target_type: 'store',
                target_id: id,
                old_value: oldStore,
                new_value: data
            });

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - 매장 비활성화 (실제 삭제가 아닌 soft delete)
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const client = createPostgrestClient();

        const { data, error } = await client
            .from('stores')
            .update({ is_active: false })
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
                action: 'DEACTIVATE_STORE',
                target_type: 'store',
                target_id: id,
                new_value: { is_active: false }
            });

        return NextResponse.json({
            success: true,
            store: data
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
