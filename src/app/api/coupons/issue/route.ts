
import { NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { consumer_id, coupon_id, reason } = body;

        if (!consumer_id || !coupon_id) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const client = createPostgrestClient();

        const { data, error } = await client
            .from('coupon_issues')
            .insert({
                consumer_id,
                coupon_id,
                issued_reason: reason || 'MANUAL',
                status: 'ISSUED',
                issued_at: new Date().toISOString(),
            })
            .select('id, status')
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            coupon_issue_id: data.id,
            status: data.status,
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
