// Supabase 환경 변수는 이 세 이름만 쓴다. (AGENTS.md 참고)
// ANON_KEY, SERVICE_ROLE_KEY 같은 옛 이름은 대체값으로도 읽지 않는다.

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `환경 변수 ${name} 이(가) 설정되지 않았습니다. .env.local 또는 Vercel 프로젝트 설정을 확인하세요.`,
    );
  }
  return value;
}

export function getSupabaseUrl(): string {
  return required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function getSupabasePublishableKey(): string {
  return required(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

/** 서버 코드에서만 호출한다. 브라우저로 보내지 않는다. */
export function getSupabaseSecretKey(): string {
  return required("SUPABASE_SECRET_KEY", process.env.SUPABASE_SECRET_KEY);
}
