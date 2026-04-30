import { Link } from "@/shared/i18n/routing";

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <main style={{ padding: 24 }}>
      <h1>Reset password ({locale})</h1>
      <p>Public localized reset password page (placeholder).</p>
      <p style={{ marginTop: 12 }}>
        After the user clicks the email link, Supabase redirects to{" "}
        <code>/{locale}/auth/callback</code>.
      </p>
      <Link href="/">Back home</Link>
    </main>
  );
}
