# 03 - Flux de donnees par ecran

Ce document fige les donnees entrantes, les donnees consommees et les mutations par ecran principal.

## 1. Marketing home

```mermaid
flowchart TD
  Route["/ ou /:locale"] --> Locale[params.locale + cookies + accept-language]
  Locale --> Metadata[buildHomeMetadata + WebsiteJsonLd]
  Route --> BillingVisibility[getCachedBillingVisibility]
  BillingVisibility --> RuntimeConfig[(app_runtime_config: is_billing_visible)]
  Metadata --> LandingPage[LandingPage]
  RuntimeConfig --> LandingPage
  LandingPage --> StaticI18n[messageCatalog/static translator]
  LandingPage --> CTAs[signup, signin, pricing if visible, legal]
```

Donnees entrantes: locale, cookies locale, runtime billing visibility.  
Consommation: i18n statique, brand constants, landing constants.  
Mutation: aucune.

## 2. Pricing

```mermaid
flowchart TD
  Route["/pricing ou /:locale/pricing"] --> Visibility[getCachedBillingVisibility]
  Visibility --> RuntimeConfig[(app_runtime_config)]
  Visibility -->|false| RedirectHome[redirect home locale]
  Visibility -->|true| PricingPage[PricingPage client]
  PricingPage --> Session[useSession]
  PricingPage --> Subscription[useSubscription]
  Subscription --> Subscriptions[(subscriptions)]
  PricingPage --> Checkout[useCreateCheckoutSession]
  Checkout --> API1["POST /api/stripe/checkout"]
  API1 --> CSRF[CSRF origin + rate limit]
  API1 --> SupabaseSession[Supabase session]
  API1 --> Stripe[Stripe checkout]
  PricingPage --> Portal[useCreateBillingPortalSession]
  Portal --> API2["POST /api/stripe/portal"]
  API2 --> Stripe
```

Donnees entrantes: locale, `from` search param, session optionnelle.  
Consommation: subscription courante, plans constants, runtime config.  
Mutations: creation session checkout/portal; webhook persiste `subscriptions`.

## 3. Legal

```mermaid
flowchart TD
  Route["/legal ou /:locale/legal"] --> Locale[params.locale]
  Locale --> LegalPage[LegalPage]
  LegalPage --> StaticI18n[legal constants + static translations]
```

Donnees entrantes: locale.  
Consommation: contenu legal statique.  
Mutation: aucune.

## 4. Sign in

```mermaid
flowchart TD
  Route["/auth/signin"] --> Search[redirect + unverified]
  Search --> SigninPage
  SigninPage --> Form[react-hook-form + SignInSchema]
  Form --> SignIn[useSignIn]
  SignIn --> AuthGateway[Supabase auth.signInWithPassword]
  SigninPage --> Google[useSignInWithGoogle]
  Google --> OAuth[Supabase auth.signInWithOAuth]
  SigninPage --> Resend[useResendVerification]
  Resend --> AuthResend[Supabase auth.resend]
  SignIn -->|success| Redirect[router.push redirectPath]
```

Donnees entrantes: redirect path, unverified flag.  
Consommation: Supabase Auth.  
Mutations: sign in, OAuth redirect, resend verification.

## 5. Sign up

```mermaid
flowchart TD
  Route["/auth/signup"] --> Search[redirect]
  Search --> SignupPage
  SignupPage --> Locale[useLocale]
  SignupPage --> Terms[acceptedTerms + termsAcceptedAt]
  SignupPage --> Form[SignUpFormSchema + PasswordStrength]
  Form --> SignUp[useSignUp]
  SignUp --> Auth[Supabase auth.signUp]
  Auth --> ProfileTrigger[(user_profiles sync trigger)]
  SignupPage --> Google[useSignInWithGoogle]
  SignUp -->|session| Redirect[redirectPath]
  SignUp -->|requires verification| VerificationState[verification success screen]
```

Donnees entrantes: redirect path, locale active.  
Consommation: Supabase Auth, profile trigger DB.  
Mutations: creation auth user, profile projection, optional OAuth.

## 6. Reset, update et verify email

```mermaid
flowchart TD
  Reset["/auth/reset-password"] --> ResetForm[ResetPasswordForm]
  ResetForm --> ResetUsecase[resetPasswordForEmail]
  ResetUsecase --> SupabaseReset[auth.resetPasswordForEmail callback]

  Callback["/auth/callback?code&next"] --> Exchange[exchangeCodeForSession]
  Exchange --> SupabaseExchange[auth.exchangeCodeForSession]
  SupabaseExchange --> NextRedirect[next sanitized path]

  Update["/auth/update-password"] --> UpdateForm[UpdatePasswordForm]
  UpdateForm --> UpdateUsecase[updatePassword]
  UpdateUsecase --> SupabaseUpdate[auth.updateUser password]

  Verify["/auth/verify-email"] --> VerifyFlow[useVerifyEmailFlow]
  VerifyFlow --> VerifyUsecase[verifyEmail]
  VerifyUsecase --> SupabaseVerify[auth.verifyOtp]
```

Donnees entrantes: email, code PKCE, token/type verification, password.  
Consommation: Supabase Auth.  
Mutations: reset email, exchange session, update password, verify OTP.

## 7. Join invitation

```mermaid
flowchart TD
  Route["/join/:token"] --> Token[params.token]
  Token --> Session[useSession]
  Session -->|no session| SigninRedirect["/auth/signin?redirect=/join/:token"]
  Session -->|session| Accept[useAcceptInvitation]
  Accept --> RPC[accept_invitation token]
  RPC --> ProjectInvitations[(project_invitations)]
  RPC --> Members[(project_members)]
  Accept -->|success| ProjectBoard["/:projectId/board"]
  Accept -->|error| Fallback[RouteFallbackPage error]
```

Donnees entrantes: invitation token, session.  
Consommation: invitation RPC.  
Mutations: delete/consume invitation selon migrations, insert membership.

## 8. Workspace

```mermaid
flowchart TD
  Layout["/workspace layout"] --> Loader[loadWorkspaceRouteData]
  Loader --> Session[getCurrentSession]
  Loader --> Profile[getProfile]
  Loader --> ProjectsStats[listProjectsWithStats]
  ProjectsStats --> RPC[(get_projects_with_stats)]
  Loader --> Hydration[HydrationBoundary + displayName + referenceTime]

  Hydration --> WorkspacePage[WorkspacePageContainer]
  WorkspacePage --> UseProjects[useProjectsWithStats initialData]
  WorkspacePage --> SecondaryGate[setTimeout 0 -> shouldLoadSecondaryData]
  SecondaryGate --> Reclaimable[useReclaimableProjects]
  SecondaryGate --> Billing[useBillingVisibility]
  WorkspacePage --> GettingStarted[useTicketGettingStartedStatus if no projects]
  WorkspacePage --> CreateProject[useCreateProject]
  CreateProject --> RPCCreate[(create_project RPC)]
  WorkspacePage --> Reclaim[useAddUserToProject]
  Reclaim --> RPCReclaim[(reclaim_or_join_project)]
```

Donnees entrantes: auth cookies, locale, theme cookie.  
Consommation: session, profile, projects stats, runtime billing, reclaimable projects, profile getting-started.  
Mutations: create project, reclaim project, skip getting-started.

## 9. Project shell et project root

```mermaid
flowchart TD
  Route["/:projectId layout"] --> Snapshot[getProjectShellSnapshot cached]
  Snapshot --> Project[getProjectForRoute]
  Snapshot --> RuntimeConfig[is_recipes_board_visible]
  Project --> RLS[(projects via RLS/RPC)]
  RuntimeConfig --> Config[(app_runtime_config)]
  Snapshot --> Shell[ProjectShellSnapshotProvider]
  Shell --> Permissions[ProjectPermissionsProvider]
  Permissions --> Role[useProjectRole -> get_project_role]
  Shell --> Sidebar[SidebarNavigation]
  Sidebar --> Viewer[useViewer]
  Sidebar --> Subscription[useSubscription + useBillingVisibility]
  Sidebar --> ModuleEnable[useEnableProjectModule]

  Root["/:projectId"] --> ViewState[getProjectRouteViewState cached]
  ViewState --> Plan[getUserSubscription -> effectivePlan]
  ViewState --> DefaultView[getDefaultProjectViewKey]
  DefaultView --> Redirect[redirect to recipes/board/settings]
```

Donnees entrantes: `projectId`, cookies, runtime overrides.  
Consommation: project access, enabled modules, runtime config, role, viewer, subscription.  
Mutations: enable module, sign out from profile menu.

## 10. Board

```mermaid
flowchart TD
  Route["/:projectId/board"] --> ServerData[BoardPageData]
  ServerData --> BoardConfig[getBoardConfiguration]
  BoardConfig --> Boards[(boards)]
  BoardConfig --> Columns[(columns)]
  BoardConfig --> Defaults[create missing default columns]
  ServerData --> Hydrate[HydrationBoundary boardConfiguration]

  Hydrate --> BoardLayout[BoardLayout client]
  BoardLayout --> ConfigHook[useBoardConfiguration initialData]
  BoardLayout --> ShortCode[useProjectShortCode]
  BoardLayout --> FilterStore[zustand useFilterStore]
  BoardLayout --> Tickets[useTickets project + filters + search]
  Tickets --> TicketsTable[(tickets)]
  BoardLayout --> Assignees[useTicketAssigneesByProjectId]
  Assignees --> AssigneeRPC[(get_project_ticket_assignees)]
  BoardLayout --> HasComments[useHasProjectComments]
  BoardLayout --> DnD[useBoardDnD]
  DnD --> MoveRPC[(move_and_reorder_ticket)]
  BoardLayout --> CreateTicket[useCreateTicket]
  CreateTicket --> TicketsTable
  BoardLayout --> Onboarding[useTicketGettingStartedStatus]

  ShellAdapter[BoardShellAdapter] --> Realtime[useProjectRealtime]
  Realtime --> RT[(Supabase Realtime: tickets, columns, members, comments, assignees)]
  RT --> QueryCache[patch/invalidate React Query cache]
```

Donnees entrantes: `projectId`, query params `createTicket`, `onboarding`, legacy `ticket`, filter store.  
Consommation: board config, tickets, assignees, comments signal, role permissions.  
Mutations: create ticket, drag/move/reorder, update onboarding status.

## 11. Ticket detail

```mermaid
flowchart TD
  Route["/:projectId/board/tickets/:ticketId"] --> TicketPage[TicketDetailPage]
  TicketPage --> Controller[useTicketDetailController]
  Controller --> Ticket[useTicket]
  Ticket --> Tickets[(tickets)]
  Controller --> BoardConfig[useBoardConfiguration]
  Controller --> Members[useProjectMembers]
  Controller --> Assignees[useTicketAssignees]
  Controller --> Comments[useComments]
  Comments --> CommentsRPC[(get_ticket_comments)]
  Controller --> Session[useSession]
  Controller --> Permissions[useProjectPermissions]

  Controller --> Update[useUpdateTicket]
  Update --> Tickets
  Controller --> Assign[useAssignTicket / useUnassignTicket]
  Assign --> TicketAssignees[(ticket_assignees)]
  Controller --> CommentMutations[create/update/delete comment]
  CommentMutations --> CommentsTable[(comments)]
  Controller --> Delete[useDeleteTicket]
  Delete --> Tickets
```

Donnees entrantes: `projectId`, `ticketId`, history state.  
Consommation: ticket, board columns, members, assignees, comments, current user, permissions.  
Mutations: fields, status, priority, due date, assignees, comments, delete, unarchive.

## 12. Recipes catalog

```mermaid
flowchart TD
  Guard[withRecipesRouteAccess] --> ViewState[getProjectRouteViewState]
  ViewState --> Access{visible + enabled + plan ok?}
  Access -->|no| RedirectDefault[redirect default project view]
  Access -->|yes| RecipesPage

  RecipesPage --> Params[parseRecipesCatalogSearchParams]
  RecipesPage --> Parallel[Promise.all]
  Parallel --> List[listCatalogRecipes]
  Parallel --> Tags[listCatalogRecipeTags]
  Parallel --> QuickList[listActiveSelections]
  List --> Recipes[(recipes)]
  List --> Ingredients[(recipe_ingredients)]
  List --> TagLinks[(recipe_tag_links)]
  List --> Fixtures[fixture fallback if no persisted recipes]
  Tags --> RecipeTags[(recipe_tags)]
  QuickList --> Selections[(recipe_selections)]

  RecipesPage --> Client[RecipesCatalogClientPage]
  Client --> Store[zustand filters/quicklist feedback]
  Client --> Infinite[useInfiniteQuery list recipes]
  Client --> QuickQuery[useListActiveSelections]
  Client --> TagsQuery[useListRecipeTags]
  Client --> URLSync[replace search params]
```

Donnees entrantes: `projectId`, search params `q`/filters, project module state, runtime flag, plan.  
Consommation: recipes page, tags, active selections.  
Mutations: quick list add/remove depuis cards et rail.

## 13. Recipe detail

```mermaid
flowchart TD
  Guard[withRecipesRouteAccess] --> DetailPage
  DetailPage --> Recipe[getCatalogRecipeDetail]
  Recipe --> Graph[loadRecipeGraphsByIds]
  Graph --> Recipes[(recipes)]
  Graph --> Ingredients[(recipe_ingredients)]
  Graph --> Steps[(recipe_steps)]
  Graph --> TagLinks[(recipe_tag_links)]
  Graph --> Tags[(recipe_tags)]
  Recipe --> Selection[(recipe_selections maybeSingle)]
  DetailPage --> NotFound[notFound if absent]
  DetailPage --> Layout[Recipe detail layout]
  Layout --> Client[RecipeDetailView]
```

Donnees entrantes: `projectId`, `recipeId`.  
Consommation: graphe recette complet et etat quick list.  
Mutations: navigation vers edit, quick list selection selon composants detail.

## 14. Recipe editor create/edit

```mermaid
flowchart TD
  Guard[withRecipesRouteAccess] --> EditorPage
  EditorPage --> Parallel[Promise.all]
  Parallel --> Draft[getRecipeDraft]
  Parallel --> AvailableTags[listRecipeEditorTags]
  Draft --> RecipeGraph[(recipes + ingredients + steps + tags)]
  AvailableTags --> Tags[(recipe_tags)]
  EditorPage --> Client[RecipeEditorClientPage]
  Client --> Form[react-hook-form + RecipeEditorSubmissionSchema]
  Client --> LocalDraft[local draft for create]
  Client --> CoverUpload[useUploadRecipeCover]
  CoverUpload --> Storage[(recipe-covers storage)]
  Client --> Save[useCreateRecipe / useUpdateRecipe]
  Save --> EditorRepo[EditorRepository transaction-like orchestration]
  EditorRepo --> Recipes[(recipes)]
  EditorRepo --> Ingredients[(recipe_ingredients)]
  EditorRepo --> Steps[(recipe_steps)]
  EditorRepo --> TagLinks[(recipe_tag_links)]
  Save --> Redirect[recipe detail]
```

Donnees entrantes: `projectId`, `mode`, optional `recipeId`, local draft.  
Consommation: draft, available tags, file input.  
Mutations: cover upload, create/update recipe graph, local draft clear.

## 15. Recipes quick list

```mermaid
flowchart TD
  Guard[withRecipesRouteAccess] --> QuickListPage
  QuickListPage --> Selections[listActiveSelections]
  QuickListPage --> Generate[generateShoppingList]
  Selections --> RecipeSelections[(recipe_selections)]
  Generate --> ShoppingRepo[ShoppingRepository]
  ShoppingRepo --> EnsureList[(shopping_lists upsert)]
  ShoppingRepo --> LoadSelections[(recipe_selections)]
  ShoppingRepo --> LoadRecipes[(recipes)]
  ShoppingRepo --> LoadIngredients[(recipe_ingredients)]
  ShoppingRepo --> RewriteItems[(shopping_list_items delete+insert)]
  QuickListPage --> Cards[QuickListSelectionsCard + ShoppingSummaryCard]
  Cards --> Mutations[mark done / remove selection]
```

Donnees entrantes: `projectId`.  
Consommation: active selections, generated shopping list summary.  
Mutations: mark done/remove selection, generation shopping list persistante.

## 16. Recipes shopping list

```mermaid
flowchart TD
  Guard[withRecipesRouteAccess] --> ShoppingPage
  ShoppingPage --> Selections[listActiveSelections]
  ShoppingPage --> Generate[generateShoppingList]
  Generate --> ShoppingList[(shopping_lists)]
  Generate --> Items[(shopping_list_items)]
  Generate --> Recipes[(recipes + ingredients)]
  ShoppingPage --> ClientCard[ShoppingListClientCard]
  ClientCard --> Checked[useSetShoppingListItemChecked]
  Checked --> Items
```

Donnees entrantes: `projectId`.  
Consommation: active selections, shopping list groups/items.  
Mutations: checkbox item checked, generation/rewrite items au chargement.

## 17. Project settings

```mermaid
flowchart TD
  Route["/:projectId/settings"] --> Page[ProjectSettingsPage]
  Page --> Project[useProject]
  Project --> GetProject[(get_project_by_id / projects)]
  Page --> Permissions[useProjectPermissions]
  Permissions --> Role[(get_project_role)]
  Page --> People[ProjectPeopleSettingsSection]
  People --> Members[useProjectMembers]
  People --> Invitations[useProjectInvitations]
  Members --> ProjectMembers[(project_members + user_profiles)]
  Invitations --> ProjectInvitations[(project_invitations)]
  Page --> Update[useUpdateProject]
  Update --> Projects[(projects)]
  Page --> Delete[useDeleteProject]
  Delete --> Projects
  People --> Invite[invite/revoke/updateRole/removeMember]
```

Donnees entrantes: `projectId`, role courant.  
Consommation: project, permissions, members, invitations.  
Mutations: update project, delete project, invite/revoke, role update, member removal.

## 18. Account

```mermaid
flowchart TD
  Route["/account"] --> AccountPage[AccountPageClient]
  AccountPage --> Session[useSession]
  AccountPage --> Viewer[useViewer]
  AccountPage --> Personal[AccountPersonalInfoSection]
  Personal --> Profile[useViewer + useLightUserIdentity]
  Personal --> UpdateIdentity[useUpdateAccountIdentity]
  Personal --> Avatar[useUploadAvatar/useRemoveAvatar]
  Avatar --> Storage[(avatars storage)]
  Avatar --> UserProfiles[(user_profiles)]

  AccountPage --> Security[AccountSecuritySection]
  Security --> CanPassword[useCanUpdatePassword]
  Security --> ChangePassword[useChangePassword]
  ChangePassword --> SupabaseAuth[Supabase Auth]

  AccountPage --> Preferences[AccountPreferencesSection]
  Preferences --> MyProfile[useMyProfile]
  Preferences --> UpdatePrefs[useUpdatePreferences]
  UpdatePrefs --> UserProfiles

  AccountPage --> BillingActions[AccountBillingAndActionsSection]
  BillingActions --> Visibility[useBillingVisibility]
  BillingActions --> Subscription[useSubscription]
  BillingActions --> Portal[useCreateBillingPortalSession]
  BillingActions --> DeleteUser[useDeleteUser]
  DeleteUser --> API["DELETE /api/auth/delete-user"]
```

Donnees entrantes: `from`, `checkout=success`, session, viewer.  
Consommation: user profile, auth capabilities, billing visibility, subscription.  
Mutations: identity, avatar, password, preferences, portal session, sign out, delete account.

## 19. Runtime config lab

```mermaid
flowchart TD
  Entrance[hidden 5-click account icon] --> Route["/runtime-config-lab"]
  Route --> Page[RuntimeConfigLab]
  Page --> Config[listRuntimeConfigEntries/useRuntimeConfigBoolean]
  Config --> Table[(app_runtime_config)]
  Page --> Overrides[local runtime overrides cookie]
  Overrides --> Shell[affects billing/recipes visibility reads]
```

Donnees entrantes: protected session, cookies override.  
Consommation: runtime config entries.  
Mutations: locales/cookie overrides selon lab.

## 20. API et jobs

```mermaid
flowchart TD
  Checkout["POST /api/stripe/checkout"] --> CSRF1[CSRF + rate limit]
  Checkout --> BillingFlag[is_billing_visible]
  Checkout --> Session1[getCurrentSession]
  Checkout --> StripeCheckout[Stripe checkout session]

  Portal["POST /api/stripe/portal"] --> CSRF2[CSRF + rate limit]
  Portal --> BillingFlag
  Portal --> Session2[getCurrentSession]
  Portal --> StripePortal[Stripe portal session]

  Webhook["POST /api/stripe/webhook"] --> Rate[rate limit]
  Webhook --> Signature[verify stripe-signature]
  Signature --> AdminClient[Supabase service role]
  AdminClient --> Subscriptions[(subscriptions upsert)]

  DeleteUser["DELETE /api/auth/delete-user"] --> CSRF3[CSRF + rate limit]
  DeleteUser --> Session3[getCurrentSession]
  DeleteUser --> AdminAuth[admin auth deleteUser]

  Archive["GET/POST /api/jobs/archive-completed-tickets"] --> Secret[Bearer CRON_SECRET]
  Secret --> AdminTicketRepo[service role ticket repo]
  AdminTicketRepo --> ArchiveRPC[(archive_completed_tickets_batch)]
```

Points de controle: CSRF origin, rate limit memoire, Stripe signature, service role uniquement serveur, cron secret obligatoire.
