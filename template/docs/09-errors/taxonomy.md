---
layer: 09-errors
status: not-started # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Error Handling & Taxonomy

## Purpose

Error categories, stable error codes, when to throw and when to return a result, and where errors are translated and logged.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `error_categories` | [[error_categories]] | domain, application, infrastructure, transport | each maps to a handling strategy |
| `result_type_usage` | [[result_type_usage]] | only for expected domain failures | mixing styles for one failure mode confuses callers |
| `error_code_style` | [[error_code_style]] | SCREAMING_SNAKE, namespaced, append-only | codes are a contract once published |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

<!-- baseline: proposed default rules land here in a later baseline release. -->

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |

## AI guardrails

## References
