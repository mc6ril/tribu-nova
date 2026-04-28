# Observability System

Centralized logging system following Clean Architecture principles with structured JSON logging, scoped loggers, and error handling.

## Architecture

- **Port**: `shared/observability/logger.port.ts` - Pure TypeScript interfaces (no dependencies)
- **Implementation**: `shared/observability/` - JSON console logger (no React dependencies)
- **Composition Root**: `shared/observability/` - Logger factory and implementations

## Usage

### Dependency Injection in Usecases

Usecases receive `loggerFactory` as a parameter:

```typescript
import type { LoggerFactory } from "@/shared/observability/logger.port";
import type { ProjectGateway } from "@/domains/project/core/ports/project.gateway";

export async function createProject(
  repo: ProjectGateway,
  loggerFactory: LoggerFactory,
  input: CreateProjectInput
): Promise<Project> {
  const logger = loggerFactory.forScope("project", { action: "createProject" });

  logger.info("Creating project", { name: input.name });

  try {
    const project = await repo.create(input);
    logger.info("Project created", { projectId: project.id });
    return project;
  } catch (error) {
    logger.error("Failed to create project", { error, input });
    throw error;
  }
}
```

### Creating Scoped Loggers

Use `loggerFactory.forScope()` to create loggers for specific features or screens:

```typescript
import { createLoggerFactory } from "@/shared/observability";

const loggerFactory = createLoggerFactory();

const logger = loggerFactory.forScope("workspace");
logger.info("Loading workspace");
```

### Child Loggers

Use `logger.child()` to create nested loggers with additional scope:

```typescript
const logger = loggerFactory.forScope("workspace");
const childLogger = logger.child("project-list", { userId: "123" });

childLogger.debug("Loading projects");
// Logs with scope: "workspace.project-list"
```

### Scope Naming Conventions

- **Feature/Screen names**: Use kebab-case for feature or screen names
  - `"workspace"` - Workspace screen
  - `"project"` - Project screen
  - `"auth"` - Authentication flows

- **Hierarchical scopes**: Use dot separator for nested scopes
  - `"project.board"` - Board view within project
  - `"project.ticket-detail"` - Ticket detail view within project
  - `"auth.signin"` - Sign in flow

- **Scope segments**: Each segment should be kebab-case
  - ✅ `"workspace"`, `"project-board"`, `"auth-signin"`
  - ❌ `"workspace"`, `"projectBoard"`, `"auth_signin"`

### Error Logging

Errors in metadata are automatically extracted to structured format:

```typescript
try {
  await someOperation();
} catch (error) {
  logger.error("Operation failed", { error, context: "someContext" });
  // Error is extracted to structured error field, removed from meta
}
```

### TraceId Support

Include `traceId` in metadata for request tracing:

```typescript
const logger = loggerFactory.forScope("auth", { traceId: "req-123" });

logger.info("Processing request");
// traceId is included in structured log output
```

### Base Metadata

Provide base metadata that is merged with all log calls:

```typescript
const logger = loggerFactory.forScope("workspace", {
  userId: "123",
  sessionId: "abc-456",
});

logger.info("Action performed", { action: "create" });
// Log includes: { userId: "123", sessionId: "abc-456", action: "create" }
```

## Configuration

### Environment Variables

- `NODE_ENV`: Used for environment detection (development/production)
- `NEXT_PUBLIC_LOG_LEVEL`: Optional, overrides default log level
  - Valid values: `"debug"`, `"info"`, `"warn"`, `"error"`
  - Default: `"debug"` (development), `"info"` (production)

### Log Level Filtering

- `debug`: Only in development (default) or if explicitly set
- `info`: Default in production, also in development
- `warn`: Always logged (info level and above)
- `error`: Always logged (all levels)

## Features

### Safe JSON Serialization

- Handles circular references gracefully
- Converts BigInt to string
- Converts functions to `[Function]`
- Never throws - always returns valid JSON string

### Meta Sanitization

- Removes `undefined` values
- Converts `Date` to ISO string
- Converts `Error` to structured format `{ name, message, stack? }`
- Ensures all values are JSON-safe

### Sensitive Data Redaction

The following keys are automatically redacted (case-insensitive):

- `password`
- `token`
- `access_token`
- `refresh_token`
- `authorization`
- `cookie`
- `set-cookie`

Redacted values appear as `"[REDACTED]"` in logs.

### Error Extraction

If `meta.error` is an `Error` instance:

- Extracted to structured `error` field: `{ name, message, stack? }`
- Removed from `meta` to avoid duplication
- Included in JSON output

## Structured Log Format

```json
{
  "timestamp": "2025-01-27T21:00:00.000Z",
  "level": "info",
  "scope": "workspace",
  "message": "Creating project",
  "meta": {
    "userId": "123",
    "action": "create"
  },
  "error": {
    "name": "Error",
    "message": "Something went wrong",
    "stack": "Error: Something went wrong\n    at ..."
  },
  "traceId": "req-123"
}
```

## Best Practices

1. **Use scoped loggers**: Create loggers for each feature/screen
2. **Include context**: Add relevant metadata to log calls
3. **Use child loggers**: For nested operations within a feature
4. **Error logging**: Always include error in meta for proper extraction
5. **TraceId**: Include traceId in baseMeta for request tracing
6. **Avoid sensitive data**: System redacts common sensitive keys, but be mindful

## Clean Architecture Compliance

- **Port** (`shared/observability/logger.port.ts`): No dependencies, pure interfaces
- **Implementation** (`shared/observability/`): Implements port, no React imports
- **Composition Root**: Callers create a factory with `createLoggerFactory()` and inject/use scoped loggers
- **Usecases**: Receive `loggerFactory` as parameter (dependency injection)
- **No direct imports**: Usecases don't import singleton directly
