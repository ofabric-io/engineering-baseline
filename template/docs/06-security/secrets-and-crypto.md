---
layer: 06-security
status: not-started # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Secrets & Cryptography

## Purpose

Where secrets live, how they rotate, and which cryptographic primitives are allowed.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `secret_store` | [[secret_store]] | decided in 13-technology/ | never in the repository |
| `rotation_policy` | [[rotation_policy]] | every secret rotatable without downtime | two valid versions during rotation |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

<!-- baseline: proposed default rules land here in a later baseline release. -->

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |

## AI guardrails

## References
