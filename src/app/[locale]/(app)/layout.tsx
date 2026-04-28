import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { APP_COOKIE_KEYS } from "@/shared/infrastructure/storage/cookies";

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cookieStore = await cookies();

  const userCookie = cookieStore.get(APP_COOKIE_KEYS.USER)?.value;
  if (!userCookie) {
    redirect(`/${locale}/auth/signin`);
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

