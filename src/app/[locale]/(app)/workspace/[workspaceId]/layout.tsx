import Link from "next/link";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; workspaceId: string }>;
}) {
  const { locale, workspaceId } = await params;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 260,
          padding: 16,
          borderRight: "1px solid rgba(0,0,0,0.12)",
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 12 }}>
          Workspace {workspaceId}
        </div>
        <nav style={{ display: "grid", gap: 8 }}>
          <Link href={`/${locale}/account`}>Account</Link>
          <Link
            href={`/${locale}/workspace/${workspaceId}/project/demo-project`}
          >
            Project demo
          </Link>
        </nav>
      </aside>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

