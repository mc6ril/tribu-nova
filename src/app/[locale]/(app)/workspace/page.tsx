import Link from "next/link";

export default async function WorkspaceEntryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <main style={{ padding: 24 }}>
      <h1>Workspace ({locale})</h1>
      <p>Protected entry point (placeholder).</p>
      <ul style={{ marginTop: 16, display: "grid", gap: 8 }}>
        <li>
          <Link href={`/${locale}/workspace/demo-project`}>Open demo project</Link>
        </li>
        <li>
          <Link href={`/${locale}/account`}>Account</Link>
        </li>
      </ul>
    </main>
  );
}

