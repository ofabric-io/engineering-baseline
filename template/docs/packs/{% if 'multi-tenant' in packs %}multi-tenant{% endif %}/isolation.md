---
layer: packs/multi-tenant
status: not-started # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Tenant Isolation

## Purpose

The isolation unit, how its key is derived, and how isolation is enforced and tested.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `isolation_unit_name` | [[isolation_unit_name]] | tenant | use the domain's word (account, workspace, organization…); the glossary forbids the others |
| `isolation_axes` | [[isolation_axes]] | 1 | a second axis (e.g. end-customer across tenants) doubles the policies |
| `enforcement` | [[enforcement]] | two independent layers (storage-level policy + query filter), chosen in 13-technology/ | one layer is one bug away from a leak |
| `fairness` | [[fairness]] | per-tenant quotas on shared resources | noisy neighbours |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

<!-- baseline: proposed default rules land here in a later baseline release. -->

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |

## AI guardrails

## References
