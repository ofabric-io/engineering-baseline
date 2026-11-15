---
layer: 06-security
status: not-started # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Authentication & Authorization

## Purpose

Who the actors are, how they prove identity, and how permissions are decided and enforced.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `actor_types` | [[actor_types]] | listed by the bootstrap (e.g. end user, operator, service, agent) | each needs its own credential type |
| `authorization_model` | [[authorization_model]] | role-based, checked server-side on every request | attribute-based is more expressive and harder to audit |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

<!-- baseline: proposed default rules land here in a later baseline release. -->

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |

## AI guardrails

## References
