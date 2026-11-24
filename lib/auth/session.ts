import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isEmailAllowed, normalizeEmail } from "./allowlist";

export type AllowedUser = {
  id: string;
  email: string;
};

/**
 * 로그인했고 허용 목록에 있는 사용자를 돌려준다. 아니면 null.
 * getClaims()는 JWT 서명을 검증하므로 쿠키 값을 그대로 믿지 않는다.
 */
export async function getAllowedUser(): Promise<AllowedUser | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data) return null;

  const { sub, email } = data.claims;
  if (typeof sub !== "string" || typeof email !== "string") return null;
  if (!(await isEmailAllowed(email))) return null;

  return { id: sub, email: normalizeEmail(email) };
}

/**
 * DB 자료를 보여 주는 화면, 서버 액션, 라우트 핸들러의 맨 앞에서 호출한다.
 * proxy.ts도 같은 검사를 하지만, 서버 액션은 proxy를 거치지 않을 수 있으므로
 * 각 서버 코드에서 다시 확인한다.
 */
export async function requireAllowedUser(): Promise<AllowedUser> {
  const user = await getAllowedUser();
  if (!user) redirect("/login");
  return user;
}
