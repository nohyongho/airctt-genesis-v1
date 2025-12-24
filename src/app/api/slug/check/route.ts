import { NextRequest, NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';
import { generateSlug } from '@/lib/slug-service';

/**
 * GET /api/slug/check
 * slug 중복 체크 API
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug');
    const type = searchParams.get('type') || 'merchant';

    if (!slug) {
      return NextResponse.json(
        { available: false, error: 'slug 파라미터가 필요합니다.' },
        { status: 400 }
      );
    }

    const postgrest = createPostgrestClient();

    // 테이블 선택
    const table = type === 'store' ? 'stores' : 'merchants';

    // 중복 체크
    const { data, error } = await postgrest
      .from(table)
      .select('id, slug')
      .eq('slug', slug)
      .limit(1);

    if (error) {
      console.error('Slug check error:', error);
      return NextResponse.json(
        { available: false, error: '확인 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    const isAvailable = !data || data.length === 0;

    // 사용 불가능하면 대안 제안
    let suggestion: string | undefined;
    if (!isAvailable) {
      // 숫자 suffix 추가해서 대안 생성
      let counter = 1;
      let suggestedSlug = `${slug}-${counter}`;

      while (counter < 100) {
        const { data: checkData } = await postgrest
          .from(table)
          .select('id')
          .eq('slug', suggestedSlug)
          .limit(1);

        if (!checkData || checkData.length === 0) {
          suggestion = suggestedSlug;
          break;
        }

        counter++;
        suggestedSlug = `${slug}-${counter}`;
      }
    }

    return NextResponse.json({
      available: isAvailable,
      slug,
      suggestion,
    });
  } catch (error) {
    console.error('Slug check API error:', error);
    return NextResponse.json(
      { available: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
