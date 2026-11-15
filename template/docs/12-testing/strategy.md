---
layer: 12-testing
status: not-started # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Testing Strategy

## Purpose

Test levels, what each verifies, coverage gates, and what must always be tested.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `coverage_gate` | [[coverage_gate]] | per changed file, not a global percentage | a global number is satisfiable by testing the wrong things |
| `bug_fix_rule` | [[bug_fix_rule]] | a failing test first | — |
| `property_based_testing_for` | [[property_based_testing_for]] | arithmetic and state machines | — |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

<!-- baseline: proposed default rules land here in a later baseline release. -->

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |

## AI guardrails

## References
