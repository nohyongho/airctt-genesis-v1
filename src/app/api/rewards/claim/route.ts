
import { NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { reward_id } = body;

        if (!reward_id) {
            return NextResponse.json({ error: 'Missing reward_id' }, { status: 400 });
        }

        const client = createPostgrestClient();

        // 1. Fetch Reward Info
        const { data: reward, error: fetchError } = await client
            .from('game_rewards')
            .select('*, game_sessions(consumer_id)')
            .eq('id', reward_id)
            .single();

        if (fetchError || !reward) {
            return NextResponse.json({ error: 'Reward not found' }, { status: 404 });
        }

        // Check if already claimed
        if (reward.created_coupon_issue_id || reward.created_wallet_tx_id) {
            return NextResponse.json({ error: 'Reward already claimed' }, { status: 400 });
        }

        const consumer_id = reward.game_sessions?.consumer_id;
        if (!consumer_id) {
            return NextResponse.json({ error: 'Consumer not linked' }, { status: 500 });
        }

        let result: any = { status: 'ok' };

        // 2. Payout Logic
        // Case A: Coupon
        if (reward.reward_type.startsWith('COUPON')) {
            // Find a suitable coupon template or use a specific one. 
            // MVP: Search for a coupon with valid settings or a fallback "General Reward" coupon.
            // For this MVP code, we'll assume there is a coupon with ID or we pick ANY valid one for demo.
            // TODO: specific mapping logic.

            // Let's assume we find *any* active coupon for this MVP to issue, or we fail if none.
            const { data: couponTemplate } = await client
                .from('coupons')
                .select('id')
                .eq('status', 'active')
                .limit(1)
                .single();

            if (couponTemplate) {
                const { data: issue, error: issueError } = await client
                    .from('coupon_issues')
                    .insert({
                        coupon_id: couponTemplate.id,
                        consumer_id: consumer_id,
                        issued_reason: 'GAME_REWARD',
                        status: 'ISSUED'
                    })
                    .select('id')
                    .single();

                if (!issueError) {
                    // Update Reward
                    await client.from('game_rewards').update({ created_coupon_issue_id: issue.id }).eq('id', reward_id);
                    result.coupon_issue_id = issue.id;
                }
            }
        }
        // Case B: Points (or fallback if no coupon found)
        else {
            // e.g. reward_value points
            const points = reward.reward_value || 100;

            // 1. Create Tx
            const { data: tx, error: txError } = await client
                .from('wallet_transactions')
                .insert({
                    wallet_id: (await getWalletId(client, consumer_id)), // Helper needed
                    tx_type: 'GAME_REWARD',
                    amount_points: points,
                    related_game_session_id: reward.game_session_id
                })
                .select('id')
                .single();

            if (tx && !txError) {
                // 2. Update Wallet (Manual increment for MVP)
                // Ideally use RPC or Trigger. Here we read-write (optimistic).
                await updateWalletBalance(client, consumer_id, points);

                // 3. Update Reward
                await client.from('game_rewards').update({ created_wallet_tx_id: tx.id }).eq('id', reward_id);
                result.wallet_tx_id = tx.id;
            }
        }

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Internal Server Error:', error);
        return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
    }
}

// Helper: Get Wallet ID
async function getWalletId(client: any, consumerId: string) {
    const { data } = await client.from('wallets').select('id').eq('consumer_id', consumerId).single();
    if (data) return data.id;
    // Create if missing?
    const { data: newWallet } = await client.from('wallets').insert({ consumer_id: consumerId }).select('id').single();
    return newWallet.id;
}

// Helper: Update Balance
async function updateWalletBalance(client: any, consumerId: string, amount: number) {
    const { data: wallet } = await client.from('wallets').select('id, total_points').eq('consumer_id', consumerId).single();
    if (wallet) {
        await client.from('wallets').update({
            total_points: (wallet.total_points || 0) + amount
        }).eq('id', wallet.id);
    }
}
