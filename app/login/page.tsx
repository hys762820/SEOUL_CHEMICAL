import { Suspense } from "react";
import { signInWithGoogle } from "@/app/auth/actions";
import { safeNextPath } from "@/lib/auth/redirect";

const ERROR_MESSAGES: Record<string, string> = {
  not_allowed: "허용 목록에 없는 계정입니다. 관리자에게 이메일 등록을 요청하세요.",
  oauth_failed: "구글 로그인에 실패했습니다. 다시 시도해 주세요.",
};

type Search = Promise<Record<string, string | string[] | undefined>>;

export default function LoginPage(props: { searchParams: Search }) {
  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-zinc-900">업무 자동화 로그인</h1>
        <p className="mt-2 text-sm text-zinc-600">회사 구글 계정으로 로그인하세요.</p>
        {/* 주소의 값(searchParams)은 요청마다 달라지므로 Suspense 안에서 읽는다. */}
        <Suspense fallback={null}>
          <LoginForm searchParams={props.searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function LoginForm({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;
  const pick = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const next = safeNextPath(pick(params.next));
  const errorKey = pick(params.error);
  const errorMessage = errorKey ? ERROR_MESSAGES[errorKey] : undefined;

  return (
    <>
      {errorMessage && (
        <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      )}
      <form action={signInWithGoogle} className="mt-6">
        <input type="hidden" name="next" value={next} />
        <button
          type="submit"
          className="flex h-11 w-full items-center justify-center rounded-md border border-zinc-300 bg-white text-sm font-medium text-zinc-900 hover:bg-zinc-50"
        >
          Google 계정으로 로그인
        </button>
      </form>
    </>
  );
}
