import Link from "next/link";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <main style={{ padding: 24 }}>
      <h1>Account ({locale})</h1>
      <p>Protected localized account page (placeholder).</p>
      <Link href={`/${locale}`}>Back home</Link>
    </main>
  );
}
