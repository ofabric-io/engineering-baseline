---
layer: 15-delivery
status: proposed
owner: TBD
last-reviewed: never
---

# Deployments, Migrations & Rollback

## Purpose

Getting changes to an environment safely and reversibly, including schema changes. The deployment
target and tooling are technology choices recorded in `13-technology/`; the pre-merge gates are in
`pipeline-and-gates.md`.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `deploy_target` | [[deploy_target]] | undecided until an ADR picks one | nothing may assume a target before then |
| `rollout_strategy` | [[rollout_strategy]] | decided when the first production deployment is planned | progressive rollout vs. simplicity |
| `environments` | [[environments]] | two, fully separate: staging and production | more environments cost more and catch more; none shared |
| `production_approval` | [[production_approval]] | a manual approval step before production | automatic promotion is faster and removes a human check |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] What is the deployment target, and which ADR records it?
- [ ] How long must a shutdown be allowed to drain in-flight work (R6)?

## Rules

### Environments and artifacts

- **R1.** The project MUST have exactly the environments in `environments`, and no resource or
  credential MUST be shared between any two of them.
- **R2.** The artifact deployed to an environment MUST be the exact artifact deployed to the previous
  one, promoted by an immutable identifier, and MUST NOT be rebuilt. An artifact whose
  configuration is fixed at build time MAY be rebuilt from the same commit with frozen
  dependencies, provided its checks run on the rebuilt output.
- **R3.** The first environment MUST deploy automatically when `main` is green, and later
  environments MUST follow `production_approval`; nothing reaches production merely because a
  merge happened.

### Rollout and rollback

- **R4.** A rollout MUST follow `rollout_strategy` and MUST NOT reduce serving capacity below what
  `01-business/availability.md` requires.
- **R5.** A deployment MUST roll back automatically when the new version fails its health checks.
- **R6.** The shutdown grace period MUST be long enough for readiness to fail, background work to
  stop and in-flight work to finish (`07-observability/health.md`).
- **R7.** A deploy MUST be verified after the call returns: steady state reached and health
  endpoints answering; until then it is not done.
- **R8.** A rollback for any reason other than R5 MUST be a human decision, performed by
  redeploying the previous artifact and never by rebuilding.

### Configuration and secrets

- **R9.** Configuration MUST reach a running unit from its environment, MUST be validated once at
  startup, and a unit with invalid configuration MUST refuse to start.
- **R10.** A unit MUST be able to read only its own environment's configuration and secrets.

### Schema migrations

- **R11.** A breaking schema change MUST follow expand, then migrate, then contract: add the new
  structure compatibly and dual-write; backfill and switch readers; drop the old structure in a
  later, separate release.
- **R12.** Schema changes MUST be forward-only; down migrations MUST NOT be written, and recovery
  from a bad migration is a new migration or a restore from backup.
- **R13.** Every deployed version MUST be backward-compatible with the schema as migrated, so that a
  rolled-back application still works against the new schema.
- **R14.** Migrations MUST run as a separate pipeline step that completes successfully before the
  application is updated, MUST NOT run on application start, and a failed migration MUST stop the
  pipeline without deploying the application.
- **R15.** A migration MUST be one reviewed logical change; a generated migration MUST NOT be
  committed unedited.
- **R16.** A backfill MUST NOT run inside a migration; it MUST be a separate, throttled, resumable,
  idempotent job that never blocks a deploy.
- **R17.** An agent MUST NOT execute a migration against a shared database; authoring a migration
  is permitted, executing it needs a human.

### Data protection and releases

- **R18.** Backups MUST be restored on a schedule into a scratch environment, with an assertion on
  known data; an untested backup is not a backup.
- **R19.** A release MUST be produced by a pipeline from a version tag on `main`, which also
  generates the changelog (`14-git/git.md` R18, R19).

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | Separate infrastructure definitions per environment; no shared resource | ⬜ scheduled |
| R2 | Promotion job takes an artifact identifier and has no build step | ⬜ scheduled |
| R3 | Deployment pipeline with an approval gate on production | ⬜ scheduled |
| R4, R5 | Rollout and rollback settings in the deployment definition | ⬜ scheduled |
| R6 | Grace-period setting in the deployment definition | ⬜ scheduled |
| R7 | Pipeline step waiting for steady state plus a health-endpoint smoke request | ⬜ scheduled |
| R8 | PR review; a documented runbook step | ❌ review-only |
| R9 | Configuration schema validated at startup; a lint rule banning direct environment reads elsewhere | ⬜ scheduled |
| R10 | Access policy scoped to one environment, reviewed as infrastructure code | ⬜ scheduled |
| R11–R13 | Migration-safety check in CI (`15-delivery/pipeline-and-gates.md` R11, R12) | ⬜ scheduled |
| R14 | Pipeline orders the migration step before the application update and gates on its exit code | ⬜ scheduled |
| R15, R16 | PR review | ❌ review-only |
| R17 | Permission rules denying agents database-write access; `16-ai/prohibitions.md` | ◐ partial |
| R18 | Scheduled restore exercise that fails loudly | ⬜ scheduled |
| R19 | Release workflow | ⬜ scheduled |

## AI guardrails

- Never rebuild an artifact for a later environment; promote the identical one.
- Never run a migration. You may write one.
- Never write a down migration. Fix forward.
- Never drop, rename or narrow in the same release as the code that stops using it.
- Never backfill inside a migration.
- Never deploy the application after a failed migration.
- Roll back by redeploying the previous artifact, never by rebuilding.

## References

- `15-delivery/pipeline-and-gates.md` — migration-safety gate, R11–R12
- `01-business/availability.md` — capacity and recovery targets
- `07-observability/health.md` — graceful shutdown
- `16-ai/prohibitions.md` — agents and shared databases
- `14-git/git.md` — release tags and changelog
