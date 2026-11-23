-- 수집 기록
-- 예약 실행(수집)이 돌 때마다 성공·실패와 관계없이 한 줄씩 남긴다.
-- 여러 기능(입찰, 강설 예보 등)이 같이 쓰고, source 열로 구분한다.
-- 앱은 서버에서 secret 키로만 이 표를 읽고 쓴다.
--
-- 최근 기록 보기 (Supabase 대시보드 > SQL Editor):
--   select * from public.collection_runs order by started_at desc limit 20;

create table if not exists public.collection_runs (
  id          bigint generated always as identity primary key,
  source      text        not null,               -- 출처. 예: 'g2b-bids'
  started_at  timestamptz not null,               -- 시작 시각
  finished_at timestamptz not null,               -- 종료 시각
  success     boolean     not null,               -- 성공 여부
  error       text,                               -- 실패했을 때 오류 내용
  item_count  integer,                            -- 저장한 건수
  note        text,                               -- 참고 (예: '샘플 구현으로 실행')
  created_at  timestamptz not null default now()
);

comment on table public.collection_runs is '예약 실행(수집) 기록. 실패해도 남긴다.';

create index if not exists collection_runs_source_started_idx
  on public.collection_runs (source, started_at desc);

-- RLS를 켜고 정책은 만들지 않는다. anon / authenticated 는 읽을 수 없다.
alter table public.collection_runs enable row level security;
revoke all on table public.collection_runs from anon, authenticated;
