-- 로그인 허용 목록
-- 이 표에 있는 이메일만 앱에 들어올 수 있다.
-- 앱은 서버에서 secret 키로만 이 표를 읽는다.
--
-- 사람 추가 (Supabase 대시보드 > SQL Editor):
--   insert into public.allowed_emails (email, note) values ('someone@example.com', '담당자');
-- 사람 삭제:
--   delete from public.allowed_emails where email = 'someone@example.com';

create table if not exists public.allowed_emails (
  email      text primary key check (email = lower(btrim(email)) and email <> ''),
  note       text,
  created_at timestamptz not null default now()
);

comment on table public.allowed_emails is '로그인 허용 이메일 목록. 소문자로 저장한다.';

-- RLS를 켜고 정책은 만들지 않는다. anon / authenticated 는 읽을 수 없다.
alter table public.allowed_emails enable row level security;
revoke all on table public.allowed_emails from anon, authenticated;
