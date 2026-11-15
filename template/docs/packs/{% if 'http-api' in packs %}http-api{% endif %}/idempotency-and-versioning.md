---
layer: packs/http-api
status: not-started # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Idempotency, Versioning & Deprecation

## Purpose

Safe retries of state-changing requests, API versions, and how versions are retired.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `idempotency_key_required_for` | [[idempotency_key_required_for]] | every non-idempotent state-changing request | Idempotency-Key is an IETF draft, labelled as such |
| `versioning_scheme` | [[versioning_scheme]] | major version in the URL path | header versioning is invisible in logs |
| `deprecation_notice_period` | [[deprecation_notice_period]] | 6 months, RFC 9745 Deprecation + RFC 8594 Sunset | — |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

<!-- baseline: proposed default rules land here in a later baseline release. -->

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |

## AI guardrails

## References
