
import { NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { coupon_issue_id, store_id } = body;

        if (!coupon_issue_id || !store_id) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const client = createPostgrestClient();

        // 1. Verify Coupon
        const { data: issue, error: fetchError } = await client
            .from('coupon_issues')
            .select('status')
            .eq('id', coupon_issue_id)
            .single();

        if (fetchError || !issue) {
            return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
        }

        if (issue.status !== 'ISSUED') {
            return NextResponse.json({ error: `Coupon cannot be used. Status: ${issue.status}` }, { status: 400 });
        }

        // 2. Use Coupon
        const { data, error: updateError } = await client
            .from('coupon_issues')
            .update({
                status: 'USED',
                used_at: new Date().toISOString(),
                used_store_id: store_id
            })
            .eq('id', coupon_issue_id)
            .select('id, status, used_at')
            .single();

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json(data);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
