
import { NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        const token = authHeader?.replace('Bearer ', '');
        const client = createPostgrestClient(token);

        // 1. Get Current User ID from Token (RLS context)
        const { data: userData, error: userError } = await client.from('users').select('id').single();

        if (userError || !userData) {
            return NextResponse.json({ error: '로그인 후 이용해주세요.' }, { status: 401 });
        }

        const userId = userData.id;

        // 2. Check if Merchant already exists for this user
        const { data: existingMerchant } = await client
            .from('merchants')
            .select('id')
            .eq('owner_user_id', userId)
            .single();

        let merchantId = existingMerchant?.id;

        // 3. Create Merchant if not exists
        if (!merchantId) {
            const { data: newMerchant, error: merchError } = await client
                .from('merchants')
                .insert({
                    owner_user_id: userId,
                    name: 'AIRCTT 데모 스토어',
                    category: 'CAFE',
                    region: 'SEOUL',
                    status: 'active'
                })
                .select()
                .single();

            if (merchError) throw merchError;
            merchantId = newMerchant.id;
        }

        // 4. Create Store (Gangnam Branch)
        const { data: existingStore } = await client
            .from('stores')
            .select('id')
            .eq('merchant_id', merchantId)
            .single();

        let storeId = existingStore?.id;

        if (!storeId) {
            const { data: newStore, error: storeError } = await client
                .from('stores')
                .insert({
                    merchant_id: merchantId,
                    name: '강남 1호점 (데모)',
                    address: '서울 강남구 테헤란로 123',
                    status: 'active',
                    location: 'POINT(127.0276 37.4979)' // Optional text rep
                })
                .select()
                .single();

            if (storeError) throw storeError;
            storeId = newStore.id;
        }

        // 5. Create 3 Demo Coupons
        // Check duplication by title to avoid spamming
        const { count } = await client.from('coupons').select('*', { count: 'exact', head: true }).eq('merchant_id', merchantId);

        if ((count || 0) < 3) {
            await client.from('coupons').insert([
                {
                    merchant_id: merchantId,
                    store_id: storeId,
                    title: '💎 전설의 다이아몬드 할인',
                    description: '전 메뉴 90% 파격 할인 (데모용)',
                    discount_type: 'PERCENT',
                    discount_value: 90,
                    stock_initial: 1000,
                    stock_remaining: 1000,
                    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    merchant_id: merchantId,
                    store_id: storeId,
                    title: '☕ 아메리카노 1잔 무료',
                    description: '신규 가입 감사 쿠폰',
                    discount_type: 'FREE_ITEM',
                    discount_value: 0,
                    stock_initial: 500,
                    stock_remaining: 500,
                    valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    merchant_id: merchantId,
                    store_id: storeId,
                    title: '🎟️ 5,000원 금액권',
                    description: '모든 상품 구매 시 사용 가능',
                    discount_type: 'FIXED_AMOUNT',
                    discount_value: 5000,
                    stock_initial: 500,
                    stock_remaining: 500,
                    valid_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
                }
            ]);
        }

        return NextResponse.json({
            success: true,
            message: '데모 매장과 쿠폰이 생성되었습니다! 이제 게임에서 이 쿠폰들이 등장합니다.'
        });

    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message || 'Setup failed' }, { status: 500 });
    }
}
