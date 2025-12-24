
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    return createSuccessResponse({
      message: 'Stores API endpoint',
      params: { category, search, lat, lng },
      note: 'This is a placeholder. Actual implementation will use CTT V2 schema with PostgreSQL/PostgREST',
    });
  } catch (error) {
    return createErrorResponse({
      errorMessage: 'Failed to fetch stores',
      status: 500,
    });
  }
}
