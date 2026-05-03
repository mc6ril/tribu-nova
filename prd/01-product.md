# 01 - Produit

## Definition courte

Tribu Nova est un OS de vie familiale organise autour de projets partages. Chaque projet est un conteneur collaboratif avec membres, roles, invitations, preferences et modules activables. Le module historique est un board type Kanban; le module Recipes est deja integre et couvre catalogue, selection de repas et liste de courses.

## Nom et promesse

- Nom public: `Tribu Nova` (`src/shared/constants/brand.ts`)
- Nom technique: `workbench` (`package.json`)
- Promesse actuelle: remplacer les notes dispersees par des espaces projet calmes, collaboratifs et reutilisables.
- Promesse cible: rendre chaque espace projet instantane a ouvrir, robuste sous collaboration temps reel et extensible par modules sans dette de chargement.

## Utilisateurs

- Parent ou foyer: cree des projets, suit les taches, planifie les repas.
- Admin de projet: gere le nom, l'emoji, les membres, invitations, modules, suppression.
- Membre: cree, modifie et deplace les tickets; collabore sur recettes selon droits.
- Viewer: consulte sans mutation.
- Utilisateur payant: beneficie de limites et fonctions selon plan.

## Capacites actuelles

### Public et acquisition

- Landing marketing localisee.
- Pricing conditionne par runtime config `is_billing_visible`.
- Legal pages et SEO public.
- Manifest, sitemap, robots, Open Graph route.

### Authentification

- Email/password sign up et sign in.
- Google OAuth.
- Verification email.
- Reset password et update password via callback Supabase PKCE.
- Resend verification.
- Suppression de compte via API admin server-side.

### Workspace

- Liste des projets accessibles avec role et stats.
- Creation de projet avec nom et emoji de board.
- Reclamation de projets orphelins.
- Etat getting-started si aucun projet/ticket.
- Footer qui expose Legal/Pricing selon runtime config.

### Project shell

- Layout persistent avec sidebar, profile menu et top toolbar.
- Views: Board, Recipes, Settings.
- Redirection `/{projectId}` vers la premiere vue accessible.
- Module library pour activer Recipes au niveau projet.
- Entitlements par plan et runtime config pour masquer/locker certaines vues.

### Board

- Board + colonnes par projet, avec provisioning automatique des lanes par defaut.
- Tickets avec titre, description, colonne, position, code projet, priorite, due date, story points, auteur, completion et archival.
- Drag and drop via `@dnd-kit`.
- Recherche et filtres: texte/code ticket, colonne, priorite, assignee, unassigned.
- Details ticket, assignations multi-utilisateurs, commentaires, suppression et unarchive.
- Realtime Supabase sur tickets, columns, members, comments, ticket_assignees.
- Cron d'archivage hebdomadaire des tickets termines.

### Recipes

- Activation module par projet via `enabled_modules`.
- Catalogue serveur avec pagination cursor, search, filtres par tags et fallback fixture si projet sans recette persistante.
- Quick list via `recipe_selections`.
- Detail recette avec ingredients, etapes, tags, image de couverture.
- Creation/edition avec draft local, tags, ingredients valides, additions candidates, steps, upload cover.
- Shopping list generee depuis la quick list avec fusion prudente des ingredients.

### Settings et account

- Projet: nom, emoji, short code, creation date, role courant, permissions, membres, invitations, danger zone.
- Account: display name, email, avatar, password si provider compatible, preferences theme/language/email, subscription, sign out, delete account.
- Hidden route runtime config lab accessible via sequence dans Account.

### Billing

- Plans: free, pro, team.
- Entitlements: workspaces, members per workspace, tickets, custom columns, recipes, advanced roles.
- Checkout Stripe, portal Stripe, webhook Stripe.
- Runtime flag `is_billing_visible` pour masquer tout le parcours.

## Non-objectifs observes

- Pas de sprints, epics, labels ou subtasks dans le schema effectif: ils ont ete supprimes par migrations.
- Pas de module Vacation/Budget implemente.
- Pas de mode offline complet.
- Pas de vraie aggregation serveur unique pour Recipes catalogue + filtres + detail: la logique existe cote repository mais reste multi-requetes.
- Pas de typed database generation globale depuis Supabase; les row types sont owner-local.

## Critere de maturite attendu

Une reconstruction mature doit viser:

- une seule frontiere de chargement primaire par scope de navigation;
- aucun waterfall evitable dans les routes serveur;
- des read models database alignes avec les ecrans critiques;
- des indexes sur toutes les colonnes de filtre, join et RLS;
- RLS fail-closed et testee;
- mutations optimistes bornees par realtime et invalidations precises;
- instrumentation claire des temps de chargement par route et par requete;
- UX d'attente stable, accessible et sans layout shift.
