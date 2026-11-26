"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export type SubMenuIcon = "snow" | "clock" | "sliders" | "chart" | "news" | "list" | "award" | "doc" | "truck";

export type MenuItem = {
  /** 상단 메뉴를 눌렀을 때 가는 주소 */
  href: string;
  label: string;
  /** 이 메뉴에 들어가면 왼쪽에 보이는 메뉴. 첫 줄은 보통 href 와 같은 주소다. */
  sub: { href: string; label: string; icon: SubMenuIcon }[];
};

const under = (pathname: string, href: string) => pathname === href || pathname.startsWith(href + "/");

/**
 * 화면 틀: 위쪽에 로고와 상단 메뉴, 메뉴에 들어가면 왼쪽에 그 메뉴의 하위 메뉴.
 * 오른쪽 위 자리(headerRight)에는 로그아웃 버튼 같은 것을 넣는다.
 */
export function AppShell({
  menu,
  headerRight,
  children,
}: {
  menu: MenuItem[];
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // 지금 주소가 어느 상단 메뉴에 속하는지: 메뉴 주소나 하위 메뉴 주소 아래에 있으면 그 메뉴다.
  const current = menu.find((item) => [item.href, ...item.sub.map((s) => s.href)].some((href) => under(pathname, href)));
  // 왼쪽 메뉴는 가장 길게 맞는 주소 하나만 켠다. (/news/settings 에서 /news 가 같이 켜지지 않게)
  const subActive = current?.sub
    .filter((item) => under(pathname, item.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-canvas font-pretendard text-[14px] leading-[1.55] tracking-[-0.01em] text-ink antialiased">
      {/* 왼쪽 여백(24px)은 왼쪽 메뉴의 아이콘 시작 위치와 같다. 높이(64px)는 아래 왼쪽 메뉴의 top-16 과 맞춘다. */}
      <header className="sticky top-0 z-10 flex min-h-16 flex-wrap items-center gap-10 border-b border-line bg-white px-6 max-[720px]:gap-0 max-[720px]:px-4 max-[720px]:pt-2">
        <Link href="/" aria-label="서울케미칼 홈" className="flex items-center rounded-md focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-sky">
          <Image src="/brand/seoul-chemical-color.svg" alt="서울케미칼" width={100} height={38} priority />
        </Link>
        <nav aria-label="상단 메뉴" className="flex flex-wrap gap-7 max-[720px]:w-full max-[720px]:flex-nowrap max-[720px]:gap-4 max-[720px]:overflow-x-auto">
          {menu.map((item) => {
            const active = item === current;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`border-b-[3px] px-0.5 py-[19px] text-[14.5px] whitespace-nowrap focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-sky max-[720px]:py-2.5 ${
                  active ? "border-brand-sky font-extrabold text-brand-navy" : "border-transparent font-semibold text-muted hover:text-brand-navy"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        {headerRight && <div className="ml-auto flex items-center gap-3 max-[720px]:hidden">{headerRight}</div>}
      </header>

      <div className="flex flex-1 max-[720px]:block">
        {current && (
          // 왼쪽 메뉴: 화면 왼쪽 끝에 붙고, 오른쪽 선으로 본문과 나뉜다. 좁은 화면에서는 본문 위의 가로 줄이 된다.
          <aside
            className={`flex-none border-r border-line bg-white max-[720px]:w-auto max-[720px]:border-r-0 max-[720px]:border-b ${
              collapsed ? "w-10" : "w-[200px]"
            }`}
          >
            <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto max-[720px]:static max-[720px]:max-h-none">
              {/* 여닫는 화살표. 좁은 화면에서는 메뉴를 늘 펼쳐 두므로 숨긴다. */}
              <div className={`flex pt-2.5 max-[720px]:hidden ${collapsed ? "justify-center" : "justify-end pr-2"}`}>
                <button
                  type="button"
                  aria-controls="sub-menu"
                  aria-expanded={!collapsed}
                  aria-label={`${current.label} 메뉴 ${collapsed ? "펼치기" : "접기"}`}
                  title={collapsed ? "메뉴 펼치기" : "메뉴 접기"}
                  onClick={() => setCollapsed((value) => !value)}
                  className="grid size-7 cursor-pointer place-items-center rounded-md text-faint hover:bg-[#eef1f7] hover:text-brand-navy focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-brand-sky"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={collapsed ? "m9 6 6 6-6 6" : "m15 6-6 6 6 6"} />
                  </svg>
                </button>
              </div>
              <nav
                id="sub-menu"
                aria-label={`${current.label} 메뉴`}
                className={`gap-1 px-3 pt-1.5 pb-4 max-[720px]:flex max-[720px]:overflow-x-auto max-[720px]:px-4 max-[720px]:py-2 ${collapsed ? "hidden" : "grid"}`}
              >
                {current.sub.map((item) => {
                  const active = item.href === subActive;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-2.5 rounded-[9px] px-3 py-2.5 font-semibold whitespace-nowrap focus-visible:outline-3 focus-visible:-outline-offset-2 focus-visible:outline-brand-sky max-[720px]:px-2.5 max-[720px]:py-[7px] ${
                        active ? "bg-brand-navy text-white" : "text-muted hover:bg-[#eef1f7]"
                      }`}
                    >
                      <SubIcon name={item.icon} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>
        )}
        <main className="min-w-0 flex-1 px-8 py-6 max-[720px]:px-4 max-[720px]:py-3.5">
          <div className="mx-auto w-full max-w-[1480px]">{children}</div>
        </main>
      </div>
    </div>
  );
}

const ICON_PATHS: Record<SubMenuIcon, React.ReactNode> = {
  snow: <path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="17" r="2" />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v18h18" />
      <path d="m7 15 4-4 3 3 5-6" />
    </>
  ),
  news: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 8h10M7 12h10M7 16h6" />
    </>
  ),
  list: <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />,
  award: (
    <>
      <circle cx="12" cy="9" r="5" />
      <path d="m9 13.5-1.5 7L12 18l4.5 2.5-1.5-7" />
    </>
  ),
  doc: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </>
  ),
  truck: (
    <>
      <path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z" />
      <circle cx="7.5" cy="17.5" r="1.8" />
      <circle cx="17.5" cy="17.5" r="1.8" />
    </>
  ),
};

function SubIcon({ name }: { name: SubMenuIcon }) {
  return (
    <svg className="flex-none" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICON_PATHS[name]}
    </svg>
  );
}
