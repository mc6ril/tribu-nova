import VerifyEmailPage from "@/domains/auth/presentation/pages/verify-email";

export default async function VerifyEmail({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolved = await searchParams;

  // Flatten string[] → string (only string values passed to the client component)
  const flatParams = Object.fromEntries(
    Object.entries(resolved).flatMap(([key, value]) => {
      if (typeof value === "string") return [[key, value]];
      if (Array.isArray(value) && value[0]) return [[key, value[0]]];
      return [];
    })
  );

  return <VerifyEmailPage searchParams={flatParams} />;
}
