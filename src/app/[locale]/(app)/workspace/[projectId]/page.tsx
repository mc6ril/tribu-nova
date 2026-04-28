export default async function ProjectHomePage({
  params,
}: {
  params: Promise<{ locale: string; projectId: string }>;
}) {
  const { locale, projectId } = await params;

  return (
    <main style={{ padding: 24 }}>
      <h1>Project home</h1>
      <dl style={{ marginTop: 16, display: "grid", gap: 8 }}>
        <div>
          <dt style={{ fontWeight: 600 }}>locale</dt>
          <dd>{locale}</dd>
        </div>
        <div>
          <dt style={{ fontWeight: 600 }}>projectId</dt>
          <dd>{projectId}</dd>
        </div>
      </dl>
    </main>
  );
}
