import { Suspense } from "react";
import { cookies, headers } from "next/headers";

import { APP_COOKIE_KEYS } from "@/shared/infrastructure/storage/cookies";

import styles from "./styles.module.scss";

import { getServerSession } from "@/domains/auth/infrastructure/supabase/getServerSession";

const APP_COOKIE_PURPOSES: Record<string, string> = {
  [APP_COOKIE_KEYS.LOCALE]: "Language preference — written client-side",
  [APP_COOKIE_KEYS.THEME]: "UI theme — written client-side",
  [APP_COOKIE_KEYS.RUNTIME_CONFIG_OVERRIDES]:
    "Dev feature flag overrides — written client-side",
  [APP_COOKIE_KEYS.USER]:
    "Auth gate — signed server-side cookie, read by proxy and server layout to skip Supabase Auth on happy path",
};

const RELEVANT_HEADERS = [
  "accept-language",
  "user-agent",
  "host",
  "x-forwarded-for",
  "x-real-ip",
  "x-forwarded-proto",
  "referer",
];

async function DiagnosticsContent() {
  const [cookieStore, headerStore, session] = await Promise.all([
    cookies(),
    headers(),
    getServerSession(),
  ]);

  const allCookies = cookieStore.getAll();

  const sensitiveNames = new Set([
    APP_COOKIE_KEYS.USER,
    ...allCookies.filter((c) => c.name.startsWith("sb-")).map((c) => c.name),
  ]);

  return (
    <div className={styles["diagnostics"]}>
      <section className={styles["diagnostics-card"]}>
        <h2 className={styles["diagnostics-card-title"]}>Session</h2>
        <p className={styles["diagnostics-card-note"]}>
          Resolved from the signed <code>workbench-user</code> cookie on the
          happy path — zero Supabase Auth calls. Falls back to{" "}
          <code>getSession()</code> (JWT local + refresh token) when the cookie
          is absent or expired. Memoised once per request via{" "}
          <code>React.cache()</code>.
        </p>
        {session ? (
          <table className={styles["diagnostics-table"]}>
            <tbody>
              {(
                [
                  ["User ID", session.user.id],
                  ["Email", session.user.email],
                  ["Display name", session.user.displayName ?? "—"],
                  ["Theme", session.user.preferences.theme],
                  ["Language", session.user.preferences.language],
                  [
                    "Email notifications",
                    String(session.user.preferences.emailNotifications),
                  ],
                  ["Terms accepted at", session.user.termsAcceptedAt || "—"],
                  [
                    "Expires at",
                    session.expiresAt
                      ? new Date(session.expiresAt * 1000).toISOString()
                      : "—",
                  ],
                ] as [string, string][]
              ).map(([key, value]) => (
                <tr key={key}>
                  <td className={styles["diagnostics-cell-key"]}>{key}</td>
                  <td>
                    <code>{value}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className={styles["diagnostics-warning"]}>
            No session — layout should have redirected before reaching this.
          </p>
        )}
      </section>

      <section className={styles["diagnostics-card"]}>
        <h2 className={styles["diagnostics-card-title"]}>App Cookies</h2>
        <p className={styles["diagnostics-card-note"]}>
          Cookies the app manages explicitly. Preference cookies are written by
          the browser. The auth gate cookie is written server-side (HMAC-signed,
          HttpOnly) by the callback route and auth server actions.
        </p>
        <table className={styles["diagnostics-table"]}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Purpose</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(APP_COOKIE_KEYS).map((name) => {
              const raw = cookieStore.get(name)?.value;
              const isSensitive = sensitiveNames.has(name);
              return (
                <tr key={name}>
                  <td>
                    <code>{name}</code>
                  </td>
                  <td className={styles["diagnostics-cell-muted"]}>
                    {APP_COOKIE_PURPOSES[name] ?? "—"}
                  </td>
                  <td>
                    <code
                      className={
                        isSensitive
                          ? styles["diagnostics-value-token"]
                          : raw
                            ? styles["diagnostics-value-present"]
                            : styles["diagnostics-value-missing"]
                      }
                    >
                      {isSensitive ? "[token — not shown]" : (raw ?? "not set")}
                    </code>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className={styles["diagnostics-card"]}>
        <h2 className={styles["diagnostics-card-title"]}>
          All Cookies{" "}
          <span className={styles["diagnostics-count"]}>
            {allCookies.length}
          </span>
        </h2>
        <p className={styles["diagnostics-card-note"]}>
          Complete cookie jar — all values shown.
        </p>
        <table className={styles["diagnostics-table"]}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {allCookies.map(({ name, value }) => (
              <tr key={name}>
                <td>
                  <code>{name}</code>
                </td>
                <td>
                  <code
                    className={
                      sensitiveNames.has(name)
                        ? styles["diagnostics-value-token"]
                        : undefined
                    }
                  >
                    {sensitiveNames.has(name)
                      ? "[token — not shown]"
                      : value || "(empty)"}
                  </code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={styles["diagnostics-card"]}>
        <h2 className={styles["diagnostics-card-title"]}>Request Headers</h2>
        <table className={styles["diagnostics-table"]}>
          <thead>
            <tr>
              <th>Header</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {RELEVANT_HEADERS.filter((name) => headerStore.has(name)).map(
              (name) => (
                <tr key={name}>
                  <td>
                    <code>{name}</code>
                  </td>
                  <td>
                    <code>{headerStore.get(name)}</code>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default function WorkspaceTemporaryPage() {
  return (
    <main className={styles["workspace-page"]}>
      <div className={styles["workspace-container"]}>
        <header className={styles["diagnostics-header"]}>
          <h1>Auth Diagnostics</h1>
          <p>
            Temporary page — verifies session, cookies, and headers after
            authentication.
          </p>
        </header>
        <Suspense
          fallback={
            <div className={styles["diagnostics-loading"]}>Loading…</div>
          }
        >
          <DiagnosticsContent />
        </Suspense>
      </div>
    </main>
  );
}
