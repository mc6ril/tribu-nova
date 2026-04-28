# Database Migrations

This directory contains SQL migration files for the Workbench database schema.

## Migration Files

Migrations are numbered sequentially and applied in order:

### Core Migrations (Required)

- `000001_initial_schema.sql` - **Consolidated initial database schema** - Creates all tables, constraints (including string length validation), indexes (including performance indexes), triggers, and includes the `visible` field on columns table. This migration combines elements from the original 000001, 000008, 000009, and 000010 migrations into a single, well-organized initial schema migration for fresh database setups.
- `000002_seed_default_project.sql` - Inserts default project, board, and columns (seed data)
- `000003_add_project_members_and_rls.sql` - Adds project_members table and Row Level Security policies
- `000004_auto_add_creator_as_admin.sql` - Auto-adds project creator as admin via trigger
- `000005_allow_users_to_add_themselves_as_viewer.sql` - Allows authenticated users to add themselves as viewer to projects

### Project Creation Fix

- `000006_fix_project_creation_rls.sql` - Fixes RLS policies for project creation (ensures permissions and working policies)
- `000007_bypass_rls_with_function.sql` - Creates SECURITY DEFINER functions to bypass RLS for project creation

## Running Migrations

See [docs/supabase/migrations.md](../../docs/supabase/migrations.md) for detailed instructions on running migrations.

Quick start:

```bash
# Using Supabase CLI (applies both schema and seed migrations)
supabase db push

# Or manually via Supabase Dashboard SQL Editor
# Copy and paste migration SQL files in order
```

## Seed Data

The seed migration (`000002_seed_default_project.sql`) creates:

- Default project: "My Workbench"
- Default board linked to the project
- Three default columns: "To Do", "In Progress", "Done" (all with `visible = true`)

The seed migration is **idempotent** - safe to run multiple times. See [docs/supabase/migrations.md](../../docs/supabase/migrations.md) for more details.

## Consolidated Initial Schema

The `000001_initial_schema.sql` migration is a consolidated migration that includes:

- **Tables**: projects, boards, columns, epics, tickets
- **Constraints**:
  - All foreign key constraints
  - All unique constraints
  - All CHECK constraints (position >= 0, string length validation for non-empty fields)
- **Indexes**:
  - All single-column indexes
  - All composite indexes (including `idx_tickets_project_epic` for performance)
- **Triggers**:
  - `update_updated_at_column()` function
  - All `updated_at` triggers for automatic timestamp updates
- **Features**:
  - `visible` field on columns table (default: true)

This consolidated migration makes it easier to set up fresh databases with the complete schema in a single step. The migration is idempotent and can be safely applied multiple times.

Later forward migrations intentionally remove legacy planning tables from the effective schema. Use `docs/supabase/database-schema.md` for the current post-migration shape.

## Creating New Migrations

1. Create a new file using the next available prefix: `0000NN_descriptive_name.sql`
2. Write idempotent SQL (use `IF NOT EXISTS`, `IF EXISTS`)
3. Test on a clean database
4. Apply using one of the methods above

See [docs/supabase/migrations.md](../../docs/supabase/migrations.md) for best practices.
