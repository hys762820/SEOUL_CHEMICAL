<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 서울케미칼 업무 자동화

강설 예보 안내 팩스(P1)와 입찰·시장 동향 보고(P2)를 한 앱으로 만드는 프로토타입. 이관 후에는 개발자가 없는 회사가 운영한다. 스택: `docs/tech-stack.md`

- **공개 저장소**: 실제 고객명, 팩스번호, 견적 금액, 회사 내부 자료를 코드, 샘플, 테스트, 커밋 메시지에 넣지 않는다. 샘플은 가명(A-1, A-2)과 가짜 번호로 만든다.
- **발송**: 담당자가 승인한 건만 보낸다. 기본은 모의 발송이고 화면에 '모의 발송'이라고 표시한다. 실제 발송은 `REAL_SEND_ENABLED`가 `true`일 때만 하고, API 키가 있어도 이 값이 없으면 모의 발송이다.
- **환경 변수**: Supabase는 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`만 쓴다. `ANON_KEY`, `SERVICE_ROLE_KEY`는 대체값으로도 쓰지 않는다. `SUPABASE_DB_URL`은 `npm run db:apply` 전용이고 앱 코드에서 쓰지 않는다.
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
- **구조**: 분야 하나는 `app/(app)/<분야>/` 한 폴더에 둔다. 담당자는 자기 분야 폴더 안에서만 작업한다.

  | 폴더 안 위치 | 내용 |
  | --- | --- |
  | `page.tsx`, 하위 주소 폴더 | 화면 |
  | `_components/` | 이 분야만 쓰는 화면 조각 |
  | `_lib/` | 로직 |
  | `_adapters/<서비스>/` | 외부 서비스 연결 |
  | `<분야>.md` (예: `weather.md`) | 담당, 화면 목록, 폴더 안내 |

  이름이 `_`로 시작하는 폴더는 주소가 되지 않는다. 필요한 폴더는 처음 파일을 만들 때 함께 만든다. 작업 전에 `<분야>.md`를 읽고, 화면이나 외부 서비스가 바뀌면 고친다.

- **담당**: 브랜치 이름으로 적는다. 다른 분야의 폴더는 고치지 않고, 필요하면 알린다.

  | 분야 | 폴더 | 담당 브랜치 |
  | --- | --- | --- |
  | 기상 | `app/(app)/weather/` | `yoonsu` |
  | 입찰 | `app/(app)/bid/` | `sanghyeop` |
  | 접수및견적 | `app/(app)/dispatch/` | `minji` |
  | 뉴스 | `app/(app)/news/` | 미정 |
  | 동향 | `app/(app)/trends/` | 미정 |
  | 규제 | 미정 | 미정 |

- **분야 폴더 밖**: `supabase/migrations/`와 `supabase/seeds/`에 자기 파일을 추가하는 것만 한다. 공용 코드(`lib/supabase/`, `lib/auth/`, `lib/shared/`)와 공용 파일(`app/(app)/layout.tsx`, `app/(app)/page.tsx`, `proxy.ts`, `next.config.ts`, `scripts/`)은 고치지 않는다. 메뉴 등록, 예약 실행 경로(`app/api/cron/`)와 설정이 필요하면 고치지 말고 무엇이 필요한지 알린다.
- **외부 서비스**: `app/(app)/<분야>/_adapters/<서비스>/`에 인터페이스, 샘플 구현, 실제 구현으로 나눈다. API 키가 없으면 샘플 구현이 동작해야 한다. 두 분야 이상이 함께 쓰는 서비스(팩스, 메일 발송 등)는 `lib/adapters/<서비스>/`에 두고, 만들기 전에 병합 담당자에게 알린다.
- **샘플 데이터**: `supabase/seeds/<분야>.sql`에 두고 `npm run db:apply`로 넣는다. 다시 실행해도 되게 쓴다.
- **표 구조 변경**: `npx supabase migration new <이름>`으로 새 파일을 만들어 쓰고 `npm run db:apply`로 반영한다. 파일 이름의 번호를 직접 짓지 않는다. 이미 반영된 마이그레이션 파일은 고치지 않는다. 표 이름은 분야 폴더 이름으로 시작한다(예: `weather_`). 다른 사람이 만든 표와 공용 표는 고치지 않고, 필요하면 알린다. `supabase db push`, `migration up`, `migration repair`, `npm run db:reset`은 실행하지 않는다.
