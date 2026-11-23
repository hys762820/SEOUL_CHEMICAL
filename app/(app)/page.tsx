import { Suspense } from "react";
import { requireAllowedUser } from "@/lib/auth/session";

export default function Home() {
  return (
    <>
      <h1 className="text-2xl font-semibold text-zinc-900">첫 화면</h1>
      <Suspense fallback={<p className="mt-2 text-zinc-500">불러오는 중</p>}>
        <Welcome />
      </Suspense>
    </>
  );
}

async function Welcome() {
  // DB 자료를 보여 주기 전에 서버에서 로그인과 허용 목록을 확인한다.
  const user = await requireAllowedUser();
  return <p className="mt-2 text-zinc-600">{user.email} 계정으로 로그인되었습니다.</p>;
}
