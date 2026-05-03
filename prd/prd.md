# Tribu Nova / Workbench - PRD

Status: snapshot codebase du 29 avril 2026.

Ce fichier est le point d'entree court du PRD. La documentation complete vit dans les fichiers numerotes de ce dossier, a commencer par [README.md](./README.md).

## Produit

Tribu Nova est une application collaborative de projets familiaux. Le codebase s'appelle encore Workbench. L'application fournit aujourd'hui:

- authentification email/password et OAuth;
- workspace de projets;
- shell projet avec roles, permissions et modules;
- board Kanban avec tickets, colonnes, commentaires, assignations, realtime et archivage;
- settings projet, membres et invitations;
- account/profile/preferences/avatar;
- billing Stripe et runtime config;
- module Recipes avec catalogue, detail, edition, quick list et liste de courses.

## Documents de reference

- [01 - Produit](./01-product.md)
- [02 - Snapshot applicatif](./02-application-snapshot.md)
- [03 - Flux de donnees par ecran](./03-screen-data-flows.md)
- [04 - Base de donnees](./04-database.md)
- [05 - Garde-fous, attentes et contraintes](./05-guards-loading-constraints.md)
- [06 - Design system](./06-design-system.md)
- [07 - Package et runtime](./07-package-runtime.md)
- [08 - Plan d'integration from scratch](./08-integration-plan.md)
- [09 - Architecture cible ultra performante](./09-performance-target.md)
- [10 - Runbook de reconstruction](./10-rebuild-runbook.md)

## Cible

Le but n'est pas de recreer l'app a l'identique. Le PRD fige l'etat actuel, puis propose une reconstruction plus mature: read models par ecran, RLS optimisee, fetchs parallelises, hydration controlee, caches explicites, realtime pour les deltas et budgets de latence par route.
