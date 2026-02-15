import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/coupons/claim
 * 소비자가 쿠폰 받기/발급
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { couponId, userId } = body;

    if (!couponId) {
      return NextResponse.json(
        { error: '쿠폰 ID가 필요합니다' },
        { status: 400 }
      );
    }

    // TODO: 실제 DB 연동 시
    // 1. 쿠폰 정보 조회
    // 2. 수량 확인
    // 3. user_coupons 테이블에 저장
    // 4. totalQuantity - 1

    // 임시 응답 (데모용)
    const claimedCoupon = {
      id: `claimed_${Date.now()}`,
      couponId: couponId,
      userId: userId || 'demo_user',
      claimedAt: new Date().toISOString(),
      status: 'available',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30일 후
    };

    return NextResponse.json({
      success: true,
      message: '쿠폰을 받았습니다! 💜',
      data: claimedCoupon,
    });
  } catch (error) {
    console.error('쿠폰 발급 오류:', error);
    return NextResponse.json(
      { error: '쿠폰 발급 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
