import { NextRequest, NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';
import { randomBytes } from 'crypto';

/**
 * GET /api/tickets
 * 내 티켓 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const status = searchParams.get('status');
    const ticketId = searchParams.get('ticket_id');

    const postgrest = createPostgrestClient();

    // 단일 티켓 조회
    if (ticketId) {
      const { data: ticket, error } = await postgrest
        .from('tickets')
        .select(`
          *,
          events(id, title, poster_url, venue_name, venue_address, event_date),
          ticket_types(id, name, section)
        `)
        .eq('id', ticketId)
        .single();

      if (error || !ticket) {
        return NextResponse.json(
          { success: false, error: '티켓을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: ticket,
      });
    }

    // 사용자 티켓 목록
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'user_id가 필요합니다.' },
        { status: 400 }
      );
    }

    let query = postgrest
      .from('tickets')
      .select(`
        *,
        events(id, title, poster_url, venue_name, event_date),
        ticket_types(id, name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Tickets query error:', error);
      return NextResponse.json(
        { success: false, error: '티켓 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Tickets GET error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tickets
 * 티켓 구매
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      event_id,
      ticket_type_id,
      quantity,
      user_id,
      buyer_name,
      buyer_phone,
      buyer_email,
      payment_id,
    } = body;

    if (!event_id || !ticket_type_id || !quantity || !buyer_name || !buyer_phone) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const postgrest = createPostgrestClient();

    // 티켓 유형 확인
    const { data: ticketType, error: ttError } = await postgrest
      .from('ticket_types')
      .select('*')
      .eq('id', ticket_type_id)
      .single();

    if (ttError || !ticketType) {
      return NextResponse.json(
        { success: false, error: '티켓 유형을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 재고 확인
    const available = ticketType.total_quantity - ticketType.sold_quantity - ticketType.reserved_quantity;
    if (available < quantity) {
      return NextResponse.json(
        { success: false, error: '남은 티켓이 부족합니다.' },
        { status: 400 }
      );
    }

    // 수량 제한 확인
    if (quantity > ticketType.max_per_order) {
      return NextResponse.json(
        { success: false, error: `1회 최대 ${ticketType.max_per_order}매까지 구매 가능합니다.` },
        { status: 400 }
      );
    }

    // 티켓 생성
    const tickets = [];
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    for (let i = 0; i < quantity; i++) {
      const seq = String(ticketType.sold_quantity + i + 1).padStart(4, '0');
      const ticketNumber = `TKT-${today}-${seq}`;
      const qrCode = randomBytes(16).toString('hex').toUpperCase();

      tickets.push({
        event_id,
        ticket_type_id,
        user_id: user_id || null,
        buyer_name,
        buyer_phone,
        buyer_email,
        ticket_number: ticketNumber,
        qr_code: qrCode,
        price: ticketType.price,
        payment_id: payment_id || null,
        status: 'issued',
      });
    }

    const { data: createdTickets, error: createError } = await postgrest
      .from('tickets')
      .insert(tickets)
      .select();

    if (createError) {
      console.error('Tickets create error:', createError);
      return NextResponse.json(
        { success: false, error: '티켓 발권에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 거래 이벤트 기록
    const { data: event } = await postgrest
      .from('events')
      .select('merchant_id')
      .eq('id', event_id)
      .single();

    if (event) {
      await postgrest.from('transaction_events').insert({
        event_type: 'ticket_purchased',
        merchant_id: event.merchant_id,
        amount: ticketType.price * quantity,
        metadata: {
          event_id,
          ticket_type_id,
          quantity,
          ticket_ids: createdTickets.map((t: any) => t.id),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        tickets: createdTickets,
        total_amount: ticketType.price * quantity,
      },
    });
  } catch (error) {
    console.error('Tickets POST error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
