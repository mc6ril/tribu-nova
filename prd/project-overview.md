# Tribu Nova / Workbench - Project overview

Status: snapshot codebase du 29 avril 2026.

Tribu Nova est le produit utilisateur; Workbench est le nom du repository/package. L'application permet a un groupe de gerer des projets partages avec un board Kanban et un module Recipes.

## Capacites actuelles

- Authentification: signup, signin, reset/update password, verify email, OAuth callback.
- Workspace: liste des projets accessibles, creation projet, stats.
- Projet: shell, roles, permissions, sidebar, modules, settings.
- Board: colonnes, tickets, DnD, commentaires, assignations, detail ticket, realtime, archivage.
- Collaboration: membres, roles, invitations par token.
- Account: profil, avatar, preferences, securite, subscription.
- Billing: pricing, checkout, portal, webhook Stripe, runtime config.
- Recipes: catalogue, filtres, detail, edition, quick list, shopping list.

## Ou lire ensuite

- Vue produit: [01 - Produit](./01-product.md)
- Cartographie routes/features: [02 - Snapshot applicatif](./02-application-snapshot.md)
- Flux par ecran: [03 - Flux de donnees par ecran](./03-screen-data-flows.md)
- Schema/RLS/RPCs: [04 - Base de donnees](./04-database.md)
- Contraintes et garde-fous: [05 - Garde-fous, attentes et contraintes](./05-guards-loading-constraints.md)
- Reconstruction mature: [08 - Plan d'integration](./08-integration-plan.md) et [09 - Architecture cible ultra performante](./09-performance-target.md)

## Premier parcours engineer

1. Lire `src/app` pour comprendre les routes et layouts.
2. Suivre une feature presentation -> usecase -> port -> infrastructure.
3. Lire les migrations Supabase comme source de verite DB.
4. Comparer les flux actuels avec les contrats cibles dans `09-performance-target.md`.
