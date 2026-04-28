export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; workspaceId: string; projectId: string }>;
}) {
  const { locale, workspaceId, projectId } = await params;

  return (
    <main style={{ padding: 24 }}>
      <h1>Project</h1>
      <dl style={{ marginTop: 16, display: "grid", gap: 8 }}>
        <div>
          <dt style={{ fontWeight: 600 }}>locale</dt>
          <dd>{locale}</dd>
        </div>
        <div>
          <dt style={{ fontWeight: 600 }}>workspaceId</dt>
          <dd>{workspaceId}</dd>
        </div>
        <div>
          <dt style={{ fontWeight: 600 }}>projectId</dt>
          <dd>{projectId}</dd>
        </div>
      </dl>
      <p style={{ marginTop: 16 }}>
        Placeholder for heavy data loading (e.g. React Query).
      </p>
    </main>
  );
}

