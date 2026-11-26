import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isEmailAllowed } from "@/lib/auth/allowlist";
import { isAuthBypassed } from "@/lib/auth/dev-bypass";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

// 로그인 없이 열리는 경로
const PUBLIC_PATHS = ["/login", "/auth/callback"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function proxy(request: NextRequest) {
  // 로컬 개발 서버에서 AUTH_BYPASS_DEV=true 이면 로그인을 건너뛴다. 배포 환경에서는 적용되지 않는다.
  if (isAuthBypassed()) {
    if (request.nextUrl.pathname === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  // 세션 쿠키를 읽고, 토큰이 갱신되면 응답 쿠키에 다시 쓴다.
  const supabase = createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // 갱신된 쿠키와 캐시 금지 헤더를 유지한 채로 다른 응답을 돌려준다.
  function withSessionCookies(next: NextResponse): NextResponse {
    response.cookies.getAll().forEach((cookie) => next.cookies.set(cookie));
    ["cache-control", "expires", "pragma"].forEach((key) => {
      const value = response.headers.get(key);
      if (value) next.headers.set(key, value);
    });
    return next;
  }

  const { pathname, search } = request.nextUrl;

  // getClaims()는 JWT 서명을 검증한다. getSession()은 쿠키를 그대로 믿으므로 쓰지 않는다.
  const { data } = await supabase.auth.getClaims();
  const email = typeof data?.claims.email === "string" ? data.claims.email : null;
  const loggedIn = email !== null;
  const allowed = loggedIn && (await isEmailAllowed(email));

  // 로그인은 했지만 허용 목록에 없는 사람: 세션을 지우고 로그인 화면으로 보낸다.
  if (loggedIn && !allowed) {
    await supabase.auth.signOut({ scope: "local" });
    if (pathname === "/login") return response;
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "?error=not_allowed";
    return withSessionCookies(NextResponse.redirect(url));
  }

  if (isPublicPath(pathname)) {
    // 이미 들어온 사람이 /login에 오면 첫 화면으로 보낸다.
    if (allowed && pathname === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.search = "";
      return withSessionCookies(NextResponse.redirect(url));
    }
    return response;
  }

  if (!allowed) {
    // API는 화면 이동 대신 401을 돌려준다.
    if (pathname.startsWith("/api/")) {
      return withSessionCookies(
        NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 }),
      );
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return withSessionCookies(NextResponse.redirect(url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * 다음으로 시작하는 경로는 제외한다.
     * - api/cron: 예약 실행. 로그인 대신 CRON_SECRET으로 확인한다.
     * - _next/static, _next/image: 빌드 파일과 이미지 최적화
     * - favicon.ico 와 public 폴더의 이미지 파일
     */
    "/((?!api/cron|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
