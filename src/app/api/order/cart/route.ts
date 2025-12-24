import { NextRequest, NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';

/**
 * POST /api/order/cart
 * 장바구니에 아이템 추가
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, product_id, quantity, options, special_request } = body;

    if (!session_id || !product_id) {
      return NextResponse.json(
        { success: false, error: 'session_id와 product_id가 필요합니다.' },
        { status: 400 }
      );
    }

    const postgrest = createPostgrestClient();

    // 세션 확인
    const { data: session, error: sessionError } = await postgrest
      .from('table_sessions')
      .select('id, status')
      .eq('id', session_id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 세션입니다.' },
        { status: 404 }
      );
    }

    if (session.status === 'paid' || session.status === 'closed') {
      return NextResponse.json(
        { success: false, error: '이미 결제가 완료된 세션입니다.' },
        { status: 400 }
      );
    }

    // 상품 가격 조회
    const { data: product, error: productError } = await postgrest
      .from('products')
      .select('id, base_price, is_active')
      .eq('id', product_id)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { success: false, error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (!product.is_active) {
      return NextResponse.json(
        { success: false, error: '현재 판매 중지된 상품입니다.' },
        { status: 400 }
      );
    }

    // 장바구니에 추가
    const { data: cartItem, error: insertError } = await postgrest
      .from('cart_items')
      .insert({
        session_id,
        product_id,
        quantity: quantity || 1,
        unit_price: product.base_price,
        options: options || null,
        special_request: special_request || null,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Cart insert error:', insertError);
      return NextResponse.json(
        { success: false, error: '장바구니 추가에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 업데이트된 장바구니 조회
    const { data: cartItems } = await postgrest
      .from('cart_items')
      .select(`
        id,
        product_id,
        quantity,
        unit_price,
        options,
        special_request,
        status,
        products(id, name, description)
      `)
      .eq('session_id', session_id)
      .neq('status', 'cancelled');

    // 총액 계산
    const total = cartItems?.reduce(
      (sum: number, item: any) => sum + item.quantity * item.unit_price,
      0
    ) || 0;

    return NextResponse.json({
      success: true,
      data: {
        added_item: cartItem,
        cart_items: cartItems,
        total_amount: total,
      },
    });
  } catch (error) {
    console.error('Cart POST error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/order/cart
 * 장바구니 아이템 수량 변경
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { cart_item_id, quantity } = body;

    if (!cart_item_id || quantity === undefined) {
      return NextResponse.json(
        { success: false, error: 'cart_item_id와 quantity가 필요합니다.' },
        { status: 400 }
      );
    }

    const postgrest = createPostgrestClient();

    if (quantity <= 0) {
      // 수량 0 이하면 삭제
      const { error } = await postgrest
        .from('cart_items')
        .delete()
        .eq('id', cart_item_id);

      if (error) {
        return NextResponse.json(
          { success: false, error: '삭제에 실패했습니다.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: { deleted: true },
      });
    }

    // 수량 업데이트
    const { data, error } = await postgrest
      .from('cart_items')
      .update({ quantity })
      .eq('id', cart_item_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: '수량 변경에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Cart PUT error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/order/cart?cart_item_id=xxx
 * 장바구니 아이템 삭제
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cartItemId = searchParams.get('cart_item_id');

    if (!cartItemId) {
      return NextResponse.json(
        { success: false, error: 'cart_item_id가 필요합니다.' },
        { status: 400 }
      );
    }

    const postgrest = createPostgrestClient();

    const { error } = await postgrest
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (error) {
      return NextResponse.json(
        { success: false, error: '삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { deleted: true },
    });
  } catch (error) {
    console.error('Cart DELETE error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
