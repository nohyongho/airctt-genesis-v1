
import { NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { session_id, steps_cleared, success, client_info } = body;

        if (!session_id) {
            return NextResponse.json(
                { error: 'Missing session_id' },
                { status: 400 }
            );
        }

        const client = createPostgrestClient();

        // 1. Update Game Session
        const { error: updateError } = await client
            .from('game_sessions')
            .update({
                steps_cleared,
                success,
                client_info,
                finished_at: new Date().toISOString(),
            })
            .eq('id', session_id);

        if (updateError) {
            console.error('Error updating session:', updateError);
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        // 2. If success, Generate Reward (MVP Logic: Fixed Reward for now)
        // In a real app, this would be a sophisticated probability logic
        // 2. If success, Generate Reward (MVP Logic: Fixed Reward for now)
        // In a real app, this would be a sophisticated probability logic
        if (success) {
            // --- CRM INTEGRATION START ---
            // Find a target merchant (For Demo: First Playable Merchant)
            const { data: merchant } = await client
                .from('merchants')
                .select('id')
                .limit(1)
                .single();

            if (merchant) {
                // Import dynamically to avoid top-level issues if any
                const { registerCustomerInteraction } = await import('@/lib/crm-service');

                await registerCustomerInteraction({
                    merchant_id: merchant.id,
                    consumer_id: client_info?.consumer_id || '00000000-0000-0000-0000-000000000000', // Infer from session or body
                    touchpoint_type: 'COUPON_GAME',
                    data: {
                        amount: 0, // No spend, just game
                        coupon_id: 'demo-coupon'
                    }
                });
                console.log(`[Game API] CRM Interaction Recorded for Merchant ${merchant.id}`);
            }
            // --- CRM INTEGRATION END ---

            // Example Reward: 90% Discount Coupon Chance or Points
            // Let's create a reward record.
            const rewardPayload = {
                game_session_id: session_id,
                reward_type: 'COUPON_90', // or 'POINT_1000'
                reward_value: 90,
            };

            const { data: rewardData, error: rewardError } = await client
                .from('game_rewards')
                .insert(rewardPayload)
                .select('id, reward_type, reward_value')
                .single();

            if (rewardError) {
                console.error('Error creating reward:', rewardError);
                return NextResponse.json({ error: rewardError.message }, { status: 500 });
            }

            return NextResponse.json({
                reward_id: rewardData.id,
                reward_type: rewardData.reward_type,
                reward_value: rewardData.reward_value
            });
        }

        // If failed or no reward logic triggered
        return NextResponse.json({
            message: 'Game finished, no reward generated.',
            success: false
        });

    } catch (error: any) {
        console.error('Internal Server Error:', error);
        return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
    }
}
