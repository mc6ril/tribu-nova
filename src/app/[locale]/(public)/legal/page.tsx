import Link from "next/link";

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <main style={{ padding: 24 }}>
      <h1>Legal ({locale})</h1>
      <p>Public localized legal page (placeholder).</p>
      <Link href={`/${locale}`}>Back home</Link>
    </main>
  );
}

