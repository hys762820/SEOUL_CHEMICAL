import { signOut } from "@/app/auth/actions";
import { isAuthBypassed } from "@/lib/auth/dev-bypass";
import { AppShell, type MenuItem } from "./app-shell";

// 메뉴. 상단 메뉴 한 줄에 왼쪽 메뉴(sub)를 함께 적는다.
// 새 화면의 주소는 병합 담당자가 해당 메뉴의 sub 에 한 줄씩 추가하고, 그 주소에 page.tsx 를 만든다.
// 예: { href: "/weather/history", label: "발송 이력", icon: "clock" },
const MENU: MenuItem[] = [
  {
    href: "/weather",
    label: "기상알림",
    sub: [
      { href: "/weather", label: "강설 예보", icon: "snow" },
      { href: "/weather/history", label: "발송 이력", icon: "clock" },
      { href: "/weather/settings", label: "알림 설정", icon: "sliders" },
    ],
  },
  {
    href: "/trends",
    label: "수입 동향",
    sub: [
      { href: "/trends", label: "수입 동향", icon: "chart" },
      { href: "/news", label: "뉴스", icon: "news" },
      { href: "/news/settings", label: "품목·키워드", icon: "sliders" },
    ],
  },
  {
    href: "/bid",
    label: "나라장터 입찰",
    sub: [
      { href: "/bid", label: "입찰 공고", icon: "list" },
      { href: "/bid/result", label: "개찰 결과", icon: "award" },
    ],
  },
  {
    href: "/quote",
    label: "견적·배차",
    sub: [
      { href: "/quote", label: "견적", icon: "doc" },
      { href: "/quote/delivery", label: "배차", icon: "truck" },
    ],
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppShell
        menu={MENU}
        headerRight={
          isAuthBypassed() ? (
            // 로컬 개발 서버에서 로그인을 건너뛴 상태. 로그아웃할 세션이 없으므로 표시만 한다.
            <span className="rounded-md border border-[#e0a100] bg-[#fff7e0] px-3 py-1 text-[12.5px] font-semibold text-[#7a5200]">
              로그인 생략 중
            </span>
          ) : (
          <form action={signOut}>
            <button
              type="submit"
              className="cursor-pointer rounded-md border border-line bg-white px-3 py-1 text-[12.5px] font-semibold text-muted hover:bg-[#eef1f7] hover:text-brand-navy focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-sky"
            >
              로그아웃
            </button>
          </form>
          )
        }
      >
        {children}
      </AppShell>
    </>
  );
}
