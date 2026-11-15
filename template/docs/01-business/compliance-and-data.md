---
layer: 01-business
status: not-started # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Compliance, Auditability & Data Retention

## Purpose

Which regulatory regimes apply, what records must be kept and for how long, and what must be deletable.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `regulatory_regimes` | [[regulatory_regimes]] | none declared | e.g. GDPR, LGPD, PCI DSS, SOC 2, HIPAA — each adds rules here |
| `record_retention` | [[record_retention]] | decided per data class in 06-security/sensitive-data.md | a single global period is simpler but rarely correct |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

<!-- baseline: proposed default rules land here in a later baseline release. -->

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |

## AI guardrails

## References
