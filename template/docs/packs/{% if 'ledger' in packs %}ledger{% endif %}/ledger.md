---
layer: packs/ledger
status: not-started # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Ledger & Balances

## Purpose

Double-entry bookkeeping: journal entries, accounts, balances and reconciliation.

Requires pack(s): `money`.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `chart_of_accounts` | [[chart_of_accounts]] | defined by the project | — |
| `balance_projection` | [[balance_projection]] | balance rows updated in the same transaction; reconciled against entries on a schedule | summing entries per request does not scale |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

<!-- baseline: proposed default rules land here in a later baseline release. -->

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |

## AI guardrails

## References
