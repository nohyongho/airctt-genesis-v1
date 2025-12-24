import { NextRequest, NextResponse } from 'next/server';
import { createPostgrestClient } from '@/lib/postgrest';

/**
 * GET /api/merchant/stats
 * 가맹점 통계 조회 API
 *
 * Query Parameters:
 * - merchant_id: 가맹점 ID (필수)
 * - period: 기간 ('today', 'week', 'month', 'all') (기본값: 'week')
 * - store_id: 특정 매장 필터 (선택)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const merchantId = searchParams.get('merchant_id');
    const period = searchParams.get('period') || 'week';
    const storeId = searchParams.get('store_id');

    if (!merchantId) {
      return NextResponse.json(
        { success: false, error: 'merchant_id가 필요합니다.' },
        { status: 400 }
      );
    }

    const postgrest = createPostgrestClient();

    // 기간 계산
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // 전체
    }

    // 1. 일일 통계 조회
    let dailyStatsQuery = postgrest
      .from('merchant_daily_stats')
      .select('*')
      .eq('merchant_id', merchantId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (storeId) {
      dailyStatsQuery = dailyStatsQuery.eq('store_id', storeId);
    }

    const { data: dailyStats, error: dailyError } = await dailyStatsQuery;

    // 2. 쿠폰별 통계 조회
    const { data: couponStats, error: couponError } = await postgrest
      .from('coupon_stats')
      .select(`
        *,
        coupons(id, title, discount_type, discount_value)
      `)
      .in(
        'coupon_id',
        (
          await postgrest
            .from('coupons')
            .select('id')
            .eq('merchant_id', merchantId)
        ).data?.map((c: any) => c.id) || []
      )
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    // 3. 집계 계산
    const aggregated = {
      totalIssued: 0,
      totalUsed: 0,
      totalExpired: 0,
      totalViews: 0,
      totalClicks: 0,
      totalOrders: 0,
      totalRevenue: 0,
      totalDiscount: 0,
      avgConversionRate: 0,
      uniqueVisitors: 0,
      newCustomers: 0,
    };

    if (dailyStats && dailyStats.length > 0) {
      dailyStats.forEach((stat: any) => {
        aggregated.totalIssued += stat.coupons_issued || 0;
        aggregated.totalUsed += stat.coupons_used || 0;
        aggregated.totalExpired += stat.coupons_expired || 0;
        aggregated.totalOrders += stat.total_orders || 0;
        aggregated.totalRevenue += parseFloat(stat.total_revenue) || 0;
        aggregated.totalDiscount += parseFloat(stat.total_discount) || 0;
        aggregated.uniqueVisitors += stat.unique_visitors || 0;
        aggregated.newCustomers += stat.new_customers || 0;
      });
    }

    if (couponStats && couponStats.length > 0) {
      let totalConversion = 0;
      let conversionCount = 0;

      couponStats.forEach((stat: any) => {
        aggregated.totalViews += stat.view_count || 0;
        aggregated.totalClicks += stat.click_count || 0;

        if (stat.conversion_rate > 0) {
          totalConversion += parseFloat(stat.conversion_rate);
          conversionCount++;
        }
      });

      aggregated.avgConversionRate =
        conversionCount > 0
          ? Math.round((totalConversion / conversionCount) * 100) / 100
          : 0;
    }

    // 4. 기간별 전환율 계산
    if (aggregated.totalIssued > 0) {
      aggregated.avgConversionRate =
        Math.round((aggregated.totalUsed / aggregated.totalIssued) * 10000) / 100;
    }

    // 5. 일별 트렌드 데이터
    const dailyTrend = dailyStats?.reduce((acc: any, stat: any) => {
      const date = stat.date;
      if (!acc[date]) {
        acc[date] = {
          date,
          issued: 0,
          used: 0,
          orders: 0,
          revenue: 0,
        };
      }
      acc[date].issued += stat.coupons_issued || 0;
      acc[date].used += stat.coupons_used || 0;
      acc[date].orders += stat.total_orders || 0;
      acc[date].revenue += parseFloat(stat.total_revenue) || 0;
      return acc;
    }, {});

    // 6. 쿠폰별 성과
    const couponPerformance = couponStats?.reduce((acc: any, stat: any) => {
      const couponId = stat.coupon_id;
      if (!acc[couponId]) {
        acc[couponId] = {
          coupon_id: couponId,
          title: stat.coupons?.title || '알 수 없음',
          discount_type: stat.coupons?.discount_type,
          discount_value: stat.coupons?.discount_value,
          issued: 0,
          used: 0,
          views: 0,
          clicks: 0,
          conversion_rate: 0,
        };
      }
      acc[couponId].issued += stat.issued_count || 0;
      acc[couponId].used += stat.used_count || 0;
      acc[couponId].views += stat.view_count || 0;
      acc[couponId].clicks += stat.click_count || 0;
      return acc;
    }, {});

    // 전환율 계산
    Object.values(couponPerformance || {}).forEach((coupon: any) => {
      if (coupon.issued > 0) {
        coupon.conversion_rate =
          Math.round((coupon.used / coupon.issued) * 10000) / 100;
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: aggregated,
        dailyTrend: Object.values(dailyTrend || {}).sort(
          (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
        ),
        couponPerformance: Object.values(couponPerformance || {}).sort(
          (a: any, b: any) => b.used - a.used
        ),
      },
      meta: {
        merchant_id: merchantId,
        period,
        start_date: startDate.toISOString().split('T')[0],
        end_date: now.toISOString().split('T')[0],
      },
    });
  } catch (error) {
    console.error('Merchant stats API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
