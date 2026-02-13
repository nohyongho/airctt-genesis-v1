
import { NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { user_id, coupon_id, reason } = body;

        if (!user_id || !coupon_id) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const client = createPostgrestClient();

        const { data, error } = await client
            .from('coupon_issues')
            .insert({
                user_id,
                coupon_id,
                issued_from: reason || 'manual',
                is_used: false,
                issued_at: new Date().toISOString(),
            })
            .select('id, is_used')
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            coupon_issue_id: data.id,
            is_used: data.is_used,
            status: data.is_used ? 'used' : 'issued',
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
