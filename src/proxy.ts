import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { createLoggerFactory } from "@/shared/observability";

const logger = createLoggerFactory().forScope("proxy");

export async function proxy(request: NextRequest) {
  logger.info("proxy entry", {
    function: "proxy",
    pathname: request.nextUrl.pathname,
    method: request.method,
  });

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
          // Cache-Control headers set by @supabase/ssr to prevent CDN caching of auth responses
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          );
        },
      },
    }
  );

  // IMPORTANT: Do not run code between createServerClient and getClaims().
  // getClaims() triggers token refresh. Removing it may cause random logouts.
  await supabase.auth.getClaims();
  logger.info("proxy Supabase claims checked", {
    function: "proxy",
    pathname: request.nextUrl.pathname,
  });

  logger.info("proxy complete", {
    function: "proxy",
    pathname: request.nextUrl.pathname,
  });

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
