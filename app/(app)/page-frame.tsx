/** 화면 제목 줄. 오른쪽에 작은 설명을 둘 수 있다. */
export function PageHead({ title, note }: { title: string; note?: string }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <h1 className="text-[26px] leading-tight font-extrabold tracking-[-0.035em] text-ink">{title}</h1>
      {note && <small className="text-[12.5px] text-faint">{note}</small>}
    </div>
  );
}

/** 흰 카드. 화면 내용을 담는 기본 상자다. */
export function Panel({ children }: { children: React.ReactNode }) {
  return <section className="mb-4 rounded-xl border border-line bg-white px-5 py-[18px]">{children}</section>;
}

/** 아직 내용이 없는 화면. 기능을 만들 때 이 자리를 실제 화면으로 바꾼다. */
export function EmptyPage({ title }: { title: string }) {
  return (
    <>
      <PageHead title={title} />
      <Panel>
        <p className="py-10 text-center text-muted">이 화면은 준비 중입니다.</p>
      </Panel>
    </>
  );
}
