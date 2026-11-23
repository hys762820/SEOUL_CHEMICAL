import { timingSafeEqual } from "node:crypto";

/**
 * 예약 실행 요청인지 확인한다.
 * Vercel은 'Authorization: Bearer <CRON_SECRET>' 헤더를 붙여 호출한다.
 * CRON_SECRET이 설정되지 않았으면 모두 거절한다.
 */
export function isCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = request.headers.get("authorization") ?? "";
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(header);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
