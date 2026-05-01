import JoinInvitationPage from "@/domains/auth/presentation/pages/join-invitation/page";

export default async function JoinPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const resolvedParams = await params;

  return <JoinInvitationPage token={resolvedParams.token} />;
}
