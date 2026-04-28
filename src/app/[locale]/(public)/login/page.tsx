import Link from "next/link";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <main style={{ padding: 24 }}>
      <h1>Login ({locale})</h1>
      <p>Public localized login page (placeholder).</p>
      <Link href={`/${locale}`}>Back home</Link>
    </main>
  );
}

