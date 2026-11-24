import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type CollectionRun = {
  /** 출처. 예: 'g2b-bids' */
  source: string;
  startedAt: Date;
  success: boolean;
  /** 실패했을 때 오류 내용 */
  error?: string;
  /** 저장한 건수 */
  itemCount?: number;
  /** 참고. 예: '샘플 구현으로 실행' */
  note?: string;
};

/**
 * 예약 실행 결과를 collection_runs 표에 한 줄 남긴다. 실패한 실행도 남긴다.
 * 기록 저장이 실패해도 예외를 던지지 않는다.
 */
export async function recordCollectionRun(run: CollectionRun): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("collection_runs").insert({
    source: run.source,
    started_at: run.startedAt.toISOString(),
    finished_at: new Date().toISOString(),
    success: run.success,
    error: run.error ?? null,
    item_count: run.itemCount ?? null,
    note: run.note ?? null,
  });
  if (error) console.error(`[${run.source}] 수집 기록 저장 실패:`, error.message);
}
