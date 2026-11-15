---
layer: 15-delivery
status: not-started # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# CI Pipeline & Merge Gates

## Purpose

Which checks run on every change and which must pass before merge.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `required_checks` | [[required_checks]] | baseline checks, lint, type check, tests, security scan | set per technology in 13-technology/ |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

<!-- baseline: proposed default rules land here in a later baseline release. -->

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |

## AI guardrails

## References
