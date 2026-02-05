
import { NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';

function extractCoupon(coupons: any) {
    if (Array.isArray(coupons)) return coupons[0] || null;
    return coupons || null;
}

export async function POST(request: Request) {
    try {
        const { code_or_id } = await request.json();

        if (!code_or_id) {
            return NextResponse.json({ error: 'Missing code' }, { status: 400 });
        }

        const client = createPostgrestClient();

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
            const { data: issueByCode } = await client
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
                const coupon = extractCoupon(issueByCode.coupons);
                return NextResponse.json({
                    id: issueByCode.id,
                    status: issueByCode.status,
                    title: coupon?.title,
                    description: coupon?.description,
                    discount_type: coupon?.discount_type,
                    discount_value: coupon?.discount_value,
                    valid_until: coupon?.valid_until
                });
            }

            return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
        }

        const coupon = extractCoupon(issue.coupons);
        return NextResponse.json({
            id: issue.id,
            status: issue.status,
            title: coupon?.title,
            description: coupon?.description,
            discount_type: coupon?.discount_type,
            discount_value: coupon?.discount_value,
            valid_until: coupon?.valid_until
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
