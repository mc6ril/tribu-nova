import Link from "next/link";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; projectId: string }>;
}) {
  const { locale, projectId } = await params;

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
          Project {projectId}
        </div>
        <nav style={{ display: "grid", gap: 8 }}>
          <Link href={`/${locale}/workspace`}>Workspace</Link>
          <Link href={`/${locale}/workspace/${projectId}/board`}>Board</Link>
          <Link href={`/${locale}/workspace/${projectId}/recipes`}>
            Recipes
          </Link>
          <Link href={`/${locale}/workspace/${projectId}/projectSettings`}>
            Project settings
          </Link>
        </nav>
      </aside>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}
