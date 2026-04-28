-- Migration: restore missing RLS policies on projects table.
--
-- Context:
-- Production was missing SELECT/UPDATE/DELETE policies on public.projects,
-- which caused workspace project lists to return empty results for authenticated
-- users even when project membership existed.
--
-- This migration is idempotent and safely recreates the expected policies.

DROP POLICY IF EXISTS "Users can view projects where they are members" ON public.projects;
DROP POLICY IF EXISTS "Users can update projects where they have edit permission" ON public.projects;
DROP POLICY IF EXISTS "Only admins can delete projects" ON public.projects;

CREATE POLICY "Users can view projects where they are members"
ON public.projects
FOR SELECT
USING (public.is_project_member(id));

CREATE POLICY "Users can update projects where they have edit permission"
ON public.projects
FOR UPDATE
USING (public.can_edit_project(id))
WITH CHECK (public.can_edit_project(id));

CREATE POLICY "Only admins can delete projects"
ON public.projects
FOR DELETE
USING (public.is_project_admin(id));
