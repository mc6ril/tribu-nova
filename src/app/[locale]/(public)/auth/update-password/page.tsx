import { Link } from "@/shared/i18n/routing";

export default async function UpdatePasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <main style={{ padding: 24 }}>
      <h1>Update password ({locale})</h1>
      <p>
        Public localized update password page (placeholder). This is typically
        the landing page after <code>/auth/callback</code> during reset flows.
      </p>
      <Link href="/">Back home</Link>
    </main>
  );
}
