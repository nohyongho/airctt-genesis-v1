import { NextRequest, NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';

/**
 * GET /api/merchant/wallet
 * 가맹점 지갑 정보 조회
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const merchantId = searchParams.get('merchant_id');

    if (!merchantId) {
      return NextResponse.json(
        { success: false, error: 'merchant_id가 필요합니다.' },
        { status: 400 }
      );
    }

    const postgrest = createPostgrestClient();

    // 지갑 정보 조회
    const { data: wallet, error: walletError } = await postgrest
      .from('merchant_wallets')
      .select('*')
      .eq('merchant_id', merchantId)
      .single();

    if (walletError) {
      // 지갑이 없으면 생성
      if (walletError.code === 'PGRST116') {
        const { data: newWallet, error: createError } = await postgrest
          .from('merchant_wallets')
          .insert({ merchant_id: merchantId })
          .select()
          .single();

        if (createError) {
          console.error('Wallet create error:', createError);
          return NextResponse.json(
            { success: false, error: '지갑 생성에 실패했습니다.' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            wallet: newWallet,
            transactions: [],
          },
        });
      }

      console.error('Wallet query error:', walletError);
      return NextResponse.json(
        { success: false, error: '지갑 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 최근 거래 내역 조회
    const { data: transactions } = await postgrest
      .from('wallet_transactions')
      .select('*')
      .eq('wallet_id', wallet.id)
      .order('created_at', { ascending: false })
      .limit(20);

    return NextResponse.json({
      success: true,
      data: {
        wallet,
        transactions: transactions || [],
      },
    });
  } catch (error) {
    console.error('Wallet GET error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
