import { createHmac } from "node:crypto";

import {
  APP_SESSION_COOKIE_MAX_AGE,
  APP_SESSION_COOKIE_NAME,
  buildAppSessionPayload,
  decodeAppSessionCookie,
  encodeAppSessionCookieValue,
  getAppSessionFromCookie,
  getAppSessionInfoFromRawCookies,
} from "@/shared/infrastructure/auth/appSessionCookie.server";

import type { AuthSession } from "@/domains/session/core/domain/session.types";

const TEST_SECRET = "test-secret-at-least-32-chars-long-ok";

const BASE_SESSION: AuthSession = {
  user: {
    id: "user-123",
    email: "user@example.com",
    displayName: "Test User",
    avatarUrl: undefined,
    preferences: {
      theme: "system",
      emailNotifications: false,
      language: "en",
      gettingStartedStatus: "pending",
    },
    termsAcceptedAt: "2026-01-01T00:00:00Z",
  },
};

function buildValidCookieValue(
  overrides: {
    expiresAt?: number;
    secret?: string;
    emailConfirmedAt?: string | null;
  } = {}
): string {
  const secret = overrides.secret ?? TEST_SECRET;
  const session = { ...BASE_SESSION };
  const payload = buildAppSessionPayload(
    session,
    overrides.emailConfirmedAt !== undefined
      ? overrides.emailConfirmedAt
      : "2026-01-01T00:00:00Z"
  );
  if (overrides.expiresAt !== undefined) {
    payload.expiresAt = overrides.expiresAt;
  }
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

beforeEach(() => {
  process.env.APP_SESSION_COOKIE_SECRET = TEST_SECRET;
});

afterEach(() => {
  delete process.env.APP_SESSION_COOKIE_SECRET;
});

// ─── decodeAppSessionCookie ────────────────────────────────────────────────

describe("decodeAppSessionCookie", () => {
  it("returns null when secret is not configured", () => {
    delete process.env.APP_SESSION_COOKIE_SECRET;
    const raw = buildValidCookieValue({ secret: TEST_SECRET });
    expect(decodeAppSessionCookie(raw)).toBeNull();
  });

  it("returns null when the cookie has no dot separator", () => {
    expect(decodeAppSessionCookie("nodothere")).toBeNull();
  });

  it("returns null when the signature is invalid", () => {
    const raw = buildValidCookieValue();
    const tampered = raw.slice(0, -4) + "xxxx";
    expect(decodeAppSessionCookie(tampered)).toBeNull();
  });

  it("returns null when the payload is base64url but not valid JSON", () => {
    const badEncoded = Buffer.from("not-json-{{{").toString("base64url");
    const sig = createHmac("sha256", TEST_SECRET)
      .update(badEncoded)
      .digest("base64url");
    expect(decodeAppSessionCookie(`${badEncoded}.${sig}`)).toBeNull();
  });

  it("returns null when the cookie is expired", () => {
    const pastTimestamp = Math.floor(Date.now() / 1000) - 1;
    const raw = buildValidCookieValue({ expiresAt: pastTimestamp });
    expect(decodeAppSessionCookie(raw)).toBeNull();
  });

  it("returns the payload for a valid, non-expired cookie", () => {
    const raw = buildValidCookieValue();
    const payload = decodeAppSessionCookie(raw);
    expect(payload).not.toBeNull();
    expect(payload?.id).toBe("user-123");
    expect(payload?.email).toBe("user@example.com");
    expect(payload?.expiresAt).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it("returns null when the payload is missing required fields", () => {
    const incomplete = { email: "user@example.com" }; // missing id, expiresAt, iat
    const encoded = Buffer.from(JSON.stringify(incomplete)).toString(
      "base64url"
    );
    const sig = createHmac("sha256", TEST_SECRET)
      .update(encoded)
      .digest("base64url");
    expect(decodeAppSessionCookie(`${encoded}.${sig}`)).toBeNull();
  });
});

// ─── getAppSessionInfoFromRawCookies ───────────────────────────────────────

describe("getAppSessionInfoFromRawCookies", () => {
  it("returns null when workbench-user cookie is absent", () => {
    const result = getAppSessionInfoFromRawCookies([
      { name: "some-other-cookie", value: "val" },
    ]);
    expect(result).toBeNull();
  });

  it("returns null when workbench-user has an invalid signature", () => {
    const result = getAppSessionInfoFromRawCookies([
      { name: APP_SESSION_COOKIE_NAME, value: "badpayload.badsig" },
    ]);
    expect(result).toBeNull();
  });

  it("returns null when workbench-user is expired", () => {
    const raw = buildValidCookieValue({
      expiresAt: Math.floor(Date.now() / 1000) - 10,
    });
    const result = getAppSessionInfoFromRawCookies([
      { name: APP_SESSION_COOKIE_NAME, value: raw },
    ]);
    expect(result).toBeNull();
  });

  it("returns session and emailConfirmedAt for a valid cookie", () => {
    const raw = buildValidCookieValue({
      emailConfirmedAt: "2026-03-01T12:00:00Z",
    });
    const result = getAppSessionInfoFromRawCookies([
      { name: APP_SESSION_COOKIE_NAME, value: raw },
    ]);
    expect(result).not.toBeNull();
    expect(result?.session.user.id).toBe("user-123");
    expect(result?.session.user.email).toBe("user@example.com");
    expect(result?.emailConfirmedAt).toBe("2026-03-01T12:00:00Z");
  });

  it("exposes null emailConfirmedAt when the user email is unverified", () => {
    const raw = buildValidCookieValue({ emailConfirmedAt: null });
    const result = getAppSessionInfoFromRawCookies([
      { name: APP_SESSION_COOKIE_NAME, value: raw },
    ]);
    expect(result?.emailConfirmedAt).toBeNull();
  });
});

// ─── getAppSessionFromCookie (server helper via mocked next/headers) ───────

describe("getAppSessionFromCookie", () => {
  it("returns null when the cookie is absent", async () => {
    const { cookies } = await import("next/headers");
    (cookies as jest.Mock).mockResolvedValue({
      get: () => undefined,
    });
    const result = await getAppSessionFromCookie();
    expect(result).toBeNull();
  });

  it("returns null when the cookie has an invalid signature", async () => {
    const { cookies } = await import("next/headers");
    (cookies as jest.Mock).mockResolvedValue({
      get: () => ({ value: "bad.data" }),
    });
    const result = await getAppSessionFromCookie();
    expect(result).toBeNull();
  });

  it("returns AuthSession for a valid cookie", async () => {
    const raw = buildValidCookieValue();
    const { cookies } = await import("next/headers");
    (cookies as jest.Mock).mockResolvedValue({
      get: (name: string) =>
        name === APP_SESSION_COOKIE_NAME ? { value: raw } : undefined,
    });
    const result = await getAppSessionFromCookie();
    expect(result?.user.id).toBe("user-123");
    expect(result?.user.email).toBe("user@example.com");
  });
});

// ─── encode round-trip ─────────────────────────────────────────────────────

describe("encodeAppSessionCookieValue / decodeAppSessionCookie round-trip", () => {
  it("encodes and decodes symmetrically", () => {
    const payload = buildAppSessionPayload(
      BASE_SESSION,
      "2026-01-01T00:00:00Z"
    );
    const raw = encodeAppSessionCookieValue(payload);
    const decoded = decodeAppSessionCookie(raw);
    expect(decoded?.id).toBe("user-123");
    expect(decoded?.email).toBe("user@example.com");
    expect(decoded?.emailConfirmedAt).toBe("2026-01-01T00:00:00Z");
  });
});

// ─── constants ────────────────────────────────────────────────────────────

describe("constants", () => {
  it("APP_SESSION_COOKIE_NAME is workbench-user", () => {
    expect(APP_SESSION_COOKIE_NAME).toBe("workbench-user");
  });

  it("APP_SESSION_COOKIE_MAX_AGE is 30 days in seconds", () => {
    expect(APP_SESSION_COOKIE_MAX_AGE).toBe(30 * 24 * 60 * 60);
  });
});
