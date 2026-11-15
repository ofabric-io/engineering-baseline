---
layer: 02-domain
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Time Semantics

## Purpose

How instants, dates and durations are represented, and where time comes from.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `zone_of_record` | [[zone_of_record]] | UTC for instants; an explicit named zone for business dates | implicit local time causes off-by-one-day bugs |
| `clock_source` | [[clock_source]] | injected clock; no direct system-clock reads in domain code | testability of expiry logic |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

- **R1.** Instants MUST be stored and exchanged in UTC.
- **R2.** Business dates MUST carry the zone named in `zone_of_record`.
- **R3.** Domain code MUST obtain the current time from `clock_source`.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | schema review | ❌ |
| R2 | schema review | ❌ |

## AI guardrails

- Never read the system clock directly in domain code.

## References

- RFC 3339 — date and time on the Internet
