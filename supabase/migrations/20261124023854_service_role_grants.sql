-- 서버 키(service_role) 권한
-- 새 Supabase 프로젝트는 새 표의 권한을 자동으로 주지 않는다.
-- 앱은 서버에서 secret 키(service_role)로만 표를 읽고 쓰므로 service_role에게만 준다.
-- anon / authenticated 에게는 주지 않는다.

grant select, insert, update, delete on table public.allowed_emails to service_role;
grant select, insert, update, delete on table public.collection_runs to service_role;
