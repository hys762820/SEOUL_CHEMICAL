import Link from "next/link";
import { signOut } from "@/app/auth/actions";

// 메뉴. 새 기능의 주소는 병합 담당자가 여기에 한 줄씩 추가한다.
// 예: { href: "/notices", label: "안내 발송" },
const MENU = [{ href: "/", label: "첫 화면" }];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3">
        <nav className="flex items-center gap-4 text-sm text-zinc-700">
          <span className="font-semibold text-zinc-900">업무 자동화</span>
          {MENU.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-zinc-950">
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-md border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-50"
          >
            로그아웃
          </button>
        </form>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
