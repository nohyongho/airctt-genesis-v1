import { NextRequest, NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';

/**
 * GET /api/admin/approvals
 * 가맹점 승인 대기열 조회
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'pending';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const postgrest = createPostgrestClient();

    // 승인 대기 가맹점 조회
    const { data: merchants, error, count } = await postgrest
      .from('merchants')
      .select(`
        id,
        name,
        type,
        slug,
        owner_name,
        phone,
        email,
        address,
        description,
        approval_status,
        created_at,
        stores(id, name, address)
      `, { count: 'exact' })
      .eq('approval_status', status)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Fetch error:', error);
      return NextResponse.json(
        { success: false, error: '조회 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // 상태별 카운트
    const { data: statusCounts } = await postgrest
      .from('merchants')
      .select('approval_status')
      .in('approval_status', ['pending', 'reviewing', 'approved', 'rejected', 'suspended']);

    const counts = {
      pending: 0,
      reviewing: 0,
      approved: 0,
      rejected: 0,
      suspended: 0,
    };

    statusCounts?.forEach((m: any) => {
      if (m.approval_status && counts.hasOwnProperty(m.approval_status)) {
        counts[m.approval_status as keyof typeof counts]++;
      }
    });

    return NextResponse.json({
      success: true,
      data: merchants || [],
      meta: {
        total: count || 0,
        limit,
        offset,
        status,
        counts,
      },
    });
  } catch (error) {
    console.error('Approvals API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/approvals
 * 가맹점 승인/반려 처리
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { merchant_id, action, reason, internal_note, reviewed_by } = body;

    if (!merchant_id || !action) {
      return NextResponse.json(
        { success: false, error: 'merchant_id와 action이 필요합니다.' },
        { status: 400 }
      );
    }

    const validActions = ['approve', 'reject', 'suspend', 'review'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 action입니다.' },
        { status: 400 }
      );
    }

    const postgrest = createPostgrestClient();

    // 현재 상태 조회
    const { data: merchant, error: fetchError } = await postgrest
      .from('merchants')
      .select('id, name, approval_status')
      .eq('id', merchant_id)
      .single();

    if (fetchError || !merchant) {
      return NextResponse.json(
        { success: false, error: '가맹점을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const previousStatus = merchant.approval_status;
    let newStatus: string;

    switch (action) {
      case 'approve':
        newStatus = 'approved';
        break;
      case 'reject':
        newStatus = 'rejected';
        break;
      case 'suspend':
        newStatus = 'suspended';
        break;
      case 'review':
        newStatus = 'reviewing';
        break;
      default:
        newStatus = 'pending';
    }

    // 상태 업데이트
    const { error: updateError } = await postgrest
      .from('merchants')
      .update({ approval_status: newStatus })
      .eq('id', merchant_id);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { success: false, error: '상태 업데이트에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 승인 이력 기록
    await postgrest.from('merchant_approvals').insert({
      merchant_id,
      status: newStatus,
      previous_status: previousStatus,
      reviewed_by: reviewed_by || null,
      reviewed_at: new Date().toISOString(),
      reason: reason || null,
      internal_note: internal_note || null,
    });

    // 감사 로그 기록
    await postgrest.from('audit_logs').insert({
      actor_id: reviewed_by || null,
      actor_type: 'admin',
      target_type: 'merchant',
      target_id: merchant_id,
      action: action,
      action_detail: `가맹점 ${action} 처리: ${merchant.name}`,
      old_data: { approval_status: previousStatus },
      new_data: { approval_status: newStatus, reason },
    });

    return NextResponse.json({
      success: true,
      data: {
        merchant_id,
        previous_status: previousStatus,
        new_status: newStatus,
        action,
      },
    });
  } catch (error) {
    console.error('Approval action error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
