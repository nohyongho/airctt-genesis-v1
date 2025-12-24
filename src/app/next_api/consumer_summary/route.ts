
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams } from '@/lib/api-utils';

// GET - return coupon count and points sum for a user
export const GET = requestMiddleware(async (request) => {
  const { id } = parseQueryParams(request);

  if (!id) {
    return createErrorResponse({
      errorMessage: 'User ID is required',
      status: 400,
    });
  }

  const couponsCrud = new CrudOperations('coupons');
  const pointsCrud = new CrudOperations('points');

  // Fetch available coupons for user
  const coupons = await couponsCrud.findMany(
    { user_id: id, status: 'available' },
    { limit: 1000 }
  );

  // Fetch points records for user and sum amounts
  const points = await pointsCrud.findMany(
    { user_id: id },
    { limit: 1000 }
  );

  const couponCount = Array.isArray(coupons) ? coupons.length : 0;
  const pointsSum = Array.isArray(points)
    ? points.reduce((sum: number, p: any) => {
        const val = Number(p?.amount ?? p?.points ?? 0);
        return sum + (isNaN(val) ? 0 : val);
      }, 0)
    : 0;

  // Optional: approximate monthly benefits count
  const benefitsCount = couponCount > 0 ? Math.min(couponCount, 10) : 3;

  return createSuccessResponse({
    couponCount,
    pointsSum,
    benefitsCount,
  });
});
