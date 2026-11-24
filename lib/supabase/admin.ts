import { createClient } from "@supabase/supabase-js";
import { getSupabaseSecretKey, getSupabaseUrl } from "./env";

/**
 * secret 키로 DB를 읽고 쓰는 서버 전용 클라이언트.
 * 클라이언트 컴포넌트('use client')에서 절대 import 하지 않는다.
 * 사용자 세션을 저장하지 않으므로 요청마다 만들어도 된다.
 */
export function createSupabaseAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("createSupabaseAdminClient는 서버에서만 호출할 수 있습니다.");
  }

  return createClient(getSupabaseUrl(), getSupabaseSecretKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
