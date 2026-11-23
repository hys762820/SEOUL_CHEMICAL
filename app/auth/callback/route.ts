import { NextResponse, type NextRequest } from "next/server";
import { isEmailAllowed } from "@/lib/auth/allowlist";
import { safeNextPath } from "@/lib/auth/redirect";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// 구글 로그인 뒤 Supabase가 이 주소로 돌려보낸다. (?code=...&next=...)
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  const toLogin = (error: string) => {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?error=${error}`;
    return NextResponse.redirect(url);
  };

  if (!code) return toLogin("oauth_failed");

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    console.error("[auth] 로그인 코드 교환 실패:", error?.message);
    return toLogin("oauth_failed");
  }

  // 허용 목록에 없으면 세션을 바로 지운다.
  if (!(await isEmailAllowed(data.user.email))) {
    await supabase.auth.signOut({ scope: "local" });
    return toLogin("not_allowed");
  }

  return NextResponse.redirect(new URL(next, request.nextUrl.origin));
}
