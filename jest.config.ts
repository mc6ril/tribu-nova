import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
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
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/__tests__/setupTests.ts"],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/core/domain/**/*.{ts,tsx}",
    "src/core/usecases/**/*.{ts,tsx}",
    "src/infrastructure/**/*.{ts,tsx}",
    "src/presentation/components/ui/**/*.{ts,tsx}",
    "src/shared/utils/**/*.{ts,tsx}",
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
