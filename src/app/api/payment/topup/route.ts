import { NextRequest, NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';

/**
 * GET /api/payment/topup
 * 충전 패키지 목록 조회
 */
export async function GET() {
  try {
    const postgrest = createPostgrestClient();

    const { data: packages, error } = await postgrest
      .from('topup_packages')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Topup packages query error:', error);
      return NextResponse.json(
        { success: false, error: '패키지 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: packages,
    });
  } catch (error) {
    console.error('Topup GET error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/payment/topup
 * 충전 결제 요청 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { merchant_id, package_id, custom_amount } = body;

    if (!merchant_id) {
      return NextResponse.json(
        { success: false, error: 'merchant_id가 필요합니다.' },
        { status: 400 }
      );
    }

    const postgrest = createPostgrestClient();

    let amount = 0;
    let bonusAmount = 0;
    let packageInfo = null;

    // 패키지 선택인 경우
    if (package_id) {
      const { data: pkg, error: pkgError } = await postgrest
        .from('topup_packages')
        .select('*')
        .eq('id', package_id)
        .eq('is_active', true)
        .single();

      if (pkgError || !pkg) {
        return NextResponse.json(
          { success: false, error: '패키지를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      amount = pkg.amount;
      bonusAmount = pkg.bonus_amount || Math.floor(amount * (pkg.bonus_percent || 0) / 100);
      packageInfo = pkg;
    } else if (custom_amount) {
      // 직접 입력
      amount = custom_amount;
      if (amount < 10000) {
        return NextResponse.json(
          { success: false, error: '최소 충전 금액은 10,000원입니다.' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'package_id 또는 custom_amount가 필요합니다.' },
        { status: 400 }
      );
    }

    // PG 주문번호 생성
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const pgOrderId = `CTT_${timestamp}_${random}`;

    // 결제 레코드 생성
    const { data: payment, error: paymentError } = await postgrest
      .from('payments')
      .insert({
        merchant_id,
        payment_type: 'topup',
        amount,
        discount_amount: 0,
        final_amount: amount,
        pg_order_id: pgOrderId,
        status: 'pending',
        metadata: {
          package_id,
          package_name: packageInfo?.name,
          bonus_amount: bonusAmount,
        },
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Payment create error:', paymentError);
      return NextResponse.json(
        { success: false, error: '결제 요청 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 토스페이먼츠 결제 요청 정보 반환
    return NextResponse.json({
      success: true,
      data: {
        payment_id: payment.id,
        pg_order_id: pgOrderId,
        amount,
        bonus_amount: bonusAmount,
        total_credit: amount + bonusAmount,
        order_name: packageInfo
          ? `AIRCTT 충전 - ${packageInfo.name}`
          : `AIRCTT 충전 - ${amount.toLocaleString()}원`,
        // 클라이언트에서 토스 SDK로 결제 진행
        toss_config: {
          clientKey: process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_xxx',
          orderId: pgOrderId,
          amount,
          orderName: packageInfo
            ? `AIRCTT 충전 - ${packageInfo.name}`
            : `AIRCTT 충전`,
          successUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/merchant/wallet/success`,
          failUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/merchant/wallet/fail`,
        },
      },
    });
  } catch (error) {
    console.error('Topup POST error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
