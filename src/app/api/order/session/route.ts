import { NextRequest, NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';

/**
 * POST /api/order/session
 * 테이블 세션 생성 (QR 스캔 시)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { store_id, table_id, user_id, guest_phone, party_size } = body;

    if (!store_id || !table_id) {
      return NextResponse.json(
        { success: false, error: 'store_id와 table_id가 필요합니다.' },
        { status: 400 }
      );
    }

    const postgrest = createPostgrestClient();

    // 기존 활성 세션 확인
    const { data: existingSession } = await postgrest
      .from('table_sessions')
      .select('id, session_code, status')
      .eq('table_id', table_id)
      .eq('status', 'active')
      .single();

    if (existingSession) {
      // 기존 세션 반환
      return NextResponse.json({
        success: true,
        data: {
          session_id: existingSession.id,
          session_code: existingSession.session_code,
          is_new: false,
        },
      });
    }

    // 세션 코드 생성
    const sessionCode = generateSessionCode();

    // 새 세션 생성
    const { data: newSession, error } = await postgrest
      .from('table_sessions')
      .insert({
        store_id,
        table_id,
        session_code: sessionCode,
        user_id: user_id || null,
        guest_phone: guest_phone || null,
        party_size: party_size || 1,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('Session create error:', error);
      return NextResponse.json(
        { success: false, error: '세션 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    // QR 스캔 로그 기록
    await postgrest.from('qr_scan_logs').insert({
      table_id,
      store_id,
      session_id: newSession.id,
      user_id: user_id || null,
    });

    return NextResponse.json({
      success: true,
      data: {
        session_id: newSession.id,
        session_code: newSession.session_code,
        is_new: true,
      },
    });
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/order/session?code=XXXXXXXX
 * 세션 정보 조회
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const sessionId = searchParams.get('session_id');

    if (!code && !sessionId) {
      return NextResponse.json(
        { success: false, error: 'code 또는 session_id가 필요합니다.' },
        { status: 400 }
      );
    }

    const postgrest = createPostgrestClient();

    let query = postgrest
      .from('table_sessions')
      .select(`
        *,
        stores(id, name, address, phone),
        store_tables(id, name, zone),
        cart_items(
          id,
          product_id,
          quantity,
          unit_price,
          options,
          special_request,
          status,
          products(id, name, description, base_price)
        )
      `);

    if (code) {
      query = query.eq('session_code', code);
    } else {
      query = query.eq('id', sessionId);
    }

    const { data: session, error } = await query.single();

    if (error || !session) {
      return NextResponse.json(
        { success: false, error: '세션을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('Session GET error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

function generateSessionCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
