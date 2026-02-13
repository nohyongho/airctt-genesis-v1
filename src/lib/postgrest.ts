import { PostgrestClient } from "@supabase/postgrest-js";

const SUPABASE_URL = process.env.POSTGREST_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const POSTGREST_SCHEMA = process.env.POSTGREST_SCHEMA || "public";
const SUPABASE_ANON_KEY = process.env.POSTGREST_API_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Supabase REST API 엔드포인트: https://xxx.supabase.co/rest/v1
const POSTGREST_URL = SUPABASE_URL.endsWith("/rest/v1")
  ? SUPABASE_URL
  : `${SUPABASE_URL}/rest/v1`;

export function createPostgrestClient(token?: string) {
  const client = new PostgrestClient(POSTGREST_URL, {
    schema: POSTGREST_SCHEMA,
    fetch: (...args) => {
      let [url, options] = args;

      if (url instanceof URL || typeof url === "string") {
        const urlObj = url instanceof URL ? url : new URL(url);
        const columns = urlObj.searchParams.get("columns");

        if (columns && columns.includes('"')) {
          const fixedColumns = columns.replace(/"/g, "");
          urlObj.searchParams.set("columns", fixedColumns);
          url = urlObj.toString();
        }
      }

      return fetch(url, {
        ...options,
      } as RequestInit);
    },
  });

  client.headers.set("Content-Type", "application/json");

  // ★ Supabase 표준 헤더: "apikey" (Postgrest-API-Key X)
  if (SUPABASE_ANON_KEY) {
    client.headers.set("apikey", SUPABASE_ANON_KEY);
  }

  // Authorization: Bearer (토큰 있으면 사용자 토큰, 없으면 anon key)
  if (token) {
    client.headers.set("Authorization", `Bearer ${token}`);
  } else if (SUPABASE_ANON_KEY) {
    client.headers.set("Authorization", `Bearer ${SUPABASE_ANON_KEY}`);
  }

  return client;
}

