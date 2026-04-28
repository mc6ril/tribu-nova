import Link from "next/link";

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <main style={{ padding: 24 }}>
      <h1>Home ({locale})</h1>
      <p>Public entry point for the active locale.</p>
      <ul style={{ marginTop: 16, display: "grid", gap: 8 }}>
        <li>
          <Link href={`/${locale}/pricing`}>Pricing</Link>
        </li>
        <li>
          <Link href={`/${locale}/auth/signin`}>Sign in</Link>
        </li>
        <li>
          <Link href={`/${locale}/account`}>Account (auth)</Link>
        </li>
        <li>
          <Link href={`/${locale}/workspace`}>Workspace (auth)</Link>
        </li>
      </ul>
    </main>
  );
}

