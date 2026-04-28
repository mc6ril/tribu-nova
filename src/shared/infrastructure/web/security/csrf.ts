import { NextRequest, NextResponse } from "next/server";

/**
 * Verifies that the Origin header matches the application's own origin.
 * Protects against cross-site request forgery by rejecting requests
 * from foreign origins. Returns a 403 response if the origin is invalid,
 * or null if the request is safe to proceed.
 */
export const verifyCsrfOrigin = (request: NextRequest): NextResponse | null => {
  const origin = request.headers.get("origin");
  const expectedOrigin = request.nextUrl.origin;

  if (!origin || origin !== expectedOrigin) {
    return NextResponse.json(
      { error: "Forbidden: invalid origin" },
      { status: 403 }
    );
  }

  return null;
};
