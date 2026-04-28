-- Persist the Recipes module in Supabase with project-scoped tables and RLS.
--
-- Step 5 goals:
-- - collaborative, project-scoped data from the start
-- - minimal schema that still supports catalogue, detail, quick list, shopping,
--   creation and edition screens
-- - no advanced realtime/conflict management yet

CREATE TABLE IF NOT EXISTS public.recipes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (length(trim(title)) > 0),
  summary text NOT NULL DEFAULT '',
  total_time_minutes integer CHECK (
    total_time_minutes IS NULL OR total_time_minutes >= 0
  ),
  total_time_label text NOT NULL DEFAULT '',
  servings_count integer CHECK (
    servings_count IS NULL OR servings_count > 0
  ),
  servings_label text NOT NULL DEFAULT '',
  note text,
  cover_image_url text,
  cover_style text NOT NULL DEFAULT 'neutral' CHECK (
    cover_style IN ('citrus', 'tomato', 'green', 'gold', 'plum', 'neutral', 'sage')
  ),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uk_recipes_id_project UNIQUE (id, project_id)
);

CREATE TABLE IF NOT EXISTS public.recipe_steps (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  recipe_id uuid NOT NULL,
  position integer NOT NULL CHECK (position > 0),
  title text,
  instruction text NOT NULL CHECK (length(trim(instruction)) > 0),
  notes text,
  meta text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_recipe_steps_recipe
    FOREIGN KEY (recipe_id, project_id)
    REFERENCES public.recipes(id, project_id)
    ON DELETE CASCADE,
  CONSTRAINT uk_recipe_steps_recipe_position UNIQUE (project_id, recipe_id, position),
  CONSTRAINT uk_recipe_steps_id_project UNIQUE (id, project_id)
);

CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  recipe_id uuid NOT NULL,
  position integer NOT NULL CHECK (position > 0),
  display_name text NOT NULL CHECK (length(trim(display_name)) > 0),
  normalized_name text NOT NULL CHECK (length(trim(normalized_name)) > 0),
  amount_value numeric(10, 3) CHECK (
    amount_value IS NULL OR amount_value > 0
  ),
  amount_text text,
  unit text,
  notes text,
  kind text NOT NULL DEFAULT 'validated' CHECK (
    kind IN ('validated', 'addition_candidate')
  ),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_recipe_ingredients_recipe
    FOREIGN KEY (recipe_id, project_id)
    REFERENCES public.recipes(id, project_id)
    ON DELETE CASCADE,
  CONSTRAINT uk_recipe_ingredients_recipe_position UNIQUE (project_id, recipe_id, position),
  CONSTRAINT uk_recipe_ingredients_id_project UNIQUE (id, project_id)
);

CREATE TABLE IF NOT EXISTS public.recipe_tags (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  label text NOT NULL CHECK (length(trim(label)) > 0),
  slug text NOT NULL CHECK (length(trim(slug)) > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uk_recipe_tags_project_slug UNIQUE (project_id, slug),
  CONSTRAINT uk_recipe_tags_id_project UNIQUE (id, project_id)
);

CREATE TABLE IF NOT EXISTS public.recipe_tag_links (
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  recipe_id uuid NOT NULL,
  tag_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pk_recipe_tag_links PRIMARY KEY (project_id, recipe_id, tag_id),
  CONSTRAINT fk_recipe_tag_links_recipe
    FOREIGN KEY (recipe_id, project_id)
    REFERENCES public.recipes(id, project_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_recipe_tag_links_tag
    FOREIGN KEY (tag_id, project_id)
    REFERENCES public.recipe_tags(id, project_id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.recipe_selections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  recipe_id uuid NOT NULL,
  position integer NOT NULL DEFAULT 0 CHECK (position >= 0),
  note text,
  servings_count integer CHECK (
    servings_count IS NULL OR servings_count > 0
  ),
  servings_label text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_recipe_selections_recipe
    FOREIGN KEY (recipe_id, project_id)
    REFERENCES public.recipes(id, project_id)
    ON DELETE CASCADE,
  CONSTRAINT uk_recipe_selections_project_recipe UNIQUE (project_id, recipe_id),
  CONSTRAINT uk_recipe_selections_id_project UNIQUE (id, project_id)
);

CREATE TABLE IF NOT EXISTS public.shopping_lists (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uk_shopping_lists_id_project UNIQUE (id, project_id)
);

CREATE TABLE IF NOT EXISTS public.shopping_list_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  shopping_list_id uuid NOT NULL,
  group_id text NOT NULL CHECK (length(trim(group_id)) > 0),
  group_title text NOT NULL CHECK (length(trim(group_title)) > 0),
  position integer NOT NULL DEFAULT 0 CHECK (position >= 0),
  display_name text NOT NULL CHECK (length(trim(display_name)) > 0),
  normalized_name text NOT NULL CHECK (length(trim(normalized_name)) > 0),
  amount_value numeric(10, 3) CHECK (
    amount_value IS NULL OR amount_value > 0
  ),
  amount_text text,
  unit text,
  notes text,
  ingredient_kind text NOT NULL DEFAULT 'validated' CHECK (
    ingredient_kind IN ('validated', 'addition_candidate')
  ),
  checked boolean NOT NULL DEFAULT false,
  recipe_sources jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (
    jsonb_typeof(recipe_sources) = 'array'
  ),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_shopping_list_items_list
    FOREIGN KEY (shopping_list_id, project_id)
    REFERENCES public.shopping_lists(id, project_id)
    ON DELETE CASCADE,
  CONSTRAINT uk_shopping_list_items_group_position UNIQUE (
    project_id,
    shopping_list_id,
    group_id,
    position
  )
);

CREATE INDEX IF NOT EXISTS idx_recipes_project_id
  ON public.recipes(project_id);

CREATE INDEX IF NOT EXISTS idx_recipe_steps_recipe_position
  ON public.recipe_steps(project_id, recipe_id, position);

CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_position
  ON public.recipe_ingredients(project_id, recipe_id, position);

CREATE INDEX IF NOT EXISTS idx_recipe_tags_project_slug
  ON public.recipe_tags(project_id, slug);

CREATE INDEX IF NOT EXISTS idx_recipe_tag_links_project_tag
  ON public.recipe_tag_links(project_id, tag_id);

CREATE INDEX IF NOT EXISTS idx_recipe_selections_project_position
  ON public.recipe_selections(project_id, position);

CREATE INDEX IF NOT EXISTS idx_shopping_list_items_list_position
  ON public.shopping_list_items(project_id, shopping_list_id, group_id, position);

DROP TRIGGER IF EXISTS update_recipes_updated_at ON public.recipes;
CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_recipe_steps_updated_at ON public.recipe_steps;
CREATE TRIGGER update_recipe_steps_updated_at
  BEFORE UPDATE ON public.recipe_steps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_recipe_ingredients_updated_at ON public.recipe_ingredients;
CREATE TRIGGER update_recipe_ingredients_updated_at
  BEFORE UPDATE ON public.recipe_ingredients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_recipe_tags_updated_at ON public.recipe_tags;
CREATE TRIGGER update_recipe_tags_updated_at
  BEFORE UPDATE ON public.recipe_tags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_recipe_selections_updated_at ON public.recipe_selections;
CREATE TRIGGER update_recipe_selections_updated_at
  BEFORE UPDATE ON public.recipe_selections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_shopping_lists_updated_at ON public.shopping_lists;
CREATE TRIGGER update_shopping_lists_updated_at
  BEFORE UPDATE ON public.shopping_lists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_shopping_list_items_updated_at ON public.shopping_list_items;
CREATE TRIGGER update_shopping_list_items_updated_at
  BEFORE UPDATE ON public.shopping_list_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_tag_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Recipes members can view" ON public.recipes;
DROP POLICY IF EXISTS "Recipes editors can insert" ON public.recipes;
DROP POLICY IF EXISTS "Recipes editors can update" ON public.recipes;
DROP POLICY IF EXISTS "Recipes editors can delete" ON public.recipes;
CREATE POLICY "Recipes members can view"
ON public.recipes
FOR SELECT
USING ((select public.is_project_member(project_id)));
CREATE POLICY "Recipes editors can insert"
ON public.recipes
FOR INSERT
WITH CHECK ((select public.can_edit_project(project_id)));
CREATE POLICY "Recipes editors can update"
ON public.recipes
FOR UPDATE
USING ((select public.can_edit_project(project_id)))
WITH CHECK ((select public.can_edit_project(project_id)));
CREATE POLICY "Recipes editors can delete"
ON public.recipes
FOR DELETE
USING ((select public.can_edit_project(project_id)));

DROP POLICY IF EXISTS "Recipe steps members can view" ON public.recipe_steps;
DROP POLICY IF EXISTS "Recipe steps editors can insert" ON public.recipe_steps;
DROP POLICY IF EXISTS "Recipe steps editors can update" ON public.recipe_steps;
DROP POLICY IF EXISTS "Recipe steps editors can delete" ON public.recipe_steps;
CREATE POLICY "Recipe steps members can view"
ON public.recipe_steps
FOR SELECT
USING ((select public.is_project_member(project_id)));
CREATE POLICY "Recipe steps editors can insert"
ON public.recipe_steps
FOR INSERT
WITH CHECK ((select public.can_edit_project(project_id)));
CREATE POLICY "Recipe steps editors can update"
ON public.recipe_steps
FOR UPDATE
USING ((select public.can_edit_project(project_id)))
WITH CHECK ((select public.can_edit_project(project_id)));
CREATE POLICY "Recipe steps editors can delete"
ON public.recipe_steps
FOR DELETE
USING ((select public.can_edit_project(project_id)));

DROP POLICY IF EXISTS "Recipe ingredients members can view" ON public.recipe_ingredients;
DROP POLICY IF EXISTS "Recipe ingredients editors can insert" ON public.recipe_ingredients;
DROP POLICY IF EXISTS "Recipe ingredients editors can update" ON public.recipe_ingredients;
DROP POLICY IF EXISTS "Recipe ingredients editors can delete" ON public.recipe_ingredients;
CREATE POLICY "Recipe ingredients members can view"
ON public.recipe_ingredients
FOR SELECT
USING ((select public.is_project_member(project_id)));
CREATE POLICY "Recipe ingredients editors can insert"
ON public.recipe_ingredients
FOR INSERT
WITH CHECK ((select public.can_edit_project(project_id)));
CREATE POLICY "Recipe ingredients editors can update"
ON public.recipe_ingredients
FOR UPDATE
USING ((select public.can_edit_project(project_id)))
WITH CHECK ((select public.can_edit_project(project_id)));
CREATE POLICY "Recipe ingredients editors can delete"
ON public.recipe_ingredients
FOR DELETE
USING ((select public.can_edit_project(project_id)));

DROP POLICY IF EXISTS "Recipe tags members can view" ON public.recipe_tags;
DROP POLICY IF EXISTS "Recipe tags editors can insert" ON public.recipe_tags;
DROP POLICY IF EXISTS "Recipe tags editors can update" ON public.recipe_tags;
DROP POLICY IF EXISTS "Recipe tags editors can delete" ON public.recipe_tags;
CREATE POLICY "Recipe tags members can view"
ON public.recipe_tags
FOR SELECT
USING ((select public.is_project_member(project_id)));
CREATE POLICY "Recipe tags editors can insert"
ON public.recipe_tags
FOR INSERT
WITH CHECK ((select public.can_edit_project(project_id)));
CREATE POLICY "Recipe tags editors can update"
ON public.recipe_tags
FOR UPDATE
USING ((select public.can_edit_project(project_id)))
WITH CHECK ((select public.can_edit_project(project_id)));
CREATE POLICY "Recipe tags editors can delete"
ON public.recipe_tags
FOR DELETE
USING ((select public.can_edit_project(project_id)));

DROP POLICY IF EXISTS "Recipe tag links members can view" ON public.recipe_tag_links;
DROP POLICY IF EXISTS "Recipe tag links editors can insert" ON public.recipe_tag_links;
DROP POLICY IF EXISTS "Recipe tag links editors can update" ON public.recipe_tag_links;
DROP POLICY IF EXISTS "Recipe tag links editors can delete" ON public.recipe_tag_links;
CREATE POLICY "Recipe tag links members can view"
ON public.recipe_tag_links
FOR SELECT
USING ((select public.is_project_member(project_id)));
CREATE POLICY "Recipe tag links editors can insert"
ON public.recipe_tag_links
FOR INSERT
WITH CHECK ((select public.can_edit_project(project_id)));
CREATE POLICY "Recipe tag links editors can update"
ON public.recipe_tag_links
FOR UPDATE
USING ((select public.can_edit_project(project_id)))
WITH CHECK ((select public.can_edit_project(project_id)));
CREATE POLICY "Recipe tag links editors can delete"
ON public.recipe_tag_links
FOR DELETE
USING ((select public.can_edit_project(project_id)));

DROP POLICY IF EXISTS "Recipe selections members can view" ON public.recipe_selections;
DROP POLICY IF EXISTS "Recipe selections editors can insert" ON public.recipe_selections;
DROP POLICY IF EXISTS "Recipe selections editors can update" ON public.recipe_selections;
DROP POLICY IF EXISTS "Recipe selections editors can delete" ON public.recipe_selections;
CREATE POLICY "Recipe selections members can view"
ON public.recipe_selections
FOR SELECT
USING ((select public.is_project_member(project_id)));
CREATE POLICY "Recipe selections editors can insert"
ON public.recipe_selections
FOR INSERT
WITH CHECK ((select public.can_edit_project(project_id)));
CREATE POLICY "Recipe selections editors can update"
ON public.recipe_selections
FOR UPDATE
USING ((select public.can_edit_project(project_id)))
WITH CHECK ((select public.can_edit_project(project_id)));
CREATE POLICY "Recipe selections editors can delete"
ON public.recipe_selections
FOR DELETE
USING ((select public.can_edit_project(project_id)));

DROP POLICY IF EXISTS "Shopping lists members can view" ON public.shopping_lists;
DROP POLICY IF EXISTS "Shopping lists editors can insert" ON public.shopping_lists;
DROP POLICY IF EXISTS "Shopping lists editors can update" ON public.shopping_lists;
DROP POLICY IF EXISTS "Shopping lists editors can delete" ON public.shopping_lists;
CREATE POLICY "Shopping lists members can view"
ON public.shopping_lists
FOR SELECT
USING ((select public.is_project_member(project_id)));
CREATE POLICY "Shopping lists editors can insert"
ON public.shopping_lists
FOR INSERT
WITH CHECK ((select public.can_edit_project(project_id)));
CREATE POLICY "Shopping lists editors can update"
ON public.shopping_lists
FOR UPDATE
USING ((select public.can_edit_project(project_id)))
WITH CHECK ((select public.can_edit_project(project_id)));
CREATE POLICY "Shopping lists editors can delete"
ON public.shopping_lists
FOR DELETE
USING ((select public.can_edit_project(project_id)));

DROP POLICY IF EXISTS "Shopping list items members can view" ON public.shopping_list_items;
DROP POLICY IF EXISTS "Shopping list items editors can insert" ON public.shopping_list_items;
DROP POLICY IF EXISTS "Shopping list items editors can update" ON public.shopping_list_items;
DROP POLICY IF EXISTS "Shopping list items editors can delete" ON public.shopping_list_items;
CREATE POLICY "Shopping list items members can view"
ON public.shopping_list_items
FOR SELECT
USING ((select public.is_project_member(project_id)));
CREATE POLICY "Shopping list items editors can insert"
ON public.shopping_list_items
FOR INSERT
WITH CHECK ((select public.can_edit_project(project_id)));
CREATE POLICY "Shopping list items editors can update"
ON public.shopping_list_items
FOR UPDATE
USING ((select public.can_edit_project(project_id)))
WITH CHECK ((select public.can_edit_project(project_id)));
CREATE POLICY "Shopping list items editors can delete"
ON public.shopping_list_items
FOR DELETE
USING ((select public.can_edit_project(project_id)));
