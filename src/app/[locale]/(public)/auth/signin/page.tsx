import { PAGE_ROUTES } from "@/shared/constants";
import Text from "@/shared/design-system/text";
import { isArray } from "@/shared/utils";
import { sanitizeInternalRedirectPath } from "@/shared/utils/authRedirect";

// import SigninPage from "@/domains/auth/presentation/pages/signin";

export default async function Signin({
  // params,
  searchParams,
}: {
  // params: Promise<{ locale: string }>;
  searchParams: Promise<{ redirect: string; unverified: string }>;
}) {
  // const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const redirectPath = sanitizeInternalRedirectPath(
    isArray(resolvedSearchParams.redirect)
      ? resolvedSearchParams.redirect[0]
      : null,
    PAGE_ROUTES.WORKSPACE
  );
  const isUnverifiedRedirect = isArray(resolvedSearchParams.unverified)
    ? resolvedSearchParams.unverified[0]
    : null;

  console.log("redirectPath", redirectPath);
  console.log("isUnverifiedRedirect", isUnverifiedRedirect);

  return (
    <Text variant="body">Signin Page</Text>
    // <SigninPage
    //   redirectPath={redirectPath}
    //   isUnverifiedRedirect={isUnverifiedRedirect === "true"}
    // />
  );
}
