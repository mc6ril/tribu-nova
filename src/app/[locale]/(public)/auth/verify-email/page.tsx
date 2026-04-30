import { Link } from "@/shared/i18n/routing";

export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <main style={{ padding: 24 }}>
      <h1>Verify email ({locale})</h1>
      <p>Public localized verify email page (placeholder).</p>
      <Link href="/">Back home</Link>
    </main>
  );
}
