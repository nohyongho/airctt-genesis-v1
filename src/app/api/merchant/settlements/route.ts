import { NextRequest, NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';

/**
 * GET /api/merchant/settlements
 * 정산 내역 조회
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const merchantId = searchParams.get('merchant_id');
    const status = searchParams.get('status');
    const settlementId = searchParams.get('settlement_id');

    if (!merchantId && !settlementId) {
      return NextResponse.json(
        { success: false, error: 'merchant_id 또는 settlement_id가 필요합니다.' },
        { status: 400 }
      );
    }

    const postgrest = createPostgrestClient();

    // 단일 정산 조회
    if (settlementId) {
      const { data: settlement, error } = await postgrest
        .from('settlements')
        .select(`
          *,
          settlement_items(*)
        `)
        .eq('id', settlementId)
        .single();

      if (error || !settlement) {
        return NextResponse.json(
          { success: false, error: '정산 내역을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: settlement,
      });
    }

    // 정산 목록 조회
    let query = postgrest
      .from('settlements')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('period_start', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Settlements query error:', error);
      return NextResponse.json(
        { success: false, error: '정산 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 요약 통계
    const summary = {
      total_gross: data?.reduce((sum, s) => sum + (s.gross_amount || 0), 0) || 0,
      total_net: data?.reduce((sum, s) => sum + (s.net_amount || 0), 0) || 0,
      pending_count: data?.filter(s => s.status === 'pending').length || 0,
      completed_count: data?.filter(s => s.status === 'completed').length || 0,
    };

    return NextResponse.json({
      success: true,
      data,
      summary,
    });
  } catch (error) {
    console.error('Settlements GET error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/merchant/settlements
 * 정산 생성 요청 (관리자용)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { merchant_id, period_start, period_end } = body;

    if (!merchant_id) {
      return NextResponse.json(
        { success: false, error: 'merchant_id가 필요합니다.' },
        { status: 400 }
      );
    }

    const postgrest = createPostgrestClient();

    // 기간 설정
    const start = period_start
      ? new Date(period_start)
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 기본: 지난 7일
    const end = period_end ? new Date(period_end) : new Date();

    // 해당 기간 결제 집계
    const { data: payments, error: paymentsError } = await postgrest
      .from('payments')
      .select('*')
      .eq('merchant_id', merchant_id)
      .eq('status', 'paid')
      .gte('approved_at', start.toISOString())
      .lte('approved_at', end.toISOString());

    if (paymentsError) {
      console.error('Payments query error:', paymentsError);
      return NextResponse.json(
        { success: false, error: '결제 내역 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 금액 계산
    const grossAmount = payments?.reduce((sum, p) => sum + (p.final_amount || 0), 0) || 0;
    const orderCount = payments?.length || 0;
    const feeRate = 3.5; // 기본 수수료율
    const feeAmount = Math.round(grossAmount * feeRate / 100);
    const netAmount = grossAmount - feeAmount;

    // 환불 내역 조회
    const { data: refunds } = await postgrest
      .from('payments')
      .select('refund_amount')
      .eq('merchant_id', merchant_id)
      .eq('status', 'refunded')
      .gte('refunded_at', start.toISOString())
      .lte('refunded_at', end.toISOString());

    const refundAmount = refunds?.reduce((sum, r) => sum + (r.refund_amount || 0), 0) || 0;
    const refundCount = refunds?.length || 0;

    // 정산 레코드 생성
    const { data: settlement, error: createError } = await postgrest
      .from('settlements')
      .insert({
        merchant_id,
        period_start: start.toISOString().split('T')[0],
        period_end: end.toISOString().split('T')[0],
        gross_amount: grossAmount,
        fee_amount: feeAmount,
        fee_rate: feeRate,
        net_amount: netAmount - refundAmount,
        order_count: orderCount,
        refund_count: refundCount,
        refund_amount: refundAmount,
        status: 'pending',
      })
      .select()
      .single();

    if (createError) {
      console.error('Settlement create error:', createError);
      return NextResponse.json(
        { success: false, error: '정산 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 정산 상세 항목 생성
    if (payments && payments.length > 0) {
      const items = payments.map(p => ({
        settlement_id: settlement.id,
        item_type: 'order',
        reference_id: p.id,
        reference_type: 'payment',
        gross_amount: p.final_amount,
        fee_amount: Math.round(p.final_amount * feeRate / 100),
        net_amount: p.final_amount - Math.round(p.final_amount * feeRate / 100),
        description: p.payment_type === 'topup' ? '충전' : '주문',
        occurred_at: p.approved_at,
      }));

      await postgrest.from('settlement_items').insert(items);
    }

    return NextResponse.json({
      success: true,
      data: settlement,
    });
  } catch (error) {
    console.error('Settlements POST error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/merchant/settlements
 * 정산 상태 업데이트 (관리자용)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { settlement_id, status, bank_name, bank_account, account_holder, notes } = body;

    if (!settlement_id || !status) {
      return NextResponse.json(
        { success: false, error: 'settlement_id와 status가 필요합니다.' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'completed', 'failed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 상태입니다.' },
        { status: 400 }
      );
    }

    const postgrest = createPostgrestClient();

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    // 상태별 타임스탬프
    if (status === 'confirmed') {
      updateData.confirmed_at = new Date().toISOString();
    } else if (status === 'processing') {
      updateData.processed_at = new Date().toISOString();
    } else if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    // 계좌 정보
    if (bank_name) updateData.bank_name = bank_name;
    if (bank_account) updateData.bank_account = bank_account;
    if (account_holder) updateData.account_holder = account_holder;
    if (notes) updateData.notes = notes;

    const { data, error } = await postgrest
      .from('settlements')
      .update(updateData)
      .eq('id', settlement_id)
      .select()
      .single();

    if (error) {
      console.error('Settlement update error:', error);
      return NextResponse.json(
        { success: false, error: '정산 업데이트에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Settlements PUT error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
