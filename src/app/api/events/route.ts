import { NextRequest, NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';

/**
 * GET /api/events
 * 공연/이벤트 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'on_sale';
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const postgrest = createPostgrestClient();

    let query = postgrest
      .from('events')
      .select(`
        *,
        merchants(id, business_name),
        ticket_types(id, name, price, total_quantity, sold_quantity)
      `)
      .order('event_date', { ascending: true })
      .range(offset, offset + limit - 1);

    // 상태 필터
    if (status === 'upcoming') {
      query = query.in('status', ['on_sale', 'sold_out']).gte('event_date', new Date().toISOString());
    } else if (status) {
      query = query.eq('status', status);
    }

    // 카테고리 필터
    if (category) {
      query = query.eq('category', category);
    }

    // 추천 필터
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Events query error:', error);
      return NextResponse.json(
        { success: false, error: '이벤트 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        offset,
        limit,
        total: count,
      },
    });
  } catch (error) {
    console.error('Events GET error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events
 * 공연/이벤트 등록
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      merchant_id,
      title,
      subtitle,
      description,
      category,
      poster_url,
      venue_name,
      venue_address,
      event_date,
      event_end_date,
      ticket_types,
    } = body;

    if (!merchant_id || !title || !venue_name || !event_date) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const postgrest = createPostgrestClient();

    // 이벤트 생성
    const { data: event, error: eventError } = await postgrest
      .from('events')
      .insert({
        merchant_id,
        title,
        subtitle,
        description,
        category: category || 'other',
        poster_url,
        venue_name,
        venue_address,
        event_date,
        event_end_date,
        status: 'draft',
      })
      .select()
      .single();

    if (eventError) {
      console.error('Event create error:', eventError);
      return NextResponse.json(
        { success: false, error: '이벤트 등록에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 티켓 유형 생성
    if (ticket_types && ticket_types.length > 0) {
      const ticketTypeData = ticket_types.map((tt: any, index: number) => ({
        event_id: event.id,
        name: tt.name,
        description: tt.description,
        price: tt.price,
        original_price: tt.original_price,
        total_quantity: tt.total_quantity,
        is_numbered_seat: tt.is_numbered_seat || false,
        display_order: index,
      }));

      const { error: ttError } = await postgrest
        .from('ticket_types')
        .insert(ticketTypeData);

      if (ttError) {
        console.error('Ticket types create error:', ttError);
      }
    }

    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Events POST error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
