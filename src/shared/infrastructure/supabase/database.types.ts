export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: {
    Tables: {
      app_runtime_config: {
        Row: {
          key: string;
          updated_at: string;
          value: Json;
        };
        Insert: {
          key: string;
          updated_at?: string;
          value: Json;
        };
        Update: {
          key?: string;
          updated_at?: string;
          value?: Json;
        };
        Relationships: [];
      };
      boards: {
        Row: {
          created_at: string;
          id: string;
          project_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          project_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          project_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_boards_project";
            columns: ["project_id"];
            isOneToOne: true;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      columns: {
        Row: {
          board_id: string;
          created_at: string;
          id: string;
          key: string;
          name: string;
          position: number;
          state: string;
          updated_at: string;
          visible: boolean;
        };
        Insert: {
          board_id: string;
          created_at?: string;
          id?: string;
          key: string;
          name: string;
          position?: number;
          state?: string;
          updated_at?: string;
          visible?: boolean;
        };
        Update: {
          board_id?: string;
          created_at?: string;
          id?: string;
          key?: string;
          name?: string;
          position?: number;
          state?: string;
          updated_at?: string;
          visible?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "fk_columns_board";
            columns: ["board_id"];
            isOneToOne: false;
            referencedRelation: "boards";
            referencedColumns: ["id"];
          },
        ];
      };
      comments: {
        Row: {
          author_id: string;
          content: string;
          created_at: string;
          id: string;
          project_id: string;
          ticket_id: string;
          updated_at: string;
        };
        Insert: {
          author_id: string;
          content: string;
          created_at?: string;
          id?: string;
          project_id: string;
          ticket_id: string;
          updated_at?: string;
        };
        Update: {
          author_id?: string;
          content?: string;
          created_at?: string;
          id?: string;
          project_id?: string;
          ticket_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_ticket_id_fkey";
            columns: ["ticket_id"];
            isOneToOne: false;
            referencedRelation: "tickets";
            referencedColumns: ["id"];
          },
        ];
      };
      project_invitations: {
        Row: {
          created_at: string;
          expires_at: string;
          id: string;
          invited_by: string;
          project_id: string;
          role: string;
          status: string;
          token: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          expires_at?: string;
          id?: string;
          invited_by: string;
          project_id: string;
          role?: string;
          status?: string;
          token?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          expires_at?: string;
          id?: string;
          invited_by?: string;
          project_id?: string;
          role?: string;
          status?: string;
          token?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_invitations_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      project_members: {
        Row: {
          created_at: string;
          id: string;
          project_id: string;
          role: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          project_id: string;
          role: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          project_id?: string;
          role?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_project_members_project";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          board_emoji: string;
          created_at: string;
          creator_email: string | null;
          enabled_modules: string[];
          id: string;
          name: string;
          orphaned_at: string | null;
          short_code: string;
          updated_at: string;
        };
        Insert: {
          board_emoji?: string;
          created_at?: string;
          creator_email?: string | null;
          enabled_modules?: string[];
          id?: string;
          name: string;
          orphaned_at?: string | null;
          short_code: string;
          updated_at?: string;
        };
        Update: {
          board_emoji?: string;
          created_at?: string;
          creator_email?: string | null;
          enabled_modules?: string[];
          id?: string;
          name?: string;
          orphaned_at?: string | null;
          short_code?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      recipe_ingredients: {
        Row: {
          amount_text: string | null;
          amount_value: number | null;
          created_at: string;
          display_name: string;
          id: string;
          kind: string;
          normalized_name: string;
          notes: string | null;
          position: number;
          project_id: string;
          recipe_id: string;
          unit: string | null;
          updated_at: string;
        };
        Insert: {
          amount_text?: string | null;
          amount_value?: number | null;
          created_at?: string;
          display_name: string;
          id?: string;
          kind?: string;
          normalized_name: string;
          notes?: string | null;
          position: number;
          project_id: string;
          recipe_id: string;
          unit?: string | null;
          updated_at?: string;
        };
        Update: {
          amount_text?: string | null;
          amount_value?: number | null;
          created_at?: string;
          display_name?: string;
          id?: string;
          kind?: string;
          normalized_name?: string;
          notes?: string | null;
          position?: number;
          project_id?: string;
          recipe_id?: string;
          unit?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_recipe_ingredients_recipe";
            columns: ["recipe_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "recipe_ingredients_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      recipe_selections: {
        Row: {
          created_at: string;
          id: string;
          note: string | null;
          position: number;
          project_id: string;
          recipe_id: string;
          servings_count: number | null;
          servings_label: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          note?: string | null;
          position?: number;
          project_id: string;
          recipe_id: string;
          servings_count?: number | null;
          servings_label?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          note?: string | null;
          position?: number;
          project_id?: string;
          recipe_id?: string;
          servings_count?: number | null;
          servings_label?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_recipe_selections_recipe";
            columns: ["recipe_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "recipe_selections_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      recipe_steps: {
        Row: {
          created_at: string;
          id: string;
          instruction: string;
          meta: string | null;
          notes: string | null;
          position: number;
          project_id: string;
          recipe_id: string;
          title: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          instruction: string;
          meta?: string | null;
          notes?: string | null;
          position: number;
          project_id: string;
          recipe_id: string;
          title?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          instruction?: string;
          meta?: string | null;
          notes?: string | null;
          position?: number;
          project_id?: string;
          recipe_id?: string;
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_recipe_steps_recipe";
            columns: ["recipe_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "recipe_steps_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      recipe_tag_links: {
        Row: {
          created_at: string;
          project_id: string;
          recipe_id: string;
          tag_id: string;
        };
        Insert: {
          created_at?: string;
          project_id: string;
          recipe_id: string;
          tag_id: string;
        };
        Update: {
          created_at?: string;
          project_id?: string;
          recipe_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_recipe_tag_links_recipe";
            columns: ["recipe_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "fk_recipe_tag_links_tag";
            columns: ["tag_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "recipe_tags";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "recipe_tag_links_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      recipe_tags: {
        Row: {
          created_at: string;
          id: string;
          label: string;
          project_id: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          label: string;
          project_id: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          label?: string;
          project_id?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_tags_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      recipes: {
        Row: {
          cover_image_url: string | null;
          cover_style: string;
          created_at: string;
          id: string;
          note: string | null;
          project_id: string;
          servings_count: number | null;
          servings_label: string;
          summary: string;
          title: string;
          total_time_label: string;
          total_time_minutes: number | null;
          updated_at: string;
        };
        Insert: {
          cover_image_url?: string | null;
          cover_style?: string;
          created_at?: string;
          id?: string;
          note?: string | null;
          project_id: string;
          servings_count?: number | null;
          servings_label?: string;
          summary?: string;
          title: string;
          total_time_label?: string;
          total_time_minutes?: number | null;
          updated_at?: string;
        };
        Update: {
          cover_image_url?: string | null;
          cover_style?: string;
          created_at?: string;
          id?: string;
          note?: string | null;
          project_id?: string;
          servings_count?: number | null;
          servings_label?: string;
          summary?: string;
          title?: string;
          total_time_label?: string;
          total_time_minutes?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recipes_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      shopping_list_items: {
        Row: {
          amount_text: string | null;
          amount_value: number | null;
          checked: boolean;
          created_at: string;
          display_name: string;
          group_id: string;
          group_title: string;
          id: string;
          ingredient_kind: string;
          normalized_name: string;
          notes: string | null;
          position: number;
          project_id: string;
          recipe_sources: Json;
          shopping_list_id: string;
          unit: string | null;
          updated_at: string;
        };
        Insert: {
          amount_text?: string | null;
          amount_value?: number | null;
          checked?: boolean;
          created_at?: string;
          display_name: string;
          group_id: string;
          group_title: string;
          id?: string;
          ingredient_kind?: string;
          normalized_name: string;
          notes?: string | null;
          position?: number;
          project_id: string;
          recipe_sources?: Json;
          shopping_list_id: string;
          unit?: string | null;
          updated_at?: string;
        };
        Update: {
          amount_text?: string | null;
          amount_value?: number | null;
          checked?: boolean;
          created_at?: string;
          display_name?: string;
          group_id?: string;
          group_title?: string;
          id?: string;
          ingredient_kind?: string;
          normalized_name?: string;
          notes?: string | null;
          position?: number;
          project_id?: string;
          recipe_sources?: Json;
          shopping_list_id?: string;
          unit?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_shopping_list_items_list";
            columns: ["shopping_list_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "shopping_lists";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "shopping_list_items_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      shopping_lists: {
        Row: {
          created_at: string;
          id: string;
          project_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          project_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          project_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shopping_lists_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: true;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean;
          created_at: string;
          current_period_end: string | null;
          current_period_start: string | null;
          id: string;
          plan: string;
          status: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          cancel_at_period_end?: boolean;
          created_at?: string;
          current_period_end?: string | null;
          current_period_start?: string | null;
          id?: string;
          plan?: string;
          status?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          cancel_at_period_end?: boolean;
          created_at?: string;
          current_period_end?: string | null;
          current_period_start?: string | null;
          id?: string;
          plan?: string;
          status?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      ticket_assignees: {
        Row: {
          assigned_at: string;
          assigned_by: string | null;
          id: string;
          project_id: string;
          ticket_id: string;
          user_id: string;
        };
        Insert: {
          assigned_at?: string;
          assigned_by?: string | null;
          id?: string;
          project_id: string;
          ticket_id: string;
          user_id: string;
        };
        Update: {
          assigned_at?: string;
          assigned_by?: string | null;
          id?: string;
          project_id?: string;
          ticket_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ticket_assignees_ticket_id_fkey";
            columns: ["ticket_id"];
            isOneToOne: false;
            referencedRelation: "tickets";
            referencedColumns: ["id"];
          },
        ];
      };
      tickets: {
        Row: {
          archived_at: string | null;
          archived_week_start: string | null;
          code_number: number;
          column_id: string;
          completed_at: string | null;
          created_at: string;
          created_by: string | null;
          description: string | null;
          due_date: string | null;
          id: string;
          position: number;
          priority: string | null;
          project_id: string;
          story_points: number | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          archived_at?: string | null;
          archived_week_start?: string | null;
          code_number: number;
          column_id: string;
          completed_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          position?: number;
          priority?: string | null;
          project_id: string;
          story_points?: number | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          archived_at?: string | null;
          archived_week_start?: string | null;
          code_number?: number;
          column_id?: string;
          completed_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          position?: number;
          priority?: string | null;
          project_id?: string;
          story_points?: number | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_tickets_column";
            columns: ["column_id"];
            isOneToOne: false;
            referencedRelation: "columns";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fk_tickets_project";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      user_profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string | null;
          email: string;
          id: string;
          preferences: Json;
          terms_accepted_at: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          email: string;
          id: string;
          preferences?: Json;
          terms_accepted_at?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          email?: string;
          id?: string;
          preferences?: Json;
          terms_accepted_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_invitation: {
        Args: { invitation_token: string };
        Returns: {
          project_id: string;
          project_name: string;
          role: string;
        }[];
      };
      add_project_member_admin: {
        Args: { p_project_id: string; p_user_id: string };
        Returns: undefined;
      };
      allocate_ticket_code_number: {
        Args: { p_project_id: string };
        Returns: number;
      };
      archive_completed_tickets_batch: {
        Args: { p_now?: string; p_time_zone?: string };
        Returns: number;
      };
      can_edit_project: { Args: { project_uuid: string }; Returns: boolean };
      cleanup_expired_orphaned_projects: { Args: never; Returns: number };
      create_project:
        | {
            Args: { project_name: string };
            Returns: {
              board_emoji: string;
              created_at: string;
              enabled_modules: string[];
              id: string;
              name: string;
              short_code: string;
              updated_at: string;
            }[];
          }
        | {
            Args: { project_name: string; project_short_code: string };
            Returns: {
              created_at: string;
              id: string;
              name: string;
              short_code: string;
              updated_at: string;
            }[];
          };
      decline_invitation: {
        Args: { invitation_token: string };
        Returns: undefined;
      };
      derive_project_short_code: {
        Args: { project_name: string };
        Returns: string;
      };
      get_project_by_id: {
        Args: { p_project_id: string };
        Returns: {
          board_emoji: string;
          created_at: string;
          enabled_modules: string[];
          id: string;
          name: string;
          short_code: string;
          updated_at: string;
        }[];
      };
      get_project_role: { Args: { project_uuid: string }; Returns: string };
      get_project_ticket_assignees: {
        Args: { p_project_id: string };
        Returns: {
          assigned_at: string;
          avatar_url: string;
          display_name: string;
          ticket_id: string;
          user_id: string;
        }[];
      };
      get_projects_with_stats: {
        Args: never;
        Returns: {
          board_emoji: string;
          completed_count: number;
          created_at: string;
          id: string;
          in_progress_count: number;
          member_count: number;
          name: string;
          role: string;
          short_code: string;
          ticket_count: number;
          updated_at: string;
        }[];
      };
      get_reclaimable_projects: {
        Args: never;
        Returns: {
          id: string;
          name: string;
          orphaned_at: string;
          short_code: string;
        }[];
      };
      get_ticket_assignees: {
        Args: { ticket_ids: string[] };
        Returns: {
          assigned_at: string;
          avatar_url: string;
          display_name: string;
          ticket_id: string;
          user_id: string;
        }[];
      };
      get_ticket_comments: {
        Args: { p_ticket_id: string };
        Returns: {
          author_avatar_url: string;
          author_display_name: string;
          author_id: string;
          content: string;
          created_at: string;
          id: string;
          ticket_id: string;
          updated_at: string;
        }[];
      };
      has_any_project_access: { Args: never; Returns: boolean };
      is_project_admin: { Args: { project_uuid: string }; Returns: boolean };
      is_project_member: { Args: { project_uuid: string }; Returns: boolean };
      move_and_reorder_ticket: {
        Args: {
          p_column_id: string;
          p_completed_at: string;
          p_position: number;
          p_positions: Json;
          p_ticket_id: string;
        };
        Returns: {
          archived_at: string | null;
          archived_week_start: string | null;
          code_number: number;
          column_id: string;
          completed_at: string | null;
          created_at: string;
          created_by: string | null;
          description: string | null;
          due_date: string | null;
          id: string;
          position: number;
          priority: string | null;
          project_id: string;
          story_points: number | null;
          title: string;
          updated_at: string;
        }[];
        SetofOptions: {
          from: "*";
          to: "tickets";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      project_created_recently: {
        Args: { project_uuid: string; seconds_ago?: number };
        Returns: boolean;
      };
      project_exists: { Args: { project_uuid: string }; Returns: boolean };
      reclaim_or_join_project: {
        Args: { project_uuid: string };
        Returns: {
          created_at: string;
          id: string;
          name: string;
          short_code: string;
          updated_at: string;
        }[];
      };
      show_limit: { Args: never; Returns: number };
      show_trgm: { Args: { "": string }; Returns: string[] };
      update_avatar_url: {
        Args: { new_avatar_url: string };
        Returns: undefined;
      };
      update_column_positions: {
        Args: { p_positions: Json };
        Returns: undefined;
      };
      update_ticket_positions: {
        Args: { p_positions: Json };
        Returns: {
          archived_at: string | null;
          archived_week_start: string | null;
          code_number: number;
          column_id: string;
          completed_at: string | null;
          created_at: string;
          created_by: string | null;
          description: string | null;
          due_date: string | null;
          id: string;
          position: number;
          priority: string | null;
          project_id: string;
          story_points: number | null;
          title: string;
          updated_at: string;
        }[];
        SetofOptions: {
          from: "*";
          to: "tickets";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      update_user_profile: {
        Args: {
          new_display_name?: string;
          new_preferences?: Json;
          new_terms_accepted_at?: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
