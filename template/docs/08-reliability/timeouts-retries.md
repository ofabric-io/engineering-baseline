---
layer: 08-reliability
status: not-started # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Timeouts, Retries & Degradation

## Purpose

Every outbound call has a timeout, retries are bounded with backoff and jitter, and degradation is designed rather than accidental.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `default_timeout` | [[default_timeout]] | set explicitly per call; none unbounded | a missing timeout turns a slow dependency into an outage |
| `retry_policy` | [[retry_policy]] | capped attempts, exponential backoff with jitter, only for idempotent operations | retry storms |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

<!-- baseline: proposed default rules land here in a later baseline release. -->

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |

## AI guardrails

## References
