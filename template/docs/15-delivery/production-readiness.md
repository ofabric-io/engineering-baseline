---
layer: 15-delivery
status: proposed
owner: TBD
last-reviewed: never
---

# Production Readiness Gate

## Purpose

Every decision deferred with the words "before production" or "before launch", collected in one
register. A temporary relaxation nobody remembers to reverse becomes permanent, and it becomes
permanent exactly when the protection starts to matter. This document is the mechanism against
that; the register itself is project content.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `readiness_closer` | [[readiness_closer]] | a named human other than the owner of the work the row unblocks | a smaller team may have to allow a peer; self-closing defeats the gate |
| `production_definition` | [[production_definition]] | the first moment anyone outside the project's team uses it or it holds real data, whichever comes first | an earlier moment gates sooner and slows the first release; a later one lets relaxations harden before the gate applies |
| `register_review_cadence` | [[register_review_cadence]] | at every release-planning point | less frequent review finds the list late |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

- **R1.** Production deployment, from the moment in `production_definition`, MUST be blocked until every open row in the register is closed.
- **R2.** A row MUST be closed by `readiness_closer`; the owner of the work a row unblocks MUST NOT
  close it.
- **R3.** A row MAY be closed as "accepted risk" instead of done, but only with a named human, a
  date and a written reason.
- **R4.** A deferral recorded anywhere in `docs/` MUST add a row to the register in the same change.
- **R5.** The register MUST be reviewed at `register_review_cadence`, not only at the end.
- **R6.** A temporary relaxation of a rule, guard or gate MUST have a register row naming what it
  must be reverted to.
- **R7.** Each row MUST carry an owner and a source (the document or decision that created it).

## The register

The project keeps its register in this document, one table per category. Rows below are the
defaults every project starts with; add and close rows as the project proceeds.

### Relaxations to reverse

| # | What | Reverse to | Source |
| --- | --- | --- | --- |
| G1 | _none yet_ | | |

### Decisions still owed

| # | What | Owner | Source |
| --- | --- | --- | --- |
| D1 | _none yet_ | | |

### Enforcement still to build

| # | What | Source |
| --- | --- | --- |
| E1 | Every rule marked scheduled in the Enforcement tables of standards that apply to production has its mechanism | each document's `## Enforcement` |
| E2 | Blocking CI gates for every level in `12-testing/strategy.md` `test_levels` | `15-delivery/pipeline-and-gates.md` |

### Operational readiness

| # | What | Source |
| --- | --- | --- |
| O1 | A backup restored, not merely taken | `01-business/availability.md` R7 |
| O2 | Recovery time and recovery point objectives demonstrated, not assumed | `01-business/availability.md` |
| O3 | Alerting live on the service-level objectives, with an owner per alert | `01-business/availability.md` |
| O4 | Tests passing at the highest level in `12-testing/strategy.md` `test_levels` for each critical user flow | `12-testing/strategy.md` |
| O5 | First incident runbook written, following the incident process | `07-observability/incident-management.md` |

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | The production deploy job reads the register and refuses while a row is open | ⬜ scheduled |
| R2, R3 | PR review; each closed row names a human and a date | ❌ review-only |
| R4 | PR review; a deferral without a row is a review rejection; a search for "before production" in `docs/` should find nothing unregistered | ◐ partial |
| R5 | Release-planning practice | ❌ review-only |
| R6, R7 | PR review | ❌ review-only |

## AI guardrails

- Production is blocked until every open row is closed.
- Deferring anything in `docs/` means adding a register row in the same change.
- Never close a row for work you own. Never close one silently; accepted risk needs a named human,
  a date and a reason.
- A temporary relaxation gets a row naming what to revert it to.

## References

- `15-delivery/deployments-and-rollback.md` — deployment and rollback
- `15-delivery/pipeline-and-gates.md` — gates the register depends on
- `01-business/availability.md` — objectives, backups and restore behind the operational rows
- `07-observability/incident-management.md` — the incident runbook behind O5
- `04-adr/README.md` — recording a deferral as a decision
