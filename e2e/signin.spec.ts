import { loadEnvConfig } from "@next/env";
import { type BrowserContext, expect, test } from "@playwright/test";
import { createHmac } from "node:crypto";

const defaultLocalePrefix = "/fr";
const appSessionCookieName = "workbench-user";

const testUser = {
  id: "00000000-0000-4000-8000-000000000001",
  email: "signin.e2e@example.com",
  password: "CorrectHorseBatteryStaple123!",
  displayName: "E2E Signin",
};

const loadLocalEnv = () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const mutableEnv = process.env as Record<string, string | undefined>;

  if (originalNodeEnv === "test") {
    mutableEnv.NODE_ENV = "development";
  }

  loadEnvConfig(process.cwd(), true);

  if (originalNodeEnv === "test") {
    mutableEnv.NODE_ENV = originalNodeEnv;
  }
};

const encodeJsonBase64Url = (payload: unknown): string =>
  Buffer.from(JSON.stringify(payload)).toString("base64url");

const signPayload = (payload: string, secret: string): string =>
  createHmac("sha256", secret).update(payload).digest("base64url");

const buildAppSessionCookieValue = (secret: string): string => {
  const now = Math.floor(Date.now() / 1000);
  const encodedPayload = encodeJsonBase64Url({
    id: testUser.id,
    email: testUser.email,
    displayName: testUser.displayName,
    preferences: {
      theme: "system",
      emailNotifications: false,
      language: "fr",
      gettingStartedStatus: "pending",
    },
    emailConfirmedAt: "2026-01-01T00:00:00.000Z",
    termsAcceptedAt: "2026-01-01T00:00:00.000Z",
    expiresAt: now + 30 * 24 * 60 * 60,
    iat: now,
  });

  return `${encodedPayload}.${signPayload(encodedPayload, secret)}`;
};

const buildAccessToken = (expiresAt: number): string =>
  [
    encodeJsonBase64Url({ alg: "none", typ: "JWT" }),
    encodeJsonBase64Url({
      sub: testUser.id,
      aud: "authenticated",
      role: "authenticated",
      email: testUser.email,
      exp: expiresAt,
    }),
    "e2e-signature",
  ].join(".");

const buildSupabasePasswordSession = () => {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + 60 * 60;
  const timestamp = "2026-01-01T00:00:00.000Z";
  const user = {
    id: testUser.id,
    aud: "authenticated",
    role: "authenticated",
    email: testUser.email,
    email_confirmed_at: timestamp,
    confirmed_at: timestamp,
    last_sign_in_at: timestamp,
    app_metadata: {
      provider: "email",
      providers: ["email"],
    },
    user_metadata: {
      display_name: testUser.displayName,
      locale: "fr",
      terms_accepted_at: timestamp,
    },
    identities: [],
    created_at: timestamp,
    updated_at: timestamp,
  };

  return {
    access_token: buildAccessToken(expiresAt),
    token_type: "bearer",
    expires_in: 60 * 60,
    expires_at: expiresAt,
    refresh_token: "e2e-refresh-token",
    user,
  };
};

const getRequiredAppSessionSecret = (): string => {
  const appSessionSecret = process.env.APP_SESSION_COOKIE_SECRET;
  if (!appSessionSecret) {
    test.skip(
      true,
      "APP_SESSION_COOKIE_SECRET is required to sign the app session cookie."
    );
    return "";
  }

  return appSessionSecret;
};

const addAuthenticatedAppSessionCookie = async (
  context: BrowserContext,
  baseURL: string | undefined
) => {
  const appBaseURL = baseURL ?? "http://localhost:3000";

  await context.addCookies([
    {
      name: appSessionCookieName,
      value: buildAppSessionCookieValue(getRequiredAppSessionSecret()),
      url: appBaseURL,
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
};

loadLocalEnv();

test.describe("signin", () => {
  test("renders the signin form for guests", async ({ page }) => {
    await page.goto(`${defaultLocalePrefix}/auth/signin`);

    await expect(
      page.getByRole("heading", { level: 1, name: "Se connecter" })
    ).toBeVisible();

    const passwordInput = page.getByRole("textbox", {
      name: /^Mot de passe$/,
    });

    await page
      .getByRole("button", { name: "Afficher le mot de passe" })
      .click();
    await expect(passwordInput).toHaveAttribute("type", "text");
    await page.getByRole("button", { name: "Masquer le mot de passe" }).click();
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("redirects authenticated visitors from signin to the workspace", async ({
    page,
    context,
    baseURL,
  }) => {
    let passwordSignInRequests = 0;

    await addAuthenticatedAppSessionCookie(context, baseURL);

    await test.step("mock Supabase password authentication", async () => {
      await page.route(
        (url) =>
          url.pathname.endsWith("/auth/v1/token") &&
          url.searchParams.get("grant_type") === "password",
        async (route) => {
          passwordSignInRequests += 1;
          const body = route.request().postDataJSON();

          await test.step("assert credentials sent to Supabase", async () => {
            expect(body).toMatchObject({
              email: testUser.email,
              password: testUser.password,
            });
          });

          await test.step("return a Supabase session payload", async () => {
            await route.fulfill({
              status: 200,
              contentType: "application/json",
              body: JSON.stringify(buildSupabasePasswordSession()),
            });
          });
        }
      );
    });

    await test.step("open the signin page", async () => {
      await page.goto(`${defaultLocalePrefix}/auth/signin`);
    });

    await test.step("reach the authenticated workspace", async () => {
      await expect(page).toHaveURL(/\/fr\/workspace\/?$/);
      await expect(
        page.getByRole("heading", { level: 1, name: "Auth Diagnostics" })
      ).toBeVisible();
      await expect(page.getByText(testUser.email)).toBeVisible();
    });

    await test.step("assert no password authentication request was needed", async () => {
      expect(passwordSignInRequests).toBe(0);
    });
  });

  test("redirects authenticated visitors from guest-only public pages", async ({
    page,
    context,
    baseURL,
  }) => {
    await addAuthenticatedAppSessionCookie(context, baseURL);

    await page.goto(`${defaultLocalePrefix}/pricing`);

    await expect(page).toHaveURL(/\/fr\/workspace\/?$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Auth Diagnostics" })
    ).toBeVisible();
  });

  test("keeps authenticated visitors on public exceptions", async ({
    page,
    context,
    baseURL,
  }) => {
    await addAuthenticatedAppSessionCookie(context, baseURL);

    await page.goto(defaultLocalePrefix);
    await expect(page).toHaveURL(/\/fr\/?$/);
    await expect(page.getByRole("main")).toBeVisible();

    await page.goto(`${defaultLocalePrefix}/legal`);
    await expect(page).toHaveURL(/\/fr\/legal\/?$/);
    await expect(page.getByRole("main")).toBeVisible();
  });
});
