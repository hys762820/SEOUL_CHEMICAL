import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * allowed_emails 표에 이메일이 있으면 true.
 * 조회에 실패하면 들여보내지 않는다(false).
 */
export async function isEmailAllowed(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("allowed_emails")
    .select("email")
    .eq("email", normalizeEmail(email))
    .maybeSingle();

  if (error) {
    console.error("[auth] 허용 목록 조회 실패:", error.message);
    return false;
  }
  return data !== null;
}
