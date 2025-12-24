import { NextRequest, NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';

/**
 * POST /api/order/submit
 * 주문 확정 (장바구니 → 주방으로 전송)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, coupon_issue_id } = body;

    if (!session_id) {
      return NextResponse.json(
        { success: false, error: 'session_id가 필요합니다.' },
        { status: 400 }
      );
    }

    const postgrest = createPostgrestClient();

    // 세션 조회
    const { data: session, error: sessionError } = await postgrest
      .from('table_sessions')
      .select(`
        *,
        stores(id, name, merchant_id),
        store_tables(id, name)
      `)
      .eq('id', session_id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: '세션을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (session.status === 'paid' || session.status === 'closed') {
      return NextResponse.json(
        { success: false, error: '이미 결제가 완료된 세션입니다.' },
        { status: 400 }
      );
    }

    // 장바구니 아이템 조회
    const { data: cartItems, error: cartError } = await postgrest
      .from('cart_items')
      .select(`
        *,
        products(id, name, description, base_price)
      `)
      .eq('session_id', session_id)
      .eq('status', 'pending');

    if (cartError || !cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: '주문할 상품이 없습니다.' },
        { status: 400 }
      );
    }

    // 총액 계산
    let totalAmount = cartItems.reduce(
      (sum: number, item: any) => sum + item.quantity * item.unit_price,
      0
    );

    let discountAmount = 0;

    // 쿠폰 적용
    if (coupon_issue_id) {
      const { data: couponIssue } = await postgrest
        .from('coupon_issues')
        .select(`
          *,
          coupons(discount_type, discount_value, min_order_amount)
        `)
        .eq('id', coupon_issue_id)
        .eq('is_used', false)
        .single();

      if (couponIssue && couponIssue.coupons) {
        const coupon = couponIssue.coupons;

        // 최소 주문금액 확인
        if (!coupon.min_order_amount || totalAmount >= coupon.min_order_amount) {
          if (coupon.discount_type === 'percent') {
            discountAmount = Math.floor(totalAmount * (coupon.discount_value / 100));
          } else {
            discountAmount = coupon.discount_value;
          }

          // 할인액이 총액을 초과하지 않도록
          discountAmount = Math.min(discountAmount, totalAmount);
        }
      }
    }

    const finalAmount = totalAmount - discountAmount;

    // 주문 번호 생성
    const orderNumber = await getNextOrderNumber(postgrest, session.store_id);

    // 주방 주문 생성
    const kitchenItems = cartItems.map((item: any) => ({
      product_id: item.product_id,
      product_name: item.products?.name,
      quantity: item.quantity,
      options: item.options,
      special_request: item.special_request,
    }));

    const { data: kitchenOrder, error: kitchenError } = await postgrest
      .from('kitchen_orders')
      .insert({
        store_id: session.store_id,
        session_id: session_id,
        table_name: session.store_tables?.name || '테이블',
        order_number: orderNumber,
        items: kitchenItems,
        status: 'new',
      })
      .select()
      .single();

    if (kitchenError) {
      console.error('Kitchen order error:', kitchenError);
      return NextResponse.json(
        { success: false, error: '주방 주문 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 장바구니 아이템 상태 업데이트
    await postgrest
      .from('cart_items')
      .update({ status: 'confirmed' })
      .eq('session_id', session_id)
      .eq('status', 'pending');

    // 세션 업데이트
    await postgrest
      .from('table_sessions')
      .update({
        status: 'ordering',
        total_amount: totalAmount,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        applied_coupon_issue_id: coupon_issue_id || null,
        ordered_at: new Date().toISOString(),
      })
      .eq('id', session_id);

    // 거래 이벤트 기록
    await postgrest.from('transaction_events').insert({
      event_type: 'order_created',
      merchant_id: session.stores?.merchant_id,
      store_id: session.store_id,
      amount: finalAmount,
      discount_amount: discountAmount,
      metadata: {
        session_id,
        order_number: orderNumber,
        item_count: cartItems.length,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        order_number: orderNumber,
        kitchen_order_id: kitchenOrder.id,
        total_amount: totalAmount,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        items: kitchenItems,
      },
    });
  } catch (error) {
    console.error('Order submit error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

async function getNextOrderNumber(postgrest: any, storeId: string): Promise<number> {
  try {
    // RPC 호출 시도
    const { data } = await postgrest.rpc('get_next_order_number', {
      p_store_id: storeId,
    });

    if (data) return data;
  } catch (e) {
    // 폴백: 간단한 카운터
  }

  // 폴백: 오늘 주문 수 + 1
  const today = new Date().toISOString().split('T')[0];
  const { count } = await postgrest
    .from('kitchen_orders')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', storeId)
    .gte('created_at', `${today}T00:00:00`);

  return (count || 0) + 1;
}
