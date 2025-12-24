import { NextRequest, NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';

/**
 * POST /api/coupons/share
 * 쿠폰 공유 딥링크 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { coupon_id, utm_source, utm_medium, utm_campaign } = body;

    if (!coupon_id) {
      return NextResponse.json(
        { success: false, error: 'coupon_id가 필요합니다.' },
        { status: 400 }
      );
    }

    const postgrest = createPostgrestClient();

    // 쿠폰 존재 확인
    const { data: coupon, error: couponError } = await postgrest
      .from('coupons')
      .select('id, title, merchant_id, merchants(slug)')
      .eq('id', coupon_id)
      .single();

    if (couponError || !coupon) {
      return NextResponse.json(
        { success: false, error: '쿠폰을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 고유 숏코드 생성
    const shortCode = generateShortCode();

    // 딥링크 저장
    const { data: shareLink, error: insertError } = await postgrest
      .from('coupon_share_links')
      .insert({
        coupon_id,
        short_code: shortCode,
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30일 후 만료
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { success: false, error: '공유 링크 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ctt.kr';
    const shareUrl = `${baseUrl}/c/${shortCode}`;

    // 소셜 공유용 메타 정보
    const merchantSlug = (coupon as any).merchants?.slug || 'store';
    const shareData = {
      url: shareUrl,
      shortCode,
      title: coupon.title,
      description: `${coupon.title} - 지금 바로 받으세요!`,
      // 카카오톡 공유용
      kakao: {
        templateId: 'coupon_share',
        templateArgs: {
          title: coupon.title,
          link: shareUrl,
        },
      },
      // 일반 공유용 텍스트
      text: `🎫 ${coupon.title}\n\n지금 바로 쿠폰을 받으세요!\n${shareUrl}`,
    };

    return NextResponse.json({
      success: true,
      data: {
        share_link_id: shareLink.id,
        short_code: shortCode,
        url: shareUrl,
        share_data: shareData,
        expires_at: shareLink.expires_at,
      },
    });
  } catch (error) {
    console.error('Share API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/coupons/share?code=XXXXX
 * 숏코드로 쿠폰 정보 조회 + 클릭 카운트 증가
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'code가 필요합니다.' },
        { status: 400 }
      );
    }

    const postgrest = createPostgrestClient();

    // 공유 링크 조회
    const { data: shareLink, error: linkError } = await postgrest
      .from('coupon_share_links')
      .select(`
        *,
        coupons(
          id,
          title,
          description,
          discount_type,
          discount_value,
          valid_from,
          valid_to,
          is_active,
          merchants(id, name, slug),
          stores(id, name, address)
        )
      `)
      .eq('short_code', code)
      .single();

    if (linkError || !shareLink) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 링크입니다.' },
        { status: 404 }
      );
    }

    // 만료 체크
    if (shareLink.expires_at && new Date(shareLink.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: '만료된 링크입니다.' },
        { status: 410 }
      );
    }

    // 클릭 카운트 증가
    await postgrest
      .from('coupon_share_links')
      .update({ click_count: (shareLink.click_count || 0) + 1 })
      .eq('id', shareLink.id);

    const coupon = shareLink.coupons;

    return NextResponse.json({
      success: true,
      data: {
        coupon: {
          id: coupon.id,
          title: coupon.title,
          description: coupon.description,
          discount_type: coupon.discount_type,
          discount_value: coupon.discount_value,
          valid_from: coupon.valid_from,
          valid_to: coupon.valid_to,
          is_active: coupon.is_active,
        },
        merchant: coupon.merchants,
        store: coupon.stores,
        share_stats: {
          click_count: (shareLink.click_count || 0) + 1,
          issue_count: shareLink.issue_count || 0,
        },
        utm: {
          source: shareLink.utm_source,
          medium: shareLink.utm_medium,
          campaign: shareLink.utm_campaign,
        },
      },
    });
  } catch (error) {
    console.error('Share GET API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 6자리 랜덤 숏코드 생성
 */
function generateShortCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
