---
layer: 08-reliability
status: not-started # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Concurrency, Locking & Idempotency

## Purpose

How concurrent writes are controlled, how operations are made safe to retry, and how jobs behave under at-least-once execution.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `default_concurrency_control` | [[default_concurrency_control]] | optimistic (version column) | pessimistic locks only where named |
| `idempotency_required_for` | [[idempotency_required_for]] | every operation with an external side effect | exactly-once does not exist across a network |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

<!-- baseline: proposed default rules land here in a later baseline release. -->

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |

## AI guardrails

## References
