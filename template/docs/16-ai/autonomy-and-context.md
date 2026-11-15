---
layer: 16-ai
status: not-started # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Agent Autonomy & Context

## Purpose

What agents may do on their own, by change type, and what context they must load first.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `autonomy_tiers` | [[autonomy_tiers]] | 1 docs · 2 tests · 3 feature code · 4 security, data migrations, CI, infrastructure, dependencies | which change types need a plan and per-step approval |
| `auto_merge` | [[auto_merge]] | never, at any tier | speed vs. a human having read every change |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

<!-- baseline: proposed default rules land here in a later baseline release. -->

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |

## AI guardrails

## References
