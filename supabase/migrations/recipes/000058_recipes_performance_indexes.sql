-- Step 12: targeted performance indexes for the Recipes critical read paths.
--
-- Goals:
-- - keep catalogue reads fast as persisted data grows
-- - optimize project-scoped ordering and tag filtering
-- - accelerate title search without opening broader search refactors yet

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;

CREATE INDEX IF NOT EXISTS idx_recipes_project_updated_at
  ON public.recipes(project_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_recipe_tag_links_project_tag_recipe
  ON public.recipe_tag_links(project_id, tag_id, recipe_id);

CREATE INDEX IF NOT EXISTS idx_recipes_title_trgm
  ON public.recipes
  USING GIN (title public.gin_trgm_ops);
