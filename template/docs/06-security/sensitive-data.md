---
layer: 06-security
status: not-started # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Sensitive Data Handling

## Purpose

How personal and secret data are classified, stored, logged (or not) and deleted.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `data_classes` | [[data_classes]] | public, internal, personal, secret | more classes = finer control, more to get wrong |
| `never_log` | [[never_log]] | secrets, credentials, full personal data | logs are the most common leak |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

<!-- baseline: proposed default rules land here in a later baseline release. -->

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |

## AI guardrails

## References
