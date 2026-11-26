import { Suspense } from "react";
import { requireAllowedUser } from "@/lib/auth/session";
import { EmptyPage } from "@/app/(app)/page-frame";

// 빈 화면. 기능을 만들 때 Screen 안을 실제 화면으로 바꾼다.
export default function DeliveryPage() {
  return (
    <Suspense>
      <Screen />
    </Suspense>
  );
}

async function Screen() {
  await requireAllowedUser();
  return <EmptyPage title="배차" />;
}
