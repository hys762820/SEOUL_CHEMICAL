import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublishableKey, getSupabaseUrl } from "./env";

/**
 * 로그인 세션(쿠키)을 다루는 Supabase 클라이언트.
 * 서버 컴포넌트, 서버 액션, 라우트 핸들러에서 요청마다 새로 만든다.
 * 인증(로그인·로그아웃·사용자 확인)에만 쓰고, DB 읽기·쓰기는 admin.ts의 클라이언트로 한다.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // 서버 컴포넌트에서는 쿠키를 쓸 수 없다.
          // 세션 갱신은 proxy.ts가 맡으므로 여기서는 무시해도 된다.
        }
      },
    },
  });
}
