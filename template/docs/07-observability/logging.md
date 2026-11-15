---
layer: 07-observability
status: not-started # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Structured Logging

## Purpose

Log format, levels, correlation and what must never be logged.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `log_format` | [[log_format]] | structured JSON, one event per line | human-readable formats do not query well |
| `correlation` | [[correlation]] | request id and trace id on every line | without it, logs from one request cannot be joined |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

<!-- baseline: proposed default rules land here in a later baseline release. -->

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |

## AI guardrails

## References
