---
layer: 02-domain
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Time Semantics

## Purpose

How instants, dates, durations and time zones are represented, and where time comes from. Every deadline, expiry and cut-off is a bug if time is sloppy.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `zone_of_record` | [[zone_of_record]] | UTC for instants; an explicit named zone for business dates | implicit server-local time is the classic source of off-by-one-day bugs |
| `instant_precision` | [[instant_precision]] | milliseconds | finer precision rarely survives every hop |
| `clock_source` | [[clock_source]] | injected clock port; no direct system-clock reads in domain code | testability of expiry and deadline logic |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Which named zone is the business zone of record, and which holiday or non-working-day calendar applies, if business days matter at all?

## Rules

### Instants

- **R1.** An instant MUST be stored and processed in UTC, and serialised as RFC 3339 with a `Z` suffix.
- **R2.** Instants MUST be carried at `instant_precision`; finer precision MUST NOT be relied on for ordering.
- **R3.** An instant field MUST be named with an `At` suffix (or the project's equivalent convention in `11-style/naming-and-style.md`).
- **R4.** A local time MUST NOT be stored or appear in an interface payload; local time is a presentation concern computed at the edge from the viewer's zone.

### The clock

- **R5.** Domain and application code MUST obtain the current time from `clock_source`, never by reading the system clock directly.
- **R6.** A test MUST use a controlled clock; a test that depends on the wall clock MUST NOT be committed.

### Dates without time

- **R7.** A calendar date with no time of day (a due date, a statement period) MUST be a distinct date-only type, serialised as an ISO 8601 date (`YYYY-MM-DD`), never an instant at midnight.

### Business time

- **R8.** Business-day and cut-off calculations MUST use the business zone named in `zone_of_record`, stated explicitly at every call site and never defaulted from the host.
- **R9.** Non-working days MUST come from an explicit calendar held as data, not from a weekday check.

### Durations

- **R10.** A duration MUST be an integer with its unit in the name (`timeoutMs`, `ttlSeconds`); a bare `timeout` is prohibited.
- **R11.** A duration MUST NOT be stored as a string; an ISO 8601 duration string is permitted on the wire and MUST be parsed at the boundary.
- **R12.** A duration derived from two instants MUST be produced by a helper that returns a named-unit value, never by subtracting into a bare number.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1–R3 | Column or field type convention, serialiser, naming lint (tools chosen in `13-technology/`) | ⬜ scheduled |
| R4 | Review; no local-time type exists | ❌ review-only |
| R5 | Lint rule banning direct clock reads in domain and application paths | ⬜ scheduled |
| R6 | Review; test-suite convention (`12-testing/strategy.md`) | ❌ review-only |
| R7 | Distinct date-only type; schema check | ⬜ scheduled |
| R8 | Date helpers that take the zone as a required argument | ⬜ scheduled |
| R9 | Calendar as data, with a test for a weekday holiday | ⬜ scheduled |
| R10 | Naming lint for unit suffixes; review | ◐ partial |
| R11, R12 | Duration helpers are the only conversion path | ⬜ scheduled |

## AI guardrails

```text
Instants: UTC, RFC 3339 with Z, named *At. Never store or send a local time.
Never read the system clock in domain or application code. Use the injected clock.
A date with no time is a date-only type, never a timestamp at midnight.
State the zone explicitly in business-day maths; never use the host's zone.
Durations carry their unit in the name. Never a bare timeout, never subtract dates into a number.
```

## References

- `05-protocols/rfc-profile.md` — standards for time formats
- `11-style/naming-and-style.md` — unit suffixes in names
- `12-testing/strategy.md` — deterministic tests
- [RFC 3339 — Date and Time on the Internet](https://www.rfc-editor.org/rfc/rfc3339)
- [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) — dates and durations
