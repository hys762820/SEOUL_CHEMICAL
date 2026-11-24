<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 서울케미칼 업무 자동화

강설 예보 안내 팩스(P1)와 입찰·시장 동향 보고(P2)를 한 앱으로 만드는 프로토타입. 이관 후에는 개발자가 없는 회사가 운영한다. 스택: `docs/tech-stack.md`

- **공개 저장소**: 실제 고객명, 팩스번호, 견적 금액, 회사 내부 자료를 코드, 샘플, 테스트, 커밋 메시지에 넣지 않는다. 샘플은 가명(A-1, A-2)과 가짜 번호로 만든다.
- **발송**: 담당자가 승인한 건만 보낸다. 기본은 모의 발송이고 화면에 '모의 발송'이라고 표시한다. 실제 발송은 `REAL_SEND_ENABLED`가 `true`일 때만 하고, API 키가 있어도 이 값이 없으면 모의 발송이다.
- **환경 변수**: Supabase는 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`만 쓴다. `ANON_KEY`, `SERVICE_ROLE_KEY`는 대체값으로도 쓰지 않는다.
- **DB**: 서버 코드에서 secret 키로 읽고 쓴다. 모든 표에 RLS를 켜고 정책은 만들지 않는다. 새 표에는 `service_role`에게만 권한을 준다(`grant select, insert, update, delete`). `anon`, `authenticated`에게 읽기를 여는 정책을 만들거나 권하지 않는다.
- **권한 확인**: 사용자 요청으로 DB를 읽거나 쓰는 페이지, Server Action, API Route는 로그인과 허용 목록을 먼저 확인한다. 예약 실행 경로는 `CRON_SECRET`으로 확인한다.
- **로그인**: 구글 로그인만 쓴다. 로그인 확인 코드가 있으면 그것을 쓰고, 없으면 만들지 말고 먼저 묻는다.
- **예약 실행**: Vercel Schedules만 쓴다. `vercel.json`의 `crons`와 Supabase `pg_cron`은 쓰지 않는다. 무료 요금제의 최소 간격은 15분이다. 시간대는 항상 서울로 지정한다.

  ```json
  { "schedules": { "collect-forecast": {
    "schedule": "20 * * * *", "timezone": "Asia/Seoul",
    "path": "/api/cron/collect-forecast", "requestMethod": "GET"
  } } }
  ```

- **수집 기록**: 실행할 때마다 `collection_runs` 표에 출처, 시작·종료 시각, 성공 여부, 오류 내용을 기록한다. 실패해도 기록한다.
- **외부 서비스**: `lib/adapters/<서비스>/`에 인터페이스, 샘플 구현, 실제 구현으로 나눈다. API 키가 없으면 샘플 구현이 동작해야 한다.
- **구조**: 기능 하나는 `app/(app)/<기능>/`(화면과 그 화면만 쓰는 파일)과 `lib/<기능>/`(로직)에 둔다. 공용 코드는 `lib/supabase/`, `lib/auth/`, `lib/shared/`에 있다. 메뉴는 `app/(app)/layout.tsx`에 등록되어 있다. 기능 작업에서는 공용 코드와 공용 파일(`app/(app)/layout.tsx`, `app/(app)/page.tsx`, `proxy.ts`, `next.config.ts`)을 고치지 않는다. 필요하면 고치지 말고 무엇이 필요한지 알린다.
- **샘플 데이터**: `supabase/seeds/<기능>.sql`에 둔다.
- **표 구조 변경**: `npx supabase migration new <이름>`으로 새 파일을 만들어 쓴다. 파일 이름의 번호를 직접 짓지 않는다. 이미 있는 마이그레이션 파일은 고치지 않는다.
