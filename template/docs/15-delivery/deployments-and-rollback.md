---
layer: 15-delivery
status: proposed
owner: TBD
last-reviewed: never
---

# Deployments & Rollback

## Purpose

Getting the project's own changes to an environment safely and reversibly. It separates two things
that look alike: **deploying the platform** (a new version of the project's own software reaches an
environment) and **operations performed for customers** (a change made for, or at the request of,
one customer using the platform as it is). The deployment target and tooling are technology choices
recorded in `13-technology/`; the pre-merge gates are in `pipeline-and-gates.md`; how a release is
versioned and published is in `releases-and-distribution.md`. How schema and data-store changes are
sequenced belongs to the project's data-store documentation, when it has a data store.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `deploy_target` | [[deploy_target]] | undecided until an ADR picks one | nothing may assume a target before then |
| `rollout_strategy` | [[rollout_strategy]] | decided when the first production deployment is planned | progressive rollout vs. simplicity |
| `environments` | [[environments]] | local development, staging, production | more environments cost more and catch more; none shares a resource with another |
| `production_approval` | [[production_approval]] | a manual approval step before production | automatic promotion is faster and removes a human check |
| `rollout_stages` | [[rollout_stages]] | a small fraction of capacity first, then the rest, with a hold between stages | more stages limit the blast radius and lengthen a deploy; one stage is simplest and exposes everything at once |
| `regression_halt_signals` | [[regression_halt_signals]] | error rate and latency of the new version against the old one, and every service-level objective in `01-business/availability.md` | fewer signals are simpler and miss regressions; more signals halt on noise |
| `last_known_good_retention` | [[last_known_good_retention]] | the previous 3 production artifacts and their configuration | longer retention costs storage and widens what must stay deployable |
| `version_skew_window` | [[version_skew_window]] | the previous version only: two adjacent versions interoperate | a wider window eases slow rollouts and multiplies compatibility testing |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] What is the deployment target, and which ADR records it?
- [ ] How long must a shutdown be allowed to drain in-flight work (R10)?
- [ ] Which operations are performed for customers rather than as deployments (R4), and who may
      start each?

## Rules

### Environments and artifacts

- **R1.** The project MUST have exactly the environments in `environments`, and no resource or
  credential MUST be shared between any two of them.
- **R2.** The artifact deployed to an environment MUST be the exact artifact deployed to the previous
  one, promoted by an immutable identifier, and MUST NOT be rebuilt. An artifact whose
  configuration is fixed at build time MAY be rebuilt from the same commit with frozen
  dependencies, provided its checks run on the rebuilt output.
- **R3.** The first shared environment MUST deploy automatically when the default branch is green,
  and later environments MUST follow `production_approval`; nothing reaches production merely
  because a merge happened.

### Deploying the platform and operating for customers

- **R4.** A change made for or at the request of a customer (propagating a customer's
  configuration to a fleet, provisioning, importing or removing a customer's data, a bulk operation
  on a customer's behalf) MUST NOT be treated as a platform deployment and MUST NOT be released
  through artifact promotion; R2, R3 and R6–R14 do not govern it, R5 does.
- **R5.** Every operation performed for a customer MUST be authorized, recorded with who asked, what
  changed and the outcome, applied to a limited subset first when it targets more than one instance,
  and either have a defined undo or be declared irreversible and treated under R17.

### Rollout and rollback

- **R6.** A rollout MUST follow `rollout_strategy` and MUST NOT reduce serving capacity below what
  `01-business/availability.md` requires.
- **R7.** A rollout MUST proceed through `rollout_stages`. _(applies to: service, daemon)_
  Each stage MUST be held until its signals are healthy before the next begins.
- **R8.** A rollout MUST halt, without proceeding to the next stage, when any signal in
  `regression_halt_signals` regresses. _(applies to: service, daemon)_
  A halted rollout MUST be resolved by a human decision to continue or to roll back.
- **R9.** A deployment MUST roll back automatically when the new version fails its health checks.
- **R10.** The shutdown grace period MUST be long enough for readiness to fail, background work to
  stop and in-flight work to finish (`07-observability/health.md`). _(applies to: service, daemon)_
- **R11.** A deploy MUST be verified after the call returns: steady state reached and health
  endpoints answering; until then it is not done. _(applies to: service, daemon)_
- **R12.** A rollback for any reason other than R9 MUST be a human decision, performed by
  redeploying the previous artifact and never by rebuilding.
- **R13.** The last known good artifact and its configuration MUST remain deployable for
  `last_known_good_retention`. _(applies to: service, daemon)_
  A rollback target outside that set MUST NOT be assumed to exist.
- **R14.** During a rollout, versions running side by side MUST interoperate for the whole of
  `version_skew_window`. _(applies to: service, daemon)_
  A change that breaks interoperation with the previous version MUST be split into compatible steps
  across releases.

### Configuration and secrets

- **R15.** Configuration MUST reach a running unit from its environment, MUST be validated once at
  startup, and a unit with invalid configuration MUST refuse to start.
- **R16.** A unit MUST be able to read only its own environment's configuration and secrets.

### Irreversible data changes

- **R17.** A destructive or irreversible change to data in a shared environment MUST be performed
  or approved by a human, and an AI agent MUST NOT execute it (`16-ai/prohibitions.md` P16). A
  change that can be written by an agent MAY be authored by one.

### Data protection and releases

- **R18.** Backups and restore exercises MUST meet `01-business/availability.md` R7, R14; this document
  adds no restore rule of its own.
- **R19.** A release MUST be produced by a pipeline from a version tag on the default branch, which
  also produces the changelog per `14-git/git.md` R19, and published per
  `15-delivery/releases-and-distribution.md`.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | Separate infrastructure definitions per environment; no shared resource | ⬜ scheduled |
| R2 | Promotion job takes an artifact identifier and has no build step | ⬜ scheduled |
| R3 | Deployment pipeline with an approval gate on production | ⬜ scheduled |
| R4, R5 | Customer operations run through their own job or tool, not the deployment pipeline; each run is recorded | ⬜ scheduled |
| R6 | Rollout settings in the deployment definition | ⬜ scheduled |
| R7, R8 | Staged rollout with automated analysis of the halt signals in the deployment definition | ⬜ scheduled |
| R9 | Rollback setting in the deployment definition | ⬜ scheduled |
| R10 | Grace-period setting in the deployment definition | ⬜ scheduled |
| R11 | Pipeline step waiting for steady state plus a health-endpoint smoke request | ⬜ scheduled |
| R12 | PR review; a documented runbook step | ❌ review-only |
| R13 | Artifact-registry retention policy; a periodic rollback drill | ⬜ scheduled |
| R14 | Compatibility test of adjacent versions in CI; review of the change plan | ⬜ scheduled |
| R15 | Configuration schema validated at startup; a lint rule banning direct environment reads elsewhere | ⬜ scheduled |
| R16 | Access policy scoped to one environment, reviewed as infrastructure code | ⬜ scheduled |
| R17 | Permission rules denying agents write access to shared data; `16-ai/prohibitions.md` | ◐ partial |
| R18 | See `01-business/availability.md` | ⬜ scheduled |
| R19 | Release workflow | ⬜ scheduled |

## AI guardrails

- Never rebuild an artifact for a later environment; promote the identical one.
- A customer operation is not a deployment; never ship one through the deployment pipeline.
- Never execute a destructive or irreversible data change in a shared environment. You may write one.
- Never continue a halted rollout; a human decides.
- Never deploy a change that breaks the previous version's interoperation in one release.
- Roll back by redeploying the previous artifact, never by rebuilding.

## References

- `15-delivery/pipeline-and-gates.md` — gates before merge
- `15-delivery/releases-and-distribution.md` — versioning and publishing
- `01-business/availability.md` — capacity, recovery targets, backups and restore
- `07-observability/health.md` — graceful shutdown
- `16-ai/prohibitions.md` — agents and irreversible operations (P16)
- `14-git/git.md` — release tags and changelog
