---
layer: 08-reliability
status: proposed # not-started | proposed | in-progress | ratified | not-applicable
owner: TBD
last-reviewed: never
applies-to: [service, daemon]
---

# Load Shedding

## Purpose

How a running component refuses work it cannot finish when it is overloaded.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `shed_threshold` | [[shed_threshold]] | 80% of measured capacity | earlier shedding protects latency, later shedding serves more |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

- **R1.** A component MUST refuse new work above `shed_threshold` rather than queue it without bound.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | load test | ⬜ |

## AI guardrails

- Never add an unbounded queue in front of a component.

## References

- `03-architecture/system.md`
