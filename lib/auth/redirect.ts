/**
 * 로그인 뒤 돌아갈 경로를 같은 사이트 안의 경로로만 제한한다.
 * "//evil.example" 이나 "https://..." 같은 값은 "/"로 바꾼다.
 */
export function safeNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return "/";
  }
  if (value.startsWith("/login") || value.startsWith("/auth/")) {
    return "/";
  }
  return value;
}
