---
layer: packs/data-store
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Schema Migrations

## Purpose

How the structure of a data store changes without breaking running software or losing data. The
migration tool and the store are technology choices recorded in `13-technology/`; deploying the
software is `15-delivery/deployments-and-rollback.md`, and the generic rule that an irreversible
data change needs a human is its R17.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `migrations_forward_only` | [[migrations_forward_only]] | yes: no down migrations; recovery is a new migration or a restore | `no` allows scripted reversal and adds code that is rarely exercised and often wrong when needed |
| `migration_unsafe_changes` | [[migration_unsafe_changes]] | within a single release: dropping a column or table, renaming, narrowing a type, adding a non-null constraint without a default or backfill, building an index in a way that blocks writes | a shorter list lets more through; a longer one blocks legitimate single-step changes |
| `backfill_execution` | [[backfill_execution]] | a separate, throttled, resumable, idempotent job that never blocks a deploy | running it inside the migration is simpler and holds locks and blocks the deploy for the length of the data |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Which stores are covered, and which migration tool does each use (`13-technology/`)?

## Rules

### Sequencing

- **R1.** A breaking schema change MUST follow expand, then migrate, then contract: add the new
  structure compatibly and write to both; backfill and switch readers; remove the old structure in
  a later, separate release.
- **R2.** Migrations MUST follow `migrations_forward_only`. Where it is yes, down migrations MUST
  NOT be written and recovery from a bad migration is a new migration or a restore
  (`01-business/availability.md` R7). Where it is no, every migration MUST have a down migration
  that is exercised in CI.
- **R3.** Every deployed version MUST work against the schema as migrated, so that a rolled-back
  application keeps working (`15-delivery/deployments-and-rollback.md` R12, R14).
- **R4.** A contract step that removes data MUST be preceded by a restore that was verified under
  `01-business/availability.md` R7.

### Execution

- **R5.** Migrations MUST run as a separate pipeline step that completes before the application is updated. _(applies to: service, daemon, batch)_
  They MUST NOT run on application start, and a failed migration MUST stop the pipeline without
  deploying the application.
- **R6.** A backfill MUST follow `backfill_execution` and MUST NOT run inside a migration.
- **R7.** An agent MAY author a migration; executing one against a shared environment is governed
  by `16-ai/prohibitions.md` P16.

### Authoring

- **R8.** A migration MUST be one reviewed logical change; a generated migration MUST NOT be
  committed unedited.
- **R9.** A migration already merged to the default branch MUST NOT be modified; a correction is a
  new migration.

### Gates

- **R10.** A migration-safety check MUST reject every change in `migration_unsafe_changes` made
  within a single release, as a blocking gate (`15-delivery/pipeline-and-gates.md` R4).
- **R11.** Modification of a merged migration (R9) MUST be rejected by a commit hook and again in CI.
- **R12.** The migration-safety check MUST be shown to fail against a deliberate violation before it
  is relied on (`15-delivery/pipeline-and-gates.md` R8).

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1, R3 | Migration-safety check in CI (R10); review of the release plan | ⬜ scheduled |
| R2 | Migration-tool configuration; a check for down migrations where forbidden | ⬜ scheduled |
| R4 | Pipeline step requiring a recent restore record before a destructive contract step | ⬜ scheduled |
| R5 | Pipeline orders the migration step before the application update and gates on its exit code | ⬜ scheduled |
| R6, R8 | PR review | ❌ review-only |
| R7 | Permission rules denying agents write access to shared stores (`16-ai/prohibitions.md`) | ◐ partial |
| R9, R11 | Commit hook and CI job comparing migration files with the default branch (tool chosen in `13-technology/`) | ⬜ scheduled |
| R10, R12 | Migration-safety script run in CI and in the commit hook, with a fixture of violations | ⬜ scheduled |

## AI guardrails

- You may write a migration. Never execute one against a shared environment.
- Never write a down migration where `migrations_forward_only` is yes. Fix forward.
- Never drop, rename or narrow in the same release as the code that stops using it.
- Never backfill inside a migration.
- Never edit a migration already merged; add a new one.
- Never deploy the application after a failed migration.

## References

- `15-delivery/deployments-and-rollback.md` — rollback, version skew, irreversible data changes
- `15-delivery/pipeline-and-gates.md` — blocking gates and proving a gate fails
- `01-business/availability.md` — backups and restore
- `16-ai/prohibitions.md` — agents and irreversible operations (P16)
