import { PostgrestClient } from "@supabase/postgrest-js";

// ★ Supabase anon key는 JWT 형식 (eyJ로 시작, 200+글자). 짧은 키는 무시!
const HARDCODED_URL = "https://nlsiwrwiyozpiofrmzxa.supabase.co";
const HARDCODED_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sc2l3cndpeW96cGlvZnJtenhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNTc4NzcsImV4cCI6MjA3NjczMzg3N30.hurd7QNUJ-JVppETyDnCwU97F1Z3jkWszYRM9NhSUAg";

function pickValidKey(...candidates: (string | undefined)[]): string {
  for (const c of candidates) {
    if (c && c.startsWith("eyJ") && c.length > 100) return c;
  }
  return HARDCODED_KEY;
}

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  process.env.POSTGREST_URL ||
  HARDCODED_URL;
const POSTGREST_SCHEMA = process.env.POSTGREST_SCHEMA || "public";
const SUPABASE_ANON_KEY = pickValidKey(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  process.env.SUPABASE_ANON_KEY,
  process.env.POSTGREST_API_KEY,
);

// Supabase REST API 엔드포인트: https://xxx.supabase.co/rest/v1
const POSTGREST_URL = SUPABASE_URL
  ? (SUPABASE_URL.endsWith("/rest/v1") ? SUPABASE_URL : `${SUPABASE_URL}/rest/v1`)
  : "";

export function createPostgrestClient(token?: string) {
  const authToken = token || SUPABASE_ANON_KEY;

  const client = new PostgrestClient(POSTGREST_URL, {
    schema: POSTGREST_SCHEMA,
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${authToken}`,
    },
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

      // ★ fetch 호출부에서 apikey + Authorization 강제 주입
      const headers = new Headers((options as RequestInit)?.headers);
      if (SUPABASE_ANON_KEY) {
        headers.set("apikey", SUPABASE_ANON_KEY);
      }
      if (authToken) {
        headers.set("Authorization", `Bearer ${authToken}`);
      }
      headers.set("Content-Type", "application/json");

      return fetch(url, {
        ...options,
        headers,
      } as RequestInit);
    },
  });

  return client;
}
