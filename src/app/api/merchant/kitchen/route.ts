import { NextRequest, NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';

/**
 * GET /api/merchant/kitchen
 * 주방 주문 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const storeId = searchParams.get('store_id');
    const status = searchParams.get('status');

    if (!storeId) {
      return NextResponse.json(
        { success: false, error: 'store_id가 필요합니다.' },
        { status: 400 }
      );
    }

    const postgrest = createPostgrestClient();

    let query = postgrest
      .from('kitchen_orders')
      .select('*')
      .eq('store_id', storeId)
      .order('received_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    // 오늘 주문만 조회
    const today = new Date().toISOString().split('T')[0];
    query = query.gte('created_at', `${today}T00:00:00`);

    const { data, error } = await query;

    if (error) {
      console.error('Kitchen orders query error:', error);
      return NextResponse.json(
        { success: false, error: '주문 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Kitchen GET error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/merchant/kitchen
 * 주문 상태 변경
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, status } = body;

    if (!order_id || !status) {
      return NextResponse.json(
        { success: false, error: 'order_id와 status가 필요합니다.' },
        { status: 400 }
      );
    }

    const validStatuses = ['new', 'preparing', 'ready', 'served', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 상태입니다.' },
        { status: 400 }
      );
    }

    const postgrest = createPostgrestClient();

    // 상태에 따른 시간 필드 업데이트
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'preparing') {
      updateData.started_at = new Date().toISOString();
    } else if (status === 'ready') {
      updateData.ready_at = new Date().toISOString();
    } else if (status === 'served') {
      updateData.served_at = new Date().toISOString();
    }

    const { data, error } = await postgrest
      .from('kitchen_orders')
      .update(updateData)
      .eq('id', order_id)
      .select()
      .single();

    if (error) {
      console.error('Kitchen order update error:', error);
      return NextResponse.json(
        { success: false, error: '상태 변경에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 세션의 장바구니 아이템 상태도 업데이트
    if (status === 'preparing' && data.session_id) {
      await postgrest
        .from('cart_items')
        .update({ status: 'preparing' })
        .eq('session_id', data.session_id)
        .eq('status', 'confirmed');
    } else if (status === 'served' && data.session_id) {
      await postgrest
        .from('cart_items')
        .update({ status: 'served' })
        .eq('session_id', data.session_id)
        .in('status', ['confirmed', 'preparing']);
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Kitchen PUT error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
