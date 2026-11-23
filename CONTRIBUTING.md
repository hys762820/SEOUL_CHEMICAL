# 협업 규칙

2026-11-23

## 브랜치

- main: 시연과 이관에 쓰는 안정본. develop: 각자의 작업을 모으는 곳. 둘 다 PR로만 반영하고, 병합은 병합 담당자만 함.
- 개인 브랜치: 각자의 작업. 본인만 쓰고 본인이 직접 올림.
- 머지용 브랜치: 병합 담당자가 충돌을 풀 때만 씀.

## 작업 전

누가 무엇을 맡는지 정해 한 곳에 적음. 남이 맡은 부분을 고칠 때는 먼저 알림.

## 흐름 (GitHub Desktop)

1. **Current Branch**가 내 브랜치인지 확인.
2. **Fetch origin** → **Branch > Merge into current branch…** → `origin/develop`(없으면 develop). **Update from main**은 쓰지 않음.
3. 작업 → 커밋 → **Push origin**.
4. **Preview Pull Request** 또는 **Create Pull Request**. 대상(base)을 develop으로 바꾸고(기본값 main) 양식을 채움.
5. 병합 담당자에게 알림. 병합 후 2번부터 반복.

막혔을 때:

- API 키, 비밀번호, 실제 고객 정보를 올렸으면 병합 담당자에게 즉시 알림. "Push blocked: secret detected" 창은 우회하지 않음.
- 그 밖에 막히면 병합 담당자에게 알림.

## 병합 (병합 담당자)

- PR을 하나씩 **Create a merge commit**으로 병합. Squash와 Rebase는 쓰지 않음.
- 충돌은 병합 담당자가 머지용 브랜치에서 풂. 머지용 브랜치에 develop을 받고, 올린 사람의 브랜치를 합쳐 푼 뒤, 머지용 브랜치로 PR을 다시 엶. 의도를 알 수 없으면 올린 사람에게 물음.
- 시작 전에 머지용 브랜치가 develop과 같은지 확인: `git log origin/develop..(머지용 브랜치) --oneline`에 아무것도 나오지 않아야 함.
- `package.json`, `package-lock.json` 충돌은 둘 다 develop 쪽을 택한 뒤 그 PR이 추가한 패키지를 `npm install (패키지 이름)`으로 다시 설치. 그 외에 바뀐 것은 다시 적용.
- 직접 읽거나 AI에게 맡김. 지시 예: "열린 PR 전체와 develop을 함께 보고, AGENTS.md 위반, PR끼리 겹치는 파일, 같은 용도로 따로 만든 코드와 표를 찾아 줘."
- PR에 적힌 공용 파일 요청(메뉴 추가 등)을 반영.
- 동작은 PR에 적힌 확인 방법으로 확인.
- API 키가 올라갔으면 폐기하고 재발급. 고객 정보가 올라갔으면 저장소 관리자가 비공개로 바꾸고 이력에서 지움. 파일만 지우면 이력에 남음.

## AI 도구

- 여러 기능이 함께 쓰는 코드(로그인, 메뉴, `lib/shared/`, `collection_runs` 표)는 한 사람이 먼저 develop에 넣음. 나머지는 그것을 받은 뒤 시작.
- 기능 하나는 한 번에 한 사람이 맡음. 여럿이 필요하면 기능을 더 잘게 나눔.
- 바꾸면 PR에 적는 파일: `package.json`, `AGENTS.md`, `vercel.json`, `supabase/migrations/`.
- 고치지 않고 필요한 내용만 PR에 적는 파일: `app/(app)/layout.tsx`, `app/(app)/page.tsx`, `proxy.ts`, `next.config.ts`, `lib/supabase/`, `lib/auth/`, `lib/shared/`.
- 비밀 값은 `.env.local`과 Vercel 환경 변수에만 둠.
