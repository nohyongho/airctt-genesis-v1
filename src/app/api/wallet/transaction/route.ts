
import { NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { consumer_id, type, amount_points } = body;

        if (!consumer_id || !type || amount_points === undefined) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const client = createPostgrestClient();

        // 1. Get Wallet
        const { data: wallet, error: walletError } = await client
            .from('wallets')
            .select('id, total_points')
            .eq('consumer_id', consumer_id)
            .single();

        let walletId = wallet?.id;
        let currentPoints = wallet?.total_points || 0;

        // Create wallet if not exists (Auto-provisioning for MVP)
        if (!wallet) {
            const { data: newWallet, error: createError } = await client
                .from('wallets')
                .insert({ consumer_id, total_points: 0 })
                .select('id, total_points')
                .single();
            if (createError) throw createError;
            walletId = newWallet.id;
            currentPoints = 0;
        }

        // 2. Create Transaction
        const { data: tx, error: txError } = await client
            .from('wallet_transactions')
            .insert({
                wallet_id: walletId,
                tx_type: type,
                amount_points: amount_points
            })
            .select('id, created_at')
            .single();

        if (txError) {
            return NextResponse.json({ error: txError.message }, { status: 500 });
        }

        // 3. Update Balance
        const newBalance = currentPoints + amount_points;
        await client
            .from('wallets')
            .update({ total_points: newBalance })
            .eq('id', walletId);

        return NextResponse.json({
            status: 'ok',
            wallet_tx_id: tx.id,
            new_balance: newBalance
        });

    } catch (error: any) {
        console.error('Internal Server Error:', error);
        return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
    }
}
