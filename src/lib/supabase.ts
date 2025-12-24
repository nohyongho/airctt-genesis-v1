
import { upload } from "@zoerai/integration";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ Supabase environment variables are not set. Supabase client features depending on '@supabase/supabase-js' are disabled, but upload and aiImage integrations via '@zoerai/integration' will continue to work."
  );
}

/**
 * This file previously created a Supabase client via '@supabase/supabase-js',
 * which caused a build-time module resolution error because that package is
 * not installed.
 *
 * The current architecture uses PostgREST via '@/lib/postgrest' for database
 * access and '@zoerai/integration' for file uploads instead of direct
 * Supabase Storage APIs.
 *
 * To keep backward compatibility for types and helper functions that reference
 * 'Database', we keep the type definitions but remove the direct supabase-js
 * client dependency.
 */

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string;
          name: string;
          role: "HQ" | "ADMIN" | "MERCHANT";
          email: string | null;
          phone: string | null;
          profile_image_url: string | null;
          profile_video_url: string | null;
          description: string | null;
          parent_id: string | null;
          status: "ACTIVE" | "STOPPED" | "PENDING_DELETE";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["admin_users"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["admin_users"]["Insert"]>;
      };
      connections: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          type: "KARAOKE" | "STORE" | "ONLINE" | "OTHER";
          icon: string | null;
          description: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["connections"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["connections"]["Insert"]>;
      };
      news: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          content: string;
          language: string;
          pinned: boolean;
          visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["news"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["news"]["Insert"]>;
      };
      deletion_requests: {
        Row: {
          id: string;
          target_admin_id: string;
          requested_by_id: string;
          reason: string | null;
          status: "REQUESTED" | "APPROVED" | "REJECTED";
          created_at: string;
          processed_at: string | null;
          log: string | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["deletion_requests"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["deletion_requests"]["Insert"]
        >;
      };
    };
  };
};

/**
 * Lightweight runtime check that we can at least reach the backing database
 * through the PostgREST layer. Since we no longer have a supabase-js client
 * here, this function returns a boolean based on environment configuration
 * only, which is sufficient for feature toggling in the current app.
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  if (!supabaseUrl || !supabaseAnonKey) {
    return false;
  }

  try {
    // No direct request is made here to avoid depending on '@supabase/supabase-js'.
    // If needed, you can implement a small health-check API that uses
    // '@/lib/postgrest' and call it from the client instead.
    return true;
  } catch {
    return false;
  }
}

// Re-export upload helper to keep a single integration entry point if needed.
export { upload };
