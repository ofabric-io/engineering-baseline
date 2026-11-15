---
layer: 14-git
status: not-started # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Git Standards

## Purpose

Branching, commit messages, pull requests, review and release tags.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `branching_model` | [[branching_model]] | trunk-based; short-lived branches | long-lived branches become merge debt |
| `merge_strategy` | [[merge_strategy]] | squash only | one commit per change keeps history bisectable |
| `required_approvals` | [[required_approvals]] | 1, never the author | more reviewers vs. throughput |
| `pr_size_soft_limit` | [[pr_size_soft_limit]] | 400 changed lines excluding generated files | large PRs are reviewed worse |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

<!-- baseline: proposed default rules land here in a later baseline release. -->

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |

## AI guardrails

## References
