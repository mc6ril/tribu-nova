import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/__tests__"],
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  moduleNameMapper: {
    // Map SCSS/CSS files first (before path aliases)
    "^.+\\.(css|scss|sass)$": "<rootDir>/__mocks__/styleMock.ts",
    "^.+\\.(gif|jpg|jpeg|png|svg|webp)$": "<rootDir>/__mocks__/fileMock.ts",
    "^@vercel/analytics/next$": "<rootDir>/__mocks__/vercelAnalyticsNext.tsx",
    "^@vercel/speed-insights/next$":
      "<rootDir>/__mocks__/vercelSpeedInsightsNext.tsx",
    // Prevent server-only from throwing in tests
    "^server-only$": "<rootDir>/__mocks__/serverOnly.ts",
    // Mock next/headers — tests call the cookie helpers directly
    "^next/headers$": "<rootDir>/__mocks__/nextHeaders.ts",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/__tests__/setupTests.ts"],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/shared/infrastructure/auth/**/*.{ts,tsx}",
    "src/domains/session/**/*.{ts,tsx}",
    "!src/**/index.ts",
    "!src/**/*.d.ts",
  ],
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: ["/node_modules/", "/__tests__/"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.json",
      },
    ],
  },
};

export default config;
