import { NextRequest, NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';

/**
 * POST /api/payment/confirm
 * 토스페이먼츠 결제 승인
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentKey, orderId, amount } = body;

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { success: false, error: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const postgrest = createPostgrestClient();

    // 결제 정보 조회
    const { data: payment, error: paymentError } = await postgrest
      .from('payments')
      .select('*')
      .eq('pg_order_id', orderId)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { success: false, error: '결제 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 금액 검증
    if (payment.final_amount !== amount) {
      return NextResponse.json(
        { success: false, error: '결제 금액이 일치하지 않습니다.' },
        { status: 400 }
      );
    }

    // 토스페이먼츠 결제 승인 API 호출
    const secretKey = process.env.TOSS_SECRET_KEY || 'test_sk_xxx';
    const encryptedSecretKey = Buffer.from(secretKey + ':').toString('base64');

    const tossResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${encryptedSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    });

    const tossData = await tossResponse.json();

    if (!tossResponse.ok) {
      console.error('Toss confirm error:', tossData);

      // 결제 실패 처리
      await postgrest
        .from('payments')
        .update({
          status: 'failed',
          failed_at: new Date().toISOString(),
          metadata: {
            ...payment.metadata,
            error: tossData,
          },
        })
        .eq('id', payment.id);

      return NextResponse.json(
        {
          success: false,
          error: tossData.message || '결제 승인에 실패했습니다.',
          code: tossData.code,
        },
        { status: 400 }
      );
    }

    // 결제 성공 처리
    const { data: updatedPayment, error: updateError } = await postgrest
      .from('payments')
      .update({
        status: 'paid',
        pg_payment_key: paymentKey,
        payment_method: tossData.method,
        card_company: tossData.card?.company,
        card_number: tossData.card?.number,
        approved_at: new Date().toISOString(),
        metadata: {
          ...payment.metadata,
          toss_response: {
            method: tossData.method,
            card: tossData.card,
            receipt: tossData.receipt,
            approvedAt: tossData.approvedAt,
          },
        },
      })
      .eq('id', payment.id)
      .select()
      .single();

    if (updateError) {
      console.error('Payment update error:', updateError);
    }

    // 충전 결제인 경우 지갑 업데이트
    if (payment.payment_type === 'topup') {
      await processTopupPayment(postgrest, payment.id);
    }

    // 거래 이벤트 기록
    await postgrest.from('transaction_events').insert({
      event_type: 'payment_completed',
      merchant_id: payment.merchant_id,
      store_id: payment.store_id,
      amount: payment.final_amount,
      metadata: {
        payment_id: payment.id,
        payment_type: payment.payment_type,
        pg_order_id: orderId,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        payment_id: payment.id,
        amount: payment.final_amount,
        bonus_amount: payment.metadata?.bonus_amount || 0,
        total_credit: payment.final_amount + (payment.metadata?.bonus_amount || 0),
        receipt_url: tossData.receipt?.url,
      },
    });
  } catch (error) {
    console.error('Payment confirm error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 충전 결제 처리
async function processTopupPayment(postgrest: any, paymentId: string) {
  try {
    // 결제 정보 조회
    const { data: payment } = await postgrest
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (!payment) return;

    // 지갑 조회
    const { data: wallet } = await postgrest
      .from('merchant_wallets')
      .select('*')
      .eq('merchant_id', payment.merchant_id)
      .single();

    if (!wallet) return;

    const bonusAmount = payment.metadata?.bonus_amount || 0;
    const totalCredit = payment.final_amount + bonusAmount;
    const currentBalance = wallet.balance || 0;

    // 지갑 잔액 업데이트
    await postgrest
      .from('merchant_wallets')
      .update({
        balance: currentBalance + totalCredit,
        total_charged: (wallet.total_charged || 0) + payment.final_amount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', wallet.id);

    // 충전 거래 내역 기록
    await postgrest.from('wallet_transactions').insert({
      wallet_id: wallet.id,
      merchant_id: payment.merchant_id,
      transaction_type: 'charge',
      amount: payment.final_amount,
      balance_before: currentBalance,
      balance_after: currentBalance + payment.final_amount,
      payment_id: paymentId,
      description: '충전',
    });

    // 보너스 거래 내역 기록
    if (bonusAmount > 0) {
      await postgrest.from('wallet_transactions').insert({
        wallet_id: wallet.id,
        merchant_id: payment.merchant_id,
        transaction_type: 'bonus',
        amount: bonusAmount,
        balance_before: currentBalance + payment.final_amount,
        balance_after: currentBalance + totalCredit,
        payment_id: paymentId,
        description: '충전 보너스',
      });
    }
  } catch (error) {
    console.error('Process topup error:', error);
  }
}
