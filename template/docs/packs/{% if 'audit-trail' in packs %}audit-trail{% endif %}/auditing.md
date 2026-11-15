---
layer: packs/audit-trail
status: not-started # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Audit Trail

## Purpose

What is audited, the shape of a record, its delivery guarantee and retention.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `audited_actions` | [[audited_actions]] | every state change, every privileged read, every agent action | — |
| `delivery_guarantee` | [[delivery_guarantee]] | asynchronous, best-effort, with loss counted and alerted | a guaranteed path (same transaction / outbox) costs latency |
| `retention` | [[retention]] | 5 years | set by 01-business/compliance-and-data.md |
| `customer_visible` | [[customer_visible]] | yes, own records only | — |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

<!-- baseline: proposed default rules land here in a later baseline release. -->

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |

## AI guardrails

## References
