import Link from "next/link";

export default async function SigninPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <main style={{ padding: 24 }}>
      <h1>Sign in ({locale})</h1>
      <p>Public localized sign-in page (placeholder).</p>
      <ul style={{ marginTop: 16, display: "grid", gap: 8 }}>
        <li>
          <Link href={`/${locale}/auth/signup`}>Create account</Link>
        </li>
        <li>
          <Link href={`/${locale}/auth/reset-password`}>Reset password</Link>
        </li>
      </ul>
      <div style={{ marginTop: 16 }}>
        <Link href={`/${locale}`}>Back home</Link>
      </div>
    </main>
  );
}
