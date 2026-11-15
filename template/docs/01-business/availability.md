---
layer: 01-business
status: not-started # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Availability, SLOs & Human Approval

## Purpose

How available the system must be, how that is measured, and which operations always need a human.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `slo_policy` | [[slo_policy]] | no SLOs before the first production deployment; defined per user-facing journey after | committing to numbers before measuring them |
| `human_approval_required_for` | [[human_approval_required_for]] | irreversible data changes, production deployments, credential rotation | more automation vs. more control |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

<!-- baseline: proposed default rules land here in a later baseline release. -->

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |

## AI guardrails

## References
