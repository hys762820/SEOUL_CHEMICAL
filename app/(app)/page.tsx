import Image from "next/image";
import { Suspense } from "react";
import { requireAllowedUser } from "@/lib/auth/session";
import { Panel } from "./page-frame";

export default function Home() {
  return (
    <Panel>
      <div className="px-4 py-6">
        <Image src="/brand/seoul-chemical-color.svg" alt="서울케미칼" width={185} height={70} priority />
        <h1 className="mt-6 text-[26px] leading-tight font-extrabold tracking-[-0.035em] text-ink">업무 자동화</h1>
        <p className="mt-2 text-muted">위쪽 메뉴에서 업무를 고르면 왼쪽에 그 업무의 화면 목록이 나옵니다.</p>
        <Suspense fallback={<p className="mt-5 text-[12.5px] text-faint">불러오는 중</p>}>
          <Welcome />
        </Suspense>
      </div>
    </Panel>
  );
}

async function Welcome() {
  // DB 자료를 보여 주기 전에 서버에서 로그인과 허용 목록을 확인한다.
  const user = await requireAllowedUser();
  return <p className="mt-5 text-[12.5px] text-faint">{user.email} 계정으로 로그인되었습니다.</p>;
}
