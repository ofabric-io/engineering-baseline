---
layer: 02-domain
status: not-started # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Identifiers

## Purpose

How entities are identified internally and publicly, and what an identifier must never do.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `internal_id_format` | [[internal_id_format]] | UUIDv7 (RFC 9562) | time-ordered and index-friendly; a sequential integer leaks volume and order |
| `public_id_format` | [[public_id_format]] | type-prefixed opaque string, e.g. `<prefix>_<encoded>` | self-describing in logs and support tickets; a raw UUID is not |
| `natural_keys_as_primary_keys` | [[natural_keys_as_primary_keys]] | forbidden | natural keys change; identifiers must not |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

<!-- baseline: proposed default rules land here in a later baseline release. -->

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |

## AI guardrails

## References
