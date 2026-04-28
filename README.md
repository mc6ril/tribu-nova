## Workbench

**Workbench** is a family-centered daily life OS.

It brings together stable business domains and project-scoped pluggable modules under a single product surface, with multi-user collaboration, role-based permissions, and progressive subscription-based capabilities.

### Website

[https://tribu-nova.vercel.app/](https://tribu-nova.vercel.app/)

### Purpose

Workbench is built around a simple idea:

- a household needs a shared workspace to create or join projects
- each project is a container with members, settings, permissions, and enabled modules
- each enabled module provides one concrete way of working inside that project

Current module:

- **Board** — tickets, comments, Kanban / Jira-like workflow

Future modules:

- **Recipes** — meal planning, recipe base, shopping support
- **Vacation** — trip planning, timeline or board-like planning
- **Budget** — shared expenses, categories, periods

### Core Principles

1. **Family-first**: collaboration, permissions, and shared ownership are built in
2. **Container + modules**: a project is the container; business capabilities inside it are pluggable modules
3. **Clear ownership**: domains own cross-project capabilities, modules own project-scoped workflows
4. **Incremental construction**: one module at a time, without locking the future architecture too early
5. **Clarity over power**: explicit structure, predictable behavior, low cognitive load

### Architecture

Workbench follows a **domain + module architecture**:

```text
src/
  app/                          # Next.js routing only
  domains/
    auth/                       # auth actions only: sign in/up, reset password, verify email, delete account
    session/                    # current identity state: userId, loginEmail, accessToken, claims, auth capabilities
    profile/                    # reusable user business data: displayName, avatar, preferences
    viewer/                     # read-model composition for the current authenticated user
    settings/                   # cross-owner account/settings surfaces
    billing/                    # plans, subscriptions, Stripe checkout/portal/webhooks
    workspace/                  # workspace dashboard: list/create/join projects
    project/                    # project container: settings, members, invitations, enabled modules
  modules/
    board/                      # tickets, comments, board views
    recipes/                    # future project module
    vacation/                   # future project module
    budget/                     # future project module
  shared/
    design-system/              # reusable UI primitives
    i18n/                       # translations and hooks
    observability/              # logger and performance tracking
    infrastructure/
      supabase/                 # browser/server/admin clients
      stripe/                   # stripeClient
      web/                      # rate limit and CSRF
    constants/                  # routes, error codes, feature flags
    types/                      # truly generic types only
    utils/                      # pure helpers with no business ownership
    a11y/                       # accessibility helpers
  styles/
  middleware.ts
```

Inside both domains and modules, responsibilities stay layered:

- **core/domain**: schemas, rules, constants
- **core/ports**: contracts
- **core/usecases**: orchestration
- **infrastructure**: repositories, mappers, gateways
- **presentation**: components, hooks, stores, pages, layouts, navigation

Ownership is explicit:

- `src/app/` stays route-only
- `src/domains/auth/` owns auth mutations and action-oriented flows
- `src/domains/session/` owns current identity state and auth-derived capabilities
- `src/domains/profile/` owns user business data such as display name, avatar, and preferences
- `src/domains/viewer/` owns read-only current-user composition
- `src/domains/settings/` owns cross-owner account/settings surfaces such as `/account`
- `src/domains/workspace/` owns workspace catalog and entry UX to list, join, and reclaim projects
- `src/domains/project/` owns the canonical project entity, project CRUD/governance use cases, and the project container itself
- `src/modules/board/` owns the current Trello/Jira-like module
- `src/shared/` stays cross-cutting and domain-agnostic by default

Import rules are explicit:

- project entity imports target `@/domains/project/core/domain/schema/project.schema`
- project role imports target `@/domains/project/core/domain/schema/projectRole.schema`
- project CRUD imports target `@/domains/project/core/usecases/project/*`
- workspace catalog imports target `@/domains/workspace/core/usecases/project/{listProjects,hasProjectAccess,listProjectsWithStats,listReclaimableProjects}`
- no temporary `workspace -> project` compatibility shims or re-export paths are allowed

Documented exceptions to that default are listed in `docs/architecture/accepted-exceptions.md`:

- owner-local low-level Supabase row types in each `src/domains/*/infrastructure/supabase/types.ts` and `src/modules/*/infrastructure/supabase/types.ts`
- public/static app-level pages in `src/presentation/pages/`

### Development Strategy

Each feature is implemented as a complete vertical slice (UI + use case + domain logic + persistence).

Current build order stays pragmatic:

1. Authentication and workspace entry flows
2. Project container and access model
3. Board module (ticket CRUD)
4. Board columns configuration
5. Drag and drop workflow
6. Ticket detail and comments
7. Future modules (`recipes`, `vacation`, `budget`)

### Testing

- Run unit tests once: `yarn test`
- Run unit tests in watch mode: `yarn test:watch`

Tests live under the project root `__tests__/` directory (mirroring the `src/` structure), with shared mocks under `__mocks__/`. This setup is powered by Jest with TypeScript support (`ts-jest`), following the architecture-aware testing rules described in `.cursor/docs/testing.md`.

### Success Criteria

Workbench is successful if:

- it replaces ad-hoc notes and mental tracking
- projects stay understandable even as new modules are added
- module boundaries remain explicit and easy to evolve
- the system stays calm, predictable, and easy to resume after time away
