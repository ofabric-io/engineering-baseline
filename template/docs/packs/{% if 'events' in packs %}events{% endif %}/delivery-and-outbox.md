---
layer: packs/events
status: not-started # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Delivery, Outbox & Ordering

## Purpose

How events are published reliably and what consumers must tolerate.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `publish_mechanism` | [[publish_mechanism]] | transactional outbox | dual writes lose events |
| `delivery_guarantee` | [[delivery_guarantee]] | at-least-once; consumers deduplicate on event id | — |
| `ordering` | [[ordering]] | per entity only | global ordering does not scale |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

<!-- baseline: proposed default rules land here in a later baseline release. -->

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |

## AI guardrails

## References
