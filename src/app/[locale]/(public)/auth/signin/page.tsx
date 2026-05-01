import { PAGE_ROUTES } from "@/shared/constants";
import { isArray } from "@/shared/utils";
import { sanitizeInternalRedirectPath } from "@/shared/utils/authRedirect";

import SignInPage from "@/domains/auth/presentation/pages/signin";

export default async function Signin({
  searchParams,
}: {
  searchParams: Promise<{
    redirect?: string | string[];
    unverified?: string | string[];
  }>;
}) {
  const resolved = await searchParams;

  const redirect = resolved.redirect;
  const redirectPath = sanitizeInternalRedirectPath(
    isArray(redirect) ? redirect[0] : (redirect ?? null),
    PAGE_ROUTES.WORKSPACE
  );

  const unverified = resolved.unverified;
  const isUnverifiedRedirect =
    (isArray(unverified) ? unverified[0] : unverified) === "true";

  return (
    <SignInPage
      redirectPath={redirectPath}
      isUnverifiedRedirect={isUnverifiedRedirect}
    />
  );
}
