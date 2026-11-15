---
layer: 15-delivery
status: not-started # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Deployments & Rollback

## Purpose

How changes reach production, how they are rolled back, and how schema and code changes are sequenced.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `deploy_target` | [[deploy_target]] | undecided until an ADR picks one | nothing may assume a target before then |
| `rollout_strategy` | [[rollout_strategy]] | decided when the first production deployment is planned | progressive rollout vs. simplicity |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

<!-- baseline: proposed default rules land here in a later baseline release. -->

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |

## AI guardrails

## References
