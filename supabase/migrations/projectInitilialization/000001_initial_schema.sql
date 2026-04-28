-- Initial schema migration for Workbench
-- Creates all tables, constraints, and indexes for Project, Ticket, Epic, Board, and Column entities
-- This consolidated migration includes:
--   - All table definitions with CHECK constraints
--   - All foreign key and unique constraints
--   - All indexes (including performance indexes)
--   - All triggers for updated_at timestamps
--
-- Note: This migration is idempotent and can be safely applied to fresh databases

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL CHECK (length(trim(name)) > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- BOARDS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS boards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_boards_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Create index on project_id (automatic from UNIQUE constraint, but explicit for clarity)
CREATE INDEX IF NOT EXISTS idx_boards_project_id ON boards(project_id);

-- ============================================================================
-- COLUMNS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS columns (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id uuid NOT NULL,
  name text NOT NULL CHECK (length(trim(name)) > 0),
  status text NOT NULL CHECK (length(trim(status)) > 0),
  position integer NOT NULL DEFAULT 0 CHECK (position >= 0),
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_columns_board FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
  CONSTRAINT uk_columns_board_status UNIQUE (board_id, status),
  CONSTRAINT uk_columns_board_position UNIQUE (board_id, position)
);

-- Create indexes on columns
CREATE INDEX IF NOT EXISTS idx_columns_board_id ON columns(board_id);
CREATE INDEX IF NOT EXISTS idx_columns_position ON columns(position);

-- Add comment to document the visible field
COMMENT ON COLUMN columns.visible IS 'Whether the column is visible in the board. Defaults to true.';

-- ============================================================================
-- EPICS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS epics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL,
  name text NOT NULL CHECK (length(trim(name)) > 0),
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_epics_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Create index on project_id
CREATE INDEX IF NOT EXISTS idx_epics_project_id ON epics(project_id);

-- ============================================================================
-- TICKETS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL,
  title text NOT NULL CHECK (length(trim(title)) > 0),
  description text,
  status text NOT NULL CHECK (length(trim(status)) > 0),
  position integer NOT NULL DEFAULT 0 CHECK (position >= 0),
  epic_id uuid,
  parent_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_tickets_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_tickets_epic FOREIGN KEY (epic_id) REFERENCES epics(id) ON DELETE SET NULL,
  CONSTRAINT fk_tickets_parent FOREIGN KEY (parent_id) REFERENCES tickets(id) ON DELETE CASCADE
);

-- Create indexes on tickets
CREATE INDEX IF NOT EXISTS idx_tickets_project_id ON tickets(project_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_position ON tickets(position);
CREATE INDEX IF NOT EXISTS idx_tickets_epic_id ON tickets(epic_id);
CREATE INDEX IF NOT EXISTS idx_tickets_parent_id ON tickets(parent_id);

-- Composite index for efficient board queries (project + status + position)
CREATE INDEX IF NOT EXISTS idx_tickets_project_status_position ON tickets(project_id, status, position);

-- Composite index for queries filtering tickets by project and epic
-- Used by: TicketRepository.listByProject(projectId, { epicId })
-- Query pattern: SELECT * FROM tickets WHERE project_id = ? AND epic_id = ?
CREATE INDEX IF NOT EXISTS idx_tickets_project_epic ON tickets(project_id, epic_id);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at on all tables
-- Drop triggers if they exist to ensure idempotency
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_boards_updated_at ON boards;
CREATE TRIGGER update_boards_updated_at BEFORE UPDATE ON boards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_columns_updated_at ON columns;
CREATE TRIGGER update_columns_updated_at BEFORE UPDATE ON columns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_epics_updated_at ON epics;
CREATE TRIGGER update_epics_updated_at BEFORE UPDATE ON epics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tickets_updated_at ON tickets;
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
