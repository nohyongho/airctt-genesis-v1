
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

        // 2. If success, Generate Reward & Issue Coupon (Master Schema Integration)
        if (success) {
            // A. Find a target merchant (For Demo: First Playable Merchant)
            const { data: merchant } = await client
                .from('merchants')
                .select('id')
                .limit(1)
                .single();

            if (!merchant) {
                console.error('No merchant found for reward');
                return NextResponse.json({ success: true, message: 'No merchant found' });
            }

            // B. Find a valid Coupon to Issue
            const { data: coupon } = await client
                .from('coupons')
                .select('id, title, discount_value, discount_type')
                .eq('merchant_id', merchant.id)
                .limit(1)
                .single();

            // Fallback if no coupon exists (Create dynamic or skip)
            // For stability, we assume at least one coupon exists or we skip issue
            let issueId = null;

            if (coupon) {
                // C. CRM & Coupon Issue
                // FORCE DEMO ID: Ensure synchronization between Game and Wallet for the demo
                const userId = '00000000-0000-0000-0000-000000000000';

                // 1. CRM Interaction
                const { registerCustomerInteraction } = await import('@/lib/crm-service');
                await registerCustomerInteraction({
                    merchant_id: merchant.id,
                    consumer_id: userId,
                    touchpoint_type: 'COUPON_GAME',
                    data: {
                        amount: 0,
                        coupon_id: coupon.id
                    }
                });

                // 2. Insert into coupon_issues (The Critical Fix)
                const { data: issueData, error: issueError } = await client
                    .from('coupon_issues')
                    .insert({
                        coupon_id: coupon.id,
                        user_id: userId,
                        issued_from: 'event',
                        issued_at: new Date().toISOString(),
                        is_used: false
                    })
                    .select('id')
                    .single();

                if (issueError) {
                    console.error('Error issuing coupon:', issueError);
                    // Explicitly return success: false as requested
                    return NextResponse.json({
                        success: false,
                        error: issueError.message,
                        details: 'DB Insert Failed. Check RLS policies.'
                    }, { status: 500 });
                }

                issueId = issueData.id;
                console.log(`[Game API] Coupon Issued: ${issueId} for User ${userId}`);
            } else {
                console.warn('[Game API] No active coupon found to issue.');
                // If no coupon found, we might want to return false or just success with no issue_id
                // Responding success: true regarding 'Game Finished' but issue_id: null
            }

            return NextResponse.json({
                success: true,
                reward_type: 'COUPON',
                reward_value: coupon ? coupon.discount_value : 0,
                coupon_title: coupon ? coupon.title : 'Lucky Coupon',
                issue_id: issueId
            });
        }

        // If failed
        return NextResponse.json({
            message: 'Game finished, no reward generated.',
            success: false
        });

    } catch (error: any) {
        console.error('Internal Server Error:', error);
        return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
    }
}
