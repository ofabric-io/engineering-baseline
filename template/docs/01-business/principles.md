---
layer: 01-business
status: not-started # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Business & Product Principles

## Purpose

What the product is and is not, and the priority order that settles conflicts between goals. Every lower layer is constrained by it.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `scope` | [[scope]] | none — must be answered | the in-scope capabilities for the first release |
| `non_goals` | [[non_goals]] | none — must be answered | capabilities that MUST NOT be built speculatively |
| `priority_order` | [[priority_order]] | correctness > security > availability > latency > operability > delivery speed > cost | a system whose availability matters more than strict correctness (e.g. a data plane) reorders this |
| `priority_order_overrides` | [[priority_order_overrides]] | none | a different order for a named component, e.g. control plane vs data plane |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

<!-- baseline: proposed default rules land here in a later baseline release. -->

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |

## AI guardrails

## References
