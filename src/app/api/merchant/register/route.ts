import { NextRequest, NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';
import { mapCategoryToTemplate } from '@/lib/slug-service';

/**
 * POST /api/merchant/register
 * 가맹점 등록 API
 * - 가맹점 생성 → DB 트리거로 Store/Table 자동 생성
 * - 업종 기반 쿠폰 템플릿 추천
 */

interface MerchantRegistrationRequest {
  businessName: string;
  ownerName: string;
  phone: string;
  email?: string;
  address?: string;
  description?: string;
  category?: string;
  slug?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: MerchantRegistrationRequest = await request.json();

    // 필수 필드 검증
    if (!body.businessName) {
      return NextResponse.json(
        { success: false, error: '상호명은 필수입니다.' },
        { status: 400 }
      );
    }

    if (!body.ownerName) {
      return NextResponse.json(
        { success: false, error: '대표자명은 필수입니다.' },
        { status: 400 }
      );
    }

    if (!body.phone) {
      return NextResponse.json(
        { success: false, error: '연락처는 필수입니다.' },
        { status: 400 }
      );
    }

    const postgrest = createPostgrestClient();

    // 가맹점 등록 (slug는 DB 트리거로 자동 생성)
    const { data: merchant, error: merchantError } = await postgrest
      .from('merchants')
      .insert({
        business_name: body.businessName,
        owner_name: body.ownerName,
        phone: body.phone,
        email: body.email || null,
        address: body.address || null,
        description: body.description || null,
        slug: body.slug || null,
        approval_status: 'pending',
      })
      .select('id, business_name, slug, created_at')
      .single();

    if (merchantError) {
      console.error('Merchant registration error:', merchantError);

      if (merchantError.message?.includes('duplicate') || merchantError.message?.includes('unique')) {
        return NextResponse.json(
          { success: false, error: '이미 사용 중인 URL입니다. 다른 URL을 선택해주세요.' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { success: false, error: '가맹점 등록 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // 자동 생성된 Store 정보 조회
    const { data: store } = await postgrest
      .from('stores')
      .select('id, name, slug')
      .eq('merchant_id', merchant.id)
      .limit(1)
      .single();

    // 업종 기반 쿠폰 템플릿 추천
    const templateCategory = body.category || 'restaurant';

    const { data: templates } = await postgrest
      .from('coupon_templates')
      .select('id, title, description, discount_type, discount_value, min_order_amount, valid_days')
      .eq('category', templateCategory)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    // 프론트엔드 형식에 맞게 응답 (camelCase)
    const recommendedTemplates = (templates || []).map((t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      discountType: t.discount_type,
      discountValue: Number(t.discount_value),
      minOrderAmount: Number(t.min_order_amount),
      validDays: t.valid_days,
      suggested: true,
    }));

    return NextResponse.json({
      success: true,
      merchant: {
        id: merchant.id,
        slug: merchant.slug,
        name: merchant.business_name,
        type: templateCategory,
      },
      store: store ? {
        id: store.id,
        name: store.name,
      } : null,
      recommendedTemplates,
      nextSteps: [
        '매장 정보를 꼼꼼히 확인해주세요',
        '추천 쿠폰 템플릿으로 첫 쿠폰을 만들어보세요',
        '메뉴와 테이블을 설정하면 QR 주문이 활성화됩니다',
      ],
      message: '가맹점이 성공적으로 등록되었습니다.',
    });
  } catch (error) {
    console.error('Merchant registration API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/merchant/register
 * 쿠폰 템플릿 카테고리별 조회
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    const postgrest = createPostgrestClient();

    let query = postgrest
      .from('coupon_templates')
      .select('id, category, title, description, discount_type, discount_value, min_order_amount, valid_days, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data: templates, error } = await query;

    if (error) {
      console.error('Template fetch error:', error);
      return NextResponse.json(
        { success: false, error: '템플릿 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: templates || [],
    });
  } catch (error) {
    console.error('Template API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
