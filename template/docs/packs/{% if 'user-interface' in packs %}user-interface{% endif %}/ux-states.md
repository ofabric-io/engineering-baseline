---
layer: packs/user-interface
status: not-started # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Interface States & Error Presentation

## Purpose

Every asynchronous surface handles all of its states explicitly, errors are presented consistently, and irreversible actions are protected.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `async_states` | [[async_states]] | loading, empty, error, success, partial | a surface missing one shows a blank or a spinner forever |
| `error_presentation` | [[error_presentation]] | keyed off stable error codes; unknown codes show a generic message plus a copyable request id | free-text server messages leak internals and cannot be translated |
| `irreversible_actions` | [[irreversible_actions]] | listed by the bootstrap; never optimistic, never retried by a plain re-click, confirmed when destructive | — |
| `crash_containment` | [[crash_containment]] | a rendering failure is contained to its view, never blanking the application | — |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

<!-- baseline: proposed default rules land here in a later baseline release. -->

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |

## AI guardrails

## References
