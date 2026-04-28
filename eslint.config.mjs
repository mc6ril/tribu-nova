import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import simpleImportSort from "eslint-plugin-simple-import-sort";

const forbiddenWorkspaceProjectShimImports = [
  {
    name: "@/domains/workspace/core/domain/schema/project.schema",
    message:
      "Workspace project schema shim removed. Import from @/domains/project/core/domain/schema/project.schema or @/domains/project/core/domain/schema/projectRole.schema.",
  },
  {
    name: "@/domains/workspace/infrastructure/supabase/project/ProjectMapper.supabase",
    message:
      "Workspace project mapper shim removed. Import the canonical owner mapper instead.",
  },
  {
    name: "@/domains/workspace/core/usecases/project/createProject",
    message:
      "Workspace createProject shim removed. Import from @/domains/project/core/usecases/project/createProject.",
  },
  {
    name: "@/domains/workspace/core/usecases/project/getProject",
    message:
      "Workspace getProject shim removed. Import from @/domains/project/core/usecases/project/getProject.",
  },
  {
    name: "@/domains/workspace/core/usecases/project/deleteProject",
    message:
      "Workspace deleteProject shim removed. Import from @/domains/project/core/usecases/project/deleteProject.",
  },
];

const forbiddenWorkspaceProjectShimFiles = [
  "src/domains/workspace/core/domain/schema/project.schema.ts",
  "src/domains/workspace/infrastructure/supabase/project/ProjectMapper.supabase.ts",
  "src/domains/workspace/core/usecases/project/createProject.ts",
  "src/domains/workspace/core/usecases/project/getProject.ts",
  "src/domains/workspace/core/usecases/project/deleteProject.ts",
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated coverage files
    "coverage/**",
  ]),
  // Custom rules aligned with project conventions
  {
    rules: {
      // Prevent usage of 'any' type
      "@typescript-eslint/no-explicit-any": "error",
      // Enforce braces for all control statements
      curly: ["error", "all"],
      // Prefer arrow functions for callbacks
      "prefer-arrow-callback": "error",
      // Prefer 'type' over 'interface' for type definitions (props, objects, etc.)
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      // Remove unused imports
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      // Prevent relative imports from src/ (enforce @/ prefix)
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*", "../../*", "../../../*", "../../../../*"],
              message:
                "Use absolute imports with @/ prefix instead of relative imports from src/",
            },
          ],
        },
      ],
    },
  },
  // Layer boundary guardrails for strict Clean Architecture
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*", "../../*", "../../../*", "../../../../*"],
              message:
                "Use absolute imports with @/ prefix instead of relative imports from src/",
            },
            {
              group: ["@/presentation/**"],
              message:
                "Shared layer must not import presentation layer modules.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/domains/*/core/**/*", "src/modules/*/core/**/*"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*", "../../*", "../../../*", "../../../../*"],
              message:
                "Use absolute imports with @/ prefix instead of relative imports from src/",
            },
            // Keep @/shared/featureAccess importable from domains/modules during the transition.
            {
              group: ["@/presentation/**", "@/shared/i18n/**"],
              message:
                "Core layer must remain framework-agnostic and cannot import presentation or shared i18n modules.",
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      "src/domains/*/infrastructure/**/*",
      "src/modules/*/infrastructure/**/*",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*", "../../*", "../../../*", "../../../../*"],
              message:
                "Use absolute imports with @/ prefix instead of relative imports from src/",
            },
            {
              group: ["@/configs/**"],
              message:
                "Infrastructure layer must not pull dependencies from global configs singletons.",
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      "src/presentation/**/*",
      "src/domains/*/presentation/**/*",
      "src/modules/*/presentation/**/*",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "next/link",
              message:
                "Import Link from @/shared/design-system/link instead.",
            },
            {
              name: "next/navigation",
              importNames: ["useRouter"],
              message:
                "Use useAppRouter from @/shared/navigation/useAppRouter instead.",
            },
          ],
          patterns: [
            {
              group: ["../*", "../../*", "../../../*", "../../../../*"],
              message:
                "Use absolute imports with @/ prefix instead of relative imports from src/",
            },
          ],
        },
      ],
    },
  },
  /**
   * Design System enforcement
   *
   * Goal: prevent "random HTML UI" and keep typography/form controls consistent.
   * We allow raw tags inside the design-system itself, but forbid them elsewhere.
   */
  {
    files: ["src/**/*.{tsx}"],
    ignores: ["src/shared/design-system/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXOpeningElement[name.name=/^h[1-6]$/]",
          message:
            "Use the design system heading component instead (ex: @/shared/design-system/title or @/shared/design-system/section_title).",
        },
        {
          selector: "JSXOpeningElement[name.name=/^(p|span)$/]",
          message:
            "Use the design system text component instead (ex: @/shared/design-system/text).",
        },
        {
          selector: "JSXOpeningElement[name.name=/^(ul|ol|li)$/]",
          message:
            "Avoid raw list tags in UI. Prefer a design-system component (or create one) to keep spacing/typography consistent. If you just need vertical spacing, consider @/shared/design-system/stack.",
        },
        {
          selector: "JSXOpeningElement[name.name='button']",
          message:
            "Use the design system button component instead (ex: @/shared/design-system/button).",
        },
        {
          selector: "JSXOpeningElement[name.name='textarea']",
          message:
            "Use the design system textarea component instead (ex: @/shared/design-system/textarea).",
        },
      ],
    },
  },
  {
    files: [
      "src/app/**/page.tsx",
      "src/app/**/layout.tsx",
      "src/app/**/loading.tsx",
      "src/app/**/error.tsx",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*", "../../*", "../../../*", "../../../../*"],
              message:
                "Use absolute imports with @/ prefix instead of relative imports from src/",
            },
            {
              group: [
                "@/domains/*/infrastructure/**",
                "@/modules/*/infrastructure/**",
              ],
              message:
                "App route UI files must not import infrastructure directly.",
            },
            {
              group: [
                "@/domains/*/core/usecases/**",
                "@/modules/*/core/usecases/**",
              ],
              message:
                "App route UI files must go through presentation/domain entry points instead of core usecases.",
            },
          ],
        },
      ],
    },
  },
  // No additional restrictions for src/app/**/route.ts on purpose:
  // webhooks and callback handlers legitimately orchestrate infrastructure and usecases.
  {
    files: ["src/**/*.{ts,tsx}", "__tests__/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: forbiddenWorkspaceProjectShimImports,
        },
      ],
    },
  },
  {
    files: forbiddenWorkspaceProjectShimFiles,
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Program",
          message:
            "Workspace-to-project shim removed. Restore the canonical project owner file instead of recreating this compatibility path.",
        },
      ],
    },
  },
  // Import ordering plugin configuration
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      // Disable default sort-imports rule in favor of simple-import-sort
      "sort-imports": "off",
      // Configure import ordering to match project conventions:
      // 1. External libraries (React, Zustand, React Query…)
      // 2. Types / domain (@/domains/project-management/core/domain)
      // 3. Usecases (@/domains/project-management/core/usecases)
      // 4. Infrastructure (@/infrastructure)
      // 5. Presentation (@/presentation)
      // 6. Styles (@/styles)
      // 7. Relative imports
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // External libraries (React, Next.js, etc.)
            ["^react", "^next", "^@?\\w"],
            // Domain types (@/domains/project-management/core/domain)
            ["^@/domains/project-management/core/domain"],
            // Usecases (@/domains/project-management/core/usecases)
            ["^@/domains/project-management/core/usecases"],
            // Infrastructure (@/infrastructure)
            ["^@/infrastructure"],
            // Presentation (@/presentation)
            ["^@/presentation"],
            // Styles (@/styles)
            ["^@/styles"],
            // Shared (@/shared)
            ["^@/shared"],
            // Relative imports
            ["^\\."],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
    },
  },
  // Disable ESLint formatting rules that conflict with Prettier
  // Must be last to override any conflicting rules
  eslintConfigPrettier,
]);

export default eslintConfig;
