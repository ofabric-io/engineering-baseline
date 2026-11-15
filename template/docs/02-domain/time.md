---
layer: 02-domain
status: not-started # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Time Semantics

## Purpose

How instants, dates, durations and time zones are represented, and where time comes from.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `zone_of_record` | [[zone_of_record]] | UTC for instants; an explicit named zone for business dates | implicit server-local time is the classic source of off-by-one-day bugs |
| `instant_precision` | [[instant_precision]] | milliseconds | finer precision rarely survives every hop |
| `clock_source` | [[clock_source]] | injected clock port; no direct system-clock reads in domain code | testability of expiry and deadline logic |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

<!-- baseline: proposed default rules land here in a later baseline release. -->

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |

## AI guardrails

## References
