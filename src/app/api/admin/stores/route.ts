import { NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';

// GET - 전체 매장 조회 (관리자용)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const status = searchParams.get('status'); // active, inactive, all
        const limit = parseInt(searchParams.get('limit') || '100');
        const offset = parseInt(searchParams.get('offset') || '0');

        const client = createPostgrestClient();

        let query = client
            .from('stores')
            .select(`
                *,
                merchants(id, name, type),
                store_media(id, type, url, title, status),
                store_links(id, label, url, status)
            `, { count: 'exact' });

        // 검색어 필터
        if (search) {
            query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%`);
        }

        // 상태 필터
        if (status === 'active') {
            query = query.eq('is_active', true);
        } else if (status === 'inactive') {
            query = query.eq('is_active', false);
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            stores: data || [],
            total: count || 0,
            limit,
            offset
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
