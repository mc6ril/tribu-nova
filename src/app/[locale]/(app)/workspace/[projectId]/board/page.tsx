export default async function BoardPage({
  params,
}: {
  params: Promise<{ locale: string; projectId: string }>;
}) {
  const { locale, projectId } = await params;

  return (
    <main style={{ padding: 24 }}>
      <h1>Board</h1>
      <p style={{ marginTop: 12 }}>
        locale: <code>{locale}</code>
      </p>
      <p>
        projectId: <code>{projectId}</code>
      </p>
    </main>
  );
}
