import type { Session, User } from "@supabase/supabase-js";

import {
  mapSupabaseSessionToAuthSession,
  mapSupabaseUserToAuthSession,
} from "@/domains/auth/infrastructure/supabase/SessionMapper.supabase";

const buildUser = (overrides: Partial<User> = {}): User =>
  ({
    id: "user-123",
    email: "user@example.com",
    app_metadata: {},
    user_metadata: {
      display_name: "Test User",
      avatar_url: "https://example.com/avatar.png",
      preferences: {
        theme: "light",
        emailNotifications: true,
        language: "es",
      },
      terms_accepted_at: "2026-01-01T00:00:00.000Z",
    },
    aud: "authenticated",
    created_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  }) as User;

describe("SessionMapper.supabase", () => {
  it("maps user metadata into an auth session profile", () => {
    const session = mapSupabaseUserToAuthSession(buildUser());

    expect(session.user).toMatchObject({
      id: "user-123",
      email: "user@example.com",
      displayName: "Test User",
      avatarUrl: "https://example.com/avatar.png",
      preferences: {
        theme: "light",
        emailNotifications: true,
        language: "es",
        gettingStartedStatus: "pending",
      },
      termsAcceptedAt: "2026-01-01T00:00:00.000Z",
    });
  });

  it("falls back to safe defaults for missing or unsupported metadata", () => {
    const session = mapSupabaseUserToAuthSession(
      buildUser({
        email: undefined,
        user_metadata: {
          theme: "unsupported-theme",
          locale: "unsupported-locale",
        },
      })
    );

    expect(session.user.email).toBe("");
    expect(session.user.preferences).toMatchObject({
      theme: "system",
      emailNotifications: false,
      language: "en",
      gettingStartedStatus: "pending",
    });
    expect(session.user.termsAcceptedAt).toBe("");
  });

  it("maps Supabase session expiry and caller-provided email", () => {
    const supabaseSession = {
      expires_at: 1_777_777_777,
      user: buildUser({ email: "provider@example.com" }),
    } as Session;

    const session = mapSupabaseSessionToAuthSession(
      supabaseSession,
      "submitted@example.com"
    );

    expect(session.expiresAt).toBe(1_777_777_777);
    expect(session.user.email).toBe("submitted@example.com");
  });
});
