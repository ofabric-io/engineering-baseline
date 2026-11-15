---
layer: 03-architecture
status: not-started # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Dependency Rules

## Purpose

Which parts of the code may depend on which, and how violations are prevented.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `layering_model` | [[layering_model]] | dependencies point inward: adapters → application → domain | the domain must not know about frameworks or I/O |
| `boundary_enforcement` | [[boundary_enforcement]] | automated module-boundary check, chosen in 13-technology/ | review-only boundaries erode |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

<!-- baseline: proposed default rules land here in a later baseline release. -->

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |

## AI guardrails

## References
