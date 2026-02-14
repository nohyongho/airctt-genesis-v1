import { NextResponse } from 'next/server';

/**
 * ENV 디버그 전용 API — 값은 노출하지 않고 설정 여부만 확인
 * GET /api/debug/env-check
 */
export async function GET() {
  const envVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'POSTGREST_URL',
    'POSTGREST_API_KEY',
    'POSTGREST_SCHEMA',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
  ];

  const result: Record<string, string> = {};

  for (const name of envVars) {
    const val = process.env[name];
    if (!val) {
      result[name] = '❌ NOT SET';
    } else {
      // 보안: 값은 앞 8글자 + 길이만 노출
      const preview = val.substring(0, 8) + '***';
      result[name] = `✅ SET (${val.length}chars, starts: ${preview})`;
    }
  }

  // Supabase 연결 테스트
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    || process.env.POSTGREST_URL
    || process.env.SUPABASE_URL
    || '';
  const supaKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || process.env.POSTGREST_API_KEY
    || process.env.SUPABASE_ANON_KEY
    || '';

  let connectionTest = 'SKIPPED';
  if (supaUrl && supaKey) {
    try {
      const testUrl = supaUrl.endsWith('/rest/v1')
        ? `${supaUrl}/coupons?select=id&limit=1`
        : `${supaUrl}/rest/v1/coupons?select=id&limit=1`;

      const res = await fetch(testUrl, {
        headers: {
          'apikey': supaKey,
          'Authorization': `Bearer ${supaKey}`,
          'Content-Type': 'application/json',
        },
      });
      const body = await res.text();
      connectionTest = `HTTP ${res.status} — ${body.substring(0, 200)}`;
    } catch (err: any) {
      connectionTest = `FAIL: ${err.message}`;
    }
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    envVars: result,
    resolvedUrl: supaUrl ? `${supaUrl.substring(0, 30)}***` : 'EMPTY',
    resolvedKeyLength: supaKey.length,
    connectionTest,
  });
}
