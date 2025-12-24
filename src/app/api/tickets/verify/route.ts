import { NextRequest, NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';

/**
 * POST /api/tickets/verify
 * 티켓 QR 검증 및 사용 처리
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { qr_code, event_id } = body;

    if (!qr_code) {
      return NextResponse.json(
        { success: false, error: 'QR 코드가 필요합니다.' },
        { status: 400 }
      );
    }

    const postgrest = createPostgrestClient();

    // 티켓 조회
    const { data: ticket, error: ticketError } = await postgrest
      .from('tickets')
      .select(`
        *,
        events(id, title, event_date, venue_name, status),
        ticket_types(id, name)
      `)
      .eq('qr_code', qr_code)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({
        success: false,
        error: '유효하지 않은 티켓입니다.',
        verification: {
          valid: false,
          reason: 'TICKET_NOT_FOUND',
        },
      });
    }

    // 이벤트 ID 확인 (특정 이벤트 검증 시)
    if (event_id && ticket.event_id !== event_id) {
      return NextResponse.json({
        success: false,
        error: '이 이벤트의 티켓이 아닙니다.',
        verification: {
          valid: false,
          reason: 'WRONG_EVENT',
        },
      });
    }

    // 티켓 상태 확인
    if (ticket.status === 'used') {
      return NextResponse.json({
        success: false,
        error: '이미 사용된 티켓입니다.',
        verification: {
          valid: false,
          reason: 'ALREADY_USED',
          used_at: ticket.used_at,
        },
        ticket: {
          ticket_number: ticket.ticket_number,
          buyer_name: ticket.buyer_name,
          event_title: ticket.events?.title,
          ticket_type: ticket.ticket_types?.name,
        },
      });
    }

    if (ticket.status === 'cancelled' || ticket.status === 'refunded') {
      return NextResponse.json({
        success: false,
        error: '취소된 티켓입니다.',
        verification: {
          valid: false,
          reason: 'CANCELLED',
        },
      });
    }

    // 이벤트 날짜 확인
    const eventDate = new Date(ticket.events.event_date);
    const today = new Date();
    const diffDays = Math.floor((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays > 1) {
      return NextResponse.json({
        success: false,
        error: '아직 입장 가능한 날짜가 아닙니다.',
        verification: {
          valid: false,
          reason: 'NOT_YET',
          event_date: ticket.events.event_date,
        },
        ticket: {
          ticket_number: ticket.ticket_number,
          buyer_name: ticket.buyer_name,
          event_title: ticket.events?.title,
          ticket_type: ticket.ticket_types?.name,
        },
      });
    }

    // 티켓 사용 처리
    const { error: updateError } = await postgrest
      .from('tickets')
      .update({
        status: 'used',
        used_at: new Date().toISOString(),
      })
      .eq('id', ticket.id);

    if (updateError) {
      console.error('Ticket update error:', updateError);
      return NextResponse.json(
        { success: false, error: '티켓 처리에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      verification: {
        valid: true,
        reason: 'OK',
      },
      ticket: {
        id: ticket.id,
        ticket_number: ticket.ticket_number,
        buyer_name: ticket.buyer_name,
        buyer_phone: ticket.buyer_phone,
        event_title: ticket.events?.title,
        ticket_type: ticket.ticket_types?.name,
        seat_section: ticket.seat_section,
        seat_row: ticket.seat_row,
        seat_number: ticket.seat_number,
        used_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Ticket verify error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
