import { NextRequest, NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';

/**
 * GET /api/stores/[storeId]/products
 * 매장 상품 및 카테고리 조회 (테이블 오더용)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;

    if (!storeId) {
      return NextResponse.json(
        { success: false, error: 'store_id가 필요합니다.' },
        { status: 400 }
      );
    }

    const postgrest = createPostgrestClient();

    // 매장 정보 조회
    const { data: store, error: storeError } = await postgrest
      .from('stores')
      .select('id, name, merchant_id')
      .eq('id', storeId)
      .single();

    if (storeError || !store) {
      return NextResponse.json(
        { success: false, error: '매장을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 카테고리 조회
    const { data: categories } = await postgrest
      .from('product_categories')
      .select('id, name, display_order')
      .eq('merchant_id', store.merchant_id)
      .order('display_order', { ascending: true });

    // 상품 조회
    const { data: products } = await postgrest
      .from('products')
      .select(`
        id,
        name,
        description,
        base_price,
        image_url,
        category_id,
        is_active,
        display_order
      `)
      .eq('merchant_id', store.merchant_id)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    return NextResponse.json({
      success: true,
      data: {
        store,
        categories: categories || [],
        products: products || [],
      },
    });
  } catch (error) {
    console.error('Store products error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
