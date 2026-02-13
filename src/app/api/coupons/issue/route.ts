
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

        // ★ 중복 발급 체크: 이미 이 쿠폰을 보유하고 있는지 확인
        const { data: existing } = await client
            .from('coupon_issues')
            .select('id, is_used, issued_at')
            .eq('user_id', user_id)
            .eq('coupon_id', coupon_id)
            .eq('is_used', false)
            .maybeSingle();

        if (existing) {
            // 이미 보유 → insert 하지 않고 기존 issue 반환
            return NextResponse.json({
                coupon_issue_id: existing.id,
                is_used: existing.is_used,
                status: 'issued',
                alreadyOwned: true,
            }, { status: 409 });
        }

        // 신규 발급
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
            // 유니크 인덱스 충돌 (race condition 방어)
            if (error.code === '23505') {
                return NextResponse.json({
                    alreadyOwned: true,
                    status: 'issued',
                    error: '이미 보유한 쿠폰입니다.',
                }, { status: 409 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            coupon_issue_id: data.id,
            is_used: data.is_used,
            status: 'issued',
            alreadyOwned: false,
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
