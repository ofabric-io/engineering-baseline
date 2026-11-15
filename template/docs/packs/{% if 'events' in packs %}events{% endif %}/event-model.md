---
layer: packs/events
status: not-started # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Event Model & Naming

## Purpose

What an event is, its envelope, naming and content rules.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `envelope` | [[envelope]] | CloudEvents 1.0, JSON | — |
| `naming` | [[naming]] | <org>.<boundary>.<entity>.<past-tense-verb>.v<n> | — |
| `event_kinds` | [[event_kinds]] | domain (internal) and integration (published) | publishing domain events directly couples consumers to internals |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

<!-- baseline: proposed default rules land here in a later baseline release. -->

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |

## AI guardrails

## References
