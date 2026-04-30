import { Link } from "@/shared/i18n/routing";

export default async function JoinPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <main style={{ padding: 24 }}>
      <h1>Join ({locale})</h1>
      <p>
        Public invitation entry point (placeholder). A user can paste an invite
        link here.
      </p>
      <Link href="/">Back home</Link>
    </main>
  );
}
