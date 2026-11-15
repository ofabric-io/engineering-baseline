---
layer: packs/money
status: not-started # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Monetary Amounts

## Purpose

How money is represented, computed, rounded, serialized and stored.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `representation` | [[representation]] | integer minor units at a fixed internal scale, plus ISO 4217 currency | floating point is forbidden |
| `internal_scale` | [[internal_scale]] | 6 decimal places | more than any currency needs, so FX and fees do not lose precision |
| `rounding_mode` | [[rounding_mode]] | half-up, passed explicitly, only at named business boundaries | banker's rounding is common in accounting |
| `multi_currency` | [[multi_currency]] | single currency | multi-currency adds conversion rules (a future fx pack) |
| `wire_format` | [[wire_format]] | amount as an integer string + currency code | JSON numbers lose precision in many clients |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

<!-- baseline: proposed default rules land here in a later baseline release. -->

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |

## AI guardrails

## References
