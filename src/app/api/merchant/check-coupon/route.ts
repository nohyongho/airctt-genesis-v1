
import { NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';

export async function POST(request: Request) {
    try {
        const { code_or_id } = await request.json();

        if (!code_or_id) {
            return NextResponse.json({ error: 'Missing code' }, { status: 400 });
        }

        const client = createPostgrestClient();

        // Try to find coupon issue by ID (or Code if we implemented code)
        // For MVP, we treat input as ID.
        const { data: issue, error } = await client
            .from('coupon_issues')
            .select(`
        id,
        status,
        coupons (
            title,
            description,
            discount_type,
            discount_value,
            valid_until
        )
      `)
            .eq('id', code_or_id)
            .single();

        if (error || !issue) {
            // Try searching by 'code' column if implemented
            const { data: issueByCode, error: error2 } = await client
                .from('coupon_issues')
                .select(`
            id,
            status,
            coupons (
                title,
                description,
                discount_type,
                discount_value,
                valid_until
            )
        `)
                .eq('code', code_or_id)
                .single();

            if (issueByCode) {
                return NextResponse.json({
                    id: issueByCode.id,
                    status: issueByCode.status,
                    title: issueByCode.coupons?.title,
                    description: issueByCode.coupons?.description,
                    discount_type: issueByCode.coupons?.discount_type,
                    discount_value: issueByCode.coupons?.discount_value,
                    valid_until: issueByCode.coupons?.valid_until
                });
            }

            return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
        }

        return NextResponse.json({
            id: issue.id,
            status: issue.status,
            title: issue.coupons?.title,
            description: issue.coupons?.description,
            discount_type: issue.coupons?.discount_type,
            discount_value: issue.coupons?.discount_value,
            valid_until: issue.coupons?.valid_until
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
