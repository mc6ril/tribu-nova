import { PAGE_ROUTES } from "@/shared/constants/routes";
import { isArray } from "@/shared/utils";
import { sanitizeInternalRedirectPath } from "@/shared/utils/authRedirect";

import SignUpPage from "@/domains/auth/presentation/pages/signup";

export default async function Signup({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string | string[] }>;
}) {
  const resolved = await searchParams;

  const redirect = resolved.redirect;
  const redirectPath = sanitizeInternalRedirectPath(
    isArray(redirect) ? redirect[0] : (redirect ?? null),
    PAGE_ROUTES.WORKSPACE
  );

  return <SignUpPage redirectPath={redirectPath} />;
}
