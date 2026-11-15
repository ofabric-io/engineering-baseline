---
layer: packs/ledger
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Ledger & Balances

## Purpose

Double-entry bookkeeping: journal entries, accounts, balances and reconciliation, so that "how
much does this owner have" has exactly one authoritative answer. This document does not decide
the chart of accounts, which money movements the product has, or their lifecycles — those are
the project's.

Requires pack(s): `money`.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `ledger_owner` | [[ledger_owner]] | the isolation unit, plus one platform owner | finer owners give finer balances and more ledgers to reconcile |
| `chart_of_accounts` | [[chart_of_accounts]] | `owner_receivable`, `owner_available`, `owner_reserved`, `platform_revenue`, `external_clearing` — illustrative only; the project replaces it | every account is a thing to reconcile; too few hides where money is |
| `balance_projection` | [[balance_projection]] | balance rows updated in the same transaction as the entries; reconciled against entries on a schedule | summing entries per request does not scale |
| `reconciliation_schedule` | [[reconciliation_schedule]] | daily | more frequent finds drift sooner and costs more reads |
| `overdraft_policy` | [[overdraft_policy]] | no account of an owner may go negative unless the chart marks it as allowed | allowing a negative balance simplifies reversals and moves risk to the platform |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] The chart of accounts: which accounts exist, each one's normal side, and who may post to it.
- [ ] Which domain events cause postings, and which journal entry each produces.
- [ ] Time-based movements (a receivable maturing, a scheduled release): which exist, and what
      posts them? Specify per project; this document gives no default.
- [ ] Does any movement need an approval step before it posts?

## Rules

### Entries

- **R1.** Bookkeeping MUST be double-entry. A movement is one **journal entry** containing two or
  more **entries**, and the entries of a journal entry MUST sum to exactly zero.
- **R2.** An entry's amount MUST be a signed integer at the internal scale of the money pack
  (`money.md` R1, R2). The project MUST fix one sign convention (for example debit positive,
  credit negative), and each account MUST declare its normal side so displayed balances read
  naturally.
- **R3.** A **ledger** is the pair (owner, currency). The currency belongs to the ledger, every
  account and entry inherits it, and it MUST NOT change.
- **R4.** All entries of one journal entry MUST belong to ledgers of the same currency. A
  cross-currency movement MUST be two journal entries linked by an explicit conversion record,
  never one journal entry holding two currencies (`money.md` R9, R11).
- **R5.** Entries and journal entries MUST be append-only: never updated, never deleted. A mistake
  MUST be corrected by a reversing journal entry that references the original.
- **R6.** The accounts a ledger may hold MUST be exactly those in `chart_of_accounts`. A new
  account type requires amending that chart, and an account MUST NOT be created ad hoc at runtime.
- **R7.** A journal entry MUST NOT be posted unless it balances (R1). The database MUST enforce
  this at commit, not only the application.

### Authority and consistency

- **R8.** The ledger MUST be the single authority on funds. Any question of the form "how much
  does this owner have" MUST read the ledger, never another table that also records amounts.
- **R9.** A posting MUST be one transaction touching every account in the journal entry. A
  balanced posting MUST NOT be split across a transaction boundary.
- **R10.** The ledger MUST learn that money moved from events published by the domain (see
  `08-reliability/` for delivery guarantees), not from direct writes by the code that moved it.
- **R11.** A ledger consumer MUST be idempotent. Every journal entry MUST record the identifier of
  the source event that caused it, under a unique constraint, so a redelivered event posts once.
  A duplicate MUST be a no-op, not an error.
- **R12.** The overdraft policy in `overdraft_policy` MUST be enforced in the same transaction as
  the posting that would breach it.

### Balances

- **R13.** A balance row per account MUST carry the current amount and MUST be updated in the same
  transaction as the entries that change it.
- **R14.** Entries MUST remain the source of truth. A reconciliation job MUST run on
  `reconciliation_schedule`, recompute every balance from its entries and compare.
- **R15.** Any reconciliation drift MUST be handled as an incident, not only counted as a metric.
- **R16.** A balance MUST NOT be computed by summing entries in a request path.

### Verification

- **R17.** Every new posting type MUST have a test asserting that its journal entry balances, is
  idempotent on a redelivered source event, and leaves the balance rows equal to a recomputation
  from entries.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1, R7 | Commit-time constraint in storage that rejects an unbalanced journal entry; unit test | ⬜ scheduled |
| R2, R3 | Ledger types and a storage constraint on currency; review of the sign convention | ◐ partial |
| R4 | Storage constraint that all entries of a journal entry share a currency | ⬜ scheduled |
| R5 | Update and delete permissions revoked from the application role; integration test | ⬜ scheduled |
| R6 | Account type constrained to the chart in storage; review when the chart changes | ⬜ scheduled |
| R8 | Architecture test: no other module reads or writes funds columns | ⬜ scheduled |
| R9, R12, R13 | Single transaction helper for postings; integration test of failure rollback | ⬜ scheduled |
| R10 | Review of the consumer wiring | ❌ review-only |
| R11 | Unique constraint on the source event identifier; redelivery test | ⬜ scheduled |
| R14, R15 | Scheduled reconciliation job and an alert on any non-zero drift | ⬜ scheduled |
| R16 | Architecture test on aggregate queries over entries in request paths | ⬜ scheduled |
| R17 | Shared posting test helper; review that new posting types use it | ⬜ scheduled |

## AI guardrails

```text
Double-entry: every journal entry sums to exactly zero, in ONE currency.
Entries are append-only. Correct a mistake with a reversing entry. Never update, never delete.
Funds are read from the ledger only. Never from another table that also holds amounts.
Consumers are idempotent, keyed on the source event id. A duplicate is a no-op.
Update the balance row in the same transaction as its entries.
NEVER sum entries in a request path. Invent no account outside the chart of accounts.
```

## References

- `packs/money/money.md` — amounts, scale and currencies
- `08-reliability/` — delivery guarantees for the events the ledger consumes
- [ISO 4217 — Currency codes](https://www.iso.org/iso-4217-currency-codes.html)
