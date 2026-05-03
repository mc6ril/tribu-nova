import { Link } from "@/shared/i18n/routing";

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
      <Link href="/">Back home</Link>
    </main>
  );
}
