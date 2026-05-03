import { getServerClient } from "@/shared/infrastructure/supabase/client-server";

import { writeSessionCookieAction } from "@/domains/auth/infrastructure/actions/writeSessionCookieAction";
import { writeAppSessionCookie } from "@/domains/auth/infrastructure/supabase/authCookie";

let mockLoggerWarn: jest.Mock;

jest.mock("@/shared/infrastructure/supabase/client-server", () => ({
  getServerClient: jest.fn(),
}));

jest.mock("@/domains/auth/infrastructure/supabase/authCookie", () => ({
  writeAppSessionCookie: jest.fn(),
}));

jest.mock("@/shared/observability", () => ({
  createLoggerFactory: () => ({
    forScope: () => ({
      warn: (...args: unknown[]) => mockLoggerWarn(...args),
    }),
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockLoggerWarn = jest.fn();
});

describe("writeSessionCookieAction", () => {
  it("writes the app session cookie with the current Supabase user", async () => {
    const user = {
      id: "user-123",
      email: "user@example.com",
    };
    (getServerClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user },
        }),
      },
    });

    await writeSessionCookieAction();

    expect(writeAppSessionCookie).toHaveBeenCalledTimes(1);
    expect(writeAppSessionCookie).toHaveBeenCalledWith(user);
    expect(mockLoggerWarn).not.toHaveBeenCalled();
  });

  it("does not write the cookie and logs a warning when Supabase has no user", async () => {
    (getServerClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
        }),
      },
    });

    await writeSessionCookieAction();

    expect(writeAppSessionCookie).not.toHaveBeenCalled();
    expect(mockLoggerWarn).toHaveBeenCalledWith(
      "App session cookie was not written after signin",
      { function: "writeSessionCookieAction" }
    );
  });
});
