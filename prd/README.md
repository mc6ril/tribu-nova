# Tribu Nova / Workbench PRD

Status: snapshot codebase du 29 avril 2026.

Ce dossier est le document de reference pour comprendre et reconstruire l'application dans un etat mature, en conservant l'intention produit mais en optimisant les fetchs, les relations base de donnees, les frontieres d'architecture et les flux de donnees.

## Sources auditees

- `src/app/`, `src/domains/`, `src/modules/`, `src/shared/`
- `supabase/migrations/`, `supabase/admin/`
- `package.json`, `next.config.ts`, `vercel.json`, `middleware.ts`, `src/proxy.ts`
- `docs/architecture/`, `docs/supabase/`, `docs/performances/`
- `flavieBoard/` comme reference non routee/design seed uniquement

Sont volontairement exclus de l'analyse fonctionnelle: `node_modules/`, `coverage/`, `report/`, artefacts de build et fichiers de cache.

## Lecture recommandee

1. [01 - Produit](./01-product.md)
2. [02 - Snapshot applicatif](./02-application-snapshot.md)
3. [03 - Flux de donnees par ecran](./03-screen-data-flows.md)
4. [04 - Base de donnees](./04-database.md)
5. [05 - Garde-fous, attentes et contraintes](./05-guards-loading-constraints.md)
6. [06 - Design system](./06-design-system.md)
7. [07 - Package et runtime](./07-package-runtime.md)
8. [08 - Plan d'integration from scratch](./08-integration-plan.md)
9. [09 - Architecture cible ultra performante](./09-performance-target.md)
10. [10 - Runbook de reconstruction](./10-rebuild-runbook.md)

Les trois fichiers historiques `prd.md`, `architecture.md` et `project-overview.md` sont conserves comme points d'entree courts et renvoient maintenant vers cette documentation decoupee.

## Positionnement

Le produit public s'appelle `Tribu Nova`; le repository et le package s'appellent encore `Workbench`. Dans ce dossier, `Tribu Nova` designe le produit utilisateur et `Workbench` designe le codebase.

## Regle de lecture importante

Les diagrammes Mermaid representent l'etat observe dans la codebase, pas seulement une intention. Les sections "cible mature" indiquent les optimisations recommandees pour arriver a une app beaucoup plus performante sans chercher une reproduction pixel-perfect.
