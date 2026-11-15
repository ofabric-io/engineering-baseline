---
layer: 01-business
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Availability, SLOs & Human Approval

## Purpose

How available the system must be, how that is measured, and which operations always need a human. The numbers constrain the deploy target, the infrastructure and the on-call expectation, so they are decided here rather than discovered later. The numbers themselves are the project's `slo_policy`; this document decides how they are set and used.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `slo_policy` | [[slo_policy]] | no SLOs before the first production deployment; defined per user-facing journey after | committing to numbers before measuring them |
| `slo_exhaustion_response` | [[slo_exhaustion_response]] | stop and review: when a budget is exhausted, work on that journey pauses until the budget is restored or a named person decides how to proceed | a hard freeze protects users and slows delivery; a review-only response is faster and easier to ignore |
| `recovery_objectives` | [[recovery_objectives]] | RPO and RTO declared per data store once there is production data | tighter objectives cost more in replication and rehearsal |
| `maintenance_windows` | [[maintenance_windows]] | not permitted on journeys that have an SLO | zero-downtime changes are harder than a window, but windows break the SLO |
| `human_approval_required_for` | [[human_approval_required_for]] | irreversible data changes, production deployments, credential rotation | more automation vs. more control |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Who is the named person who decides how to proceed when a budget is exhausted?

## Rules

### Targets

- **R1.** Each user-facing journey that has an SLO MUST declare an availability target, a latency target at a stated percentile, and the error budget that follows, as recorded in `slo_policy`. _(applies to: service, ui)_
- **R2.** An SLO MUST be measured end to end as the user experiences it, including third-party dependencies; a dependency's latency is bounded by timeouts (`08-reliability/timeouts-retries.md`), not excluded from the number. _(applies to: service, ui)_
- **R3.** A guarantee on work the project does not control (a delivery to an external endpoint, for example) MUST be written as an eventual guarantee with a time bound, not as a latency promise.
- **R4.** A target MUST NOT be published or tightened until a measurement shows it is already met.

### Recovery

- **R5.** Each data store that holds a source of truth MUST declare a recovery point objective and a recovery time objective in `recovery_objectives`.
- **R6.** A store that is rebuildable from another source MUST be declared as such, with its objective stated as loss of everything.
- **R7.** A restore MUST be exercised successfully before the first production deployment and on a recurring schedule thereafter, with the outcome recorded; an unrestored backup is not a backup.
- **R14.** Each source-of-truth store MUST be backed up often enough to meet its recovery point objective, with backups kept apart from the data they protect and retained per the retention table in `06-security/sensitive-data.md`. This document owns backup and restore; other documents cite it.

### Error budget

- **R8.** When a journey's error budget is exhausted for its window, the project MUST respond as `slo_exhaustion_response` says. _(applies to: service, ui)_
- **R9.** Budget consumption MUST be visible before it is spent, by burn-rate alerting rather than a periodic summary (`07-observability/metrics-and-tracing.md`). _(applies to: service, ui)_
- **R10.** Where `maintenance_windows` forbids a window, changes to that journey MUST be deployable without downtime (`15-delivery/deployments-and-rollback.md`). _(applies to: service, ui)_

### Human approval

- **R11.** The actions in `human_approval_required_for` MUST receive explicit human approval for each occurrence, and MUST NOT be automated.
- **R12.** No AI agent may perform an action listed in `human_approval_required_for`; what an agent may merge is decided in `16-ai/autonomy-and-context.md`.
- **R13.** An approved action MUST leave a record that names the human who approved it, not only the system that executed it.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1–R3 | SLO definitions as code, with burn-rate alerts (tool chosen in `13-technology/`) | ⬜ scheduled |
| R4 | PR review; a tightened target needs a measurement attached | ❌ review-only |
| R5, R6, R14 | Backup configuration and declared objectives, reviewed per store | ⬜ scheduled |
| R7 | Scheduled restore exercise with a recorded outcome | ⬜ scheduled |
| R8 | Review when the budget alert fires, following `slo_exhaustion_response` | ❌ review-only |
| R9 | Burn-rate alerting | ⬜ scheduled |
| R10 | Deployment gate for zero-downtime changes (`15-delivery/pipeline-and-gates.md`) | ⬜ scheduled |
| R11, R12 | Branch protection, approval gates and agent permission rules | ◐ partial |
| R13 | Approval records captured by the pipeline or audit mechanism | ⬜ scheduled |

## AI guardrails

```text
Measure SLOs end to end, including third parties. Their latency is ours to bound with
timeouts, not our excuse.
Never promise prompt delivery to a system we do not control; promise eventual, with a bound.
Never publish or tighten a target without a measurement showing it is already met.
Never perform, and never automate, an action in human_approval_required_for. Stop and ask.
Back up and test restores per R5-R7 and R14.
```

## References

- `08-reliability/timeouts-retries.md` — how third-party latency is bounded
- `07-observability/metrics-and-tracing.md` — burn-rate alerting inputs
- `15-delivery/deployments-and-rollback.md` — zero-downtime changes
- `16-ai/operating-procedure.md` — the approval gate for agents
- [Site Reliability Engineering, ch. 4 "Service Level Objectives"](https://sre.google/sre-book/service-level-objectives/)
