import type { AllowedUser } from "./session";

/**
 * 로컬 개발 서버에서만 로그인을 건너뛴다.
 * .env.local 에 AUTH_BYPASS_DEV=true 를 넣은 사람에게만 적용된다.
 *
 * 세 조건을 모두 만족해야 한다.
 * - 개발 서버(next dev)일 것. 빌드해서 띄운 서버와 배포 환경은 NODE_ENV 가 production 이다.
 * - Vercel 이 아닐 것. Vercel 은 모든 환경에 VERCEL=1 을 넣는다.
 * - AUTH_BYPASS_DEV 가 정확히 "true" 일 것.
 *
 * 배포 환경에 이 값을 넣어도 로그인은 꺼지지 않는다.
 */
export function isAuthBypassed(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    !process.env.VERCEL &&
    process.env.AUTH_BYPASS_DEV === "true"
  );
}

/** 로그인을 건너뛸 때 쓰는 가짜 사용자. 실제 계정이 아니다. */
export const DEV_BYPASS_USER: AllowedUser = {
  id: "00000000-0000-0000-0000-000000000000",
  email: "dev@localhost",
};
