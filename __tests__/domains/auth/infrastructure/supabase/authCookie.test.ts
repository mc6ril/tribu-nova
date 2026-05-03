import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";

import {
  APP_SESSION_COOKIE_MAX_AGE,
  APP_SESSION_COOKIE_NAME,
  decodeAppSessionCookie,
} from "@/shared/infrastructure/auth/appSessionCookie.server";

import {
  buildAppSessionCookieEntry,
  writeAppSessionCookie,
} from "@/domains/auth/infrastructure/supabase/authCookie";

const TEST_SECRET = "test-secret-at-least-32-chars-long-ok";

const buildUser = (): User =>
  ({
    id: "user-123",
    email: "user@example.com",
    email_confirmed_at: "2026-01-01T00:00:00.000Z",
    app_metadata: {},
    user_metadata: {
      display_name: "Test User",
      locale: "fr",
      terms_accepted_at: "2026-01-01T00:00:00.000Z",
    },
    aud: "authenticated",
    created_at: "2026-01-01T00:00:00.000Z",
  }) as User;

beforeEach(() => {
  process.env.APP_SESSION_COOKIE_SECRET = TEST_SECRET;
  (cookies as jest.Mock).mockReset();
});

afterEach(() => {
  delete process.env.APP_SESSION_COOKIE_SECRET;
});

describe("authCookie", () => {
  it("builds a signed user cookie entry from a Supabase user", () => {
    const entry = buildAppSessionCookieEntry(buildUser());
    const payload = decodeAppSessionCookie(entry.value);

    expect(entry.name).toBe(APP_SESSION_COOKIE_NAME);
    expect(entry.options).toEqual({
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: APP_SESSION_COOKIE_MAX_AGE,
    });
    expect(payload).toEqual(
      expect.objectContaining({
        id: "user-123",
        email: "user@example.com",
        displayName: "Test User",
        emailConfirmedAt: "2026-01-01T00:00:00.000Z",
        termsAcceptedAt: "2026-01-01T00:00:00.000Z",
      })
    );
  });

  it("writes the signed user cookie through Next cookies", async () => {
    const set = jest.fn();
    (cookies as jest.Mock).mockResolvedValue({ set });

    await writeAppSessionCookie(buildUser());

    expect(set).toHaveBeenCalledWith(
      APP_SESSION_COOKIE_NAME,
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      })
    );
  });
});
