---
layer: packs/webhooks
status: not-started # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Outbound Webhooks

## Purpose

Delivering integration events to external endpoints: signing, retries, disabling and rotation.

Requires pack(s): `events`.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `signature_scheme` | [[signature_scheme]] | HMAC-SHA256 over "timestamp.body" | RFC 9421 HTTP Message Signatures is the long-term standard; library support decides |
| `retry_schedule` | [[retry_schedule]] | 8 attempts over ~24 hours | — |
| `auto_disable_after` | [[auto_disable_after]] | 7 days of continuous failure | — |
| `replay_tolerance` | [[replay_tolerance]] | 5 minutes | — |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

<!-- baseline: proposed default rules land here in a later baseline release. -->

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |

## AI guardrails

## References
