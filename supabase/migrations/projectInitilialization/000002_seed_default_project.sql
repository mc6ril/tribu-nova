-- Seed data migration for Workbench
-- Inserts default project, board, and columns for initial setup
-- This migration is idempotent and safe to re-run

-- ============================================================================
-- DEFAULT PROJECT
-- ============================================================================

-- Insert default project using a fixed UUID for idempotency
-- If the project already exists, this will do nothing due to ON CONFLICT
INSERT INTO projects (id, name, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'My Workbench',
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    updated_at = now()
WHERE projects.name != EXCLUDED.name;

-- ============================================================================
-- DEFAULT BOARD
-- ============================================================================

-- Insert default board linked to the default project
INSERT INTO boards (id, project_id, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- DEFAULT COLUMNS
-- ============================================================================

-- Insert default columns for the board
-- Using fixed UUIDs for idempotency
-- Status values: 'todo', 'in_progress', 'done'
-- These status values will be used in tickets.status

INSERT INTO columns (id, board_id, name, status, position, visible, created_at, updated_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000002',
    'To Do',
    'todo',
    0,
    true,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000002',
    'In Progress',
    'in_progress',
    1,
    true,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000012',
    '00000000-0000-0000-0000-000000000002',
    'Done',
    'done',
    2,
    true,
    now(),
    now()
  )
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  position = EXCLUDED.position,
  visible = EXCLUDED.visible,
  updated_at = now();
