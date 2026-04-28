import Link from "next/link";

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <main style={{ padding: 24 }}>
      <h1>Pricing ({locale})</h1>
      <p>Public localized pricing page (placeholder).</p>
      <Link href={`/${locale}`}>Back home</Link>
    </main>
  );
}

