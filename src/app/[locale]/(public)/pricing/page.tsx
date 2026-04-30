import { Link } from "@/shared/i18n/routing";

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
      <Link href="/">Back home</Link>
    </main>
  );
}
