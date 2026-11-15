---
layer: 03-architecture
status: not-started # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# System Architecture

## Purpose

The shape of the system: deployables, internal boundaries, and how parts communicate.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `system_shape` | [[system_shape]] | modular monolith | split a service out only on a measured need, recorded as an ADR |
| `boundaries` | [[boundaries]] | listed by the bootstrap | each owns its data exclusively |
| `cross_boundary_communication` | [[cross_boundary_communication]] | events for notification; published interfaces for queries | synchronous coupling vs. eventual consistency |
| `infrastructure_baseline` | [[infrastructure_baseline]] | decided in 13-technology/ | each added component is an operational cost and needs an ADR |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

<!-- baseline: proposed default rules land here in a later baseline release. -->

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |

## AI guardrails

## References
