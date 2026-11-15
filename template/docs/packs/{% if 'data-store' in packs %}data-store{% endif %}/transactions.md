---
layer: packs/data-store
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Transactions

## Purpose

Where a transaction begins and ends, what may happen inside it, and which isolation it runs at. Schema changes are in the pack's migrations document; what a transaction may contain across components is bounded by `03-architecture/system.md`.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `transaction_isolation` | [[transaction_isolation]] | the store's default level, raised per operation only where a stated invariant needs it | a stricter level prevents more anomalies and costs concurrency and retries |
| `transaction_max_duration` | [[transaction_max_duration]] | a few seconds, enforced by the store or the data-access layer | a long transaction holds locks and blocks maintenance; too short a limit fails legitimate work |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

### Boundaries

- **R1.** A transaction MUST begin and end in the application layer, around one use case; a lower layer MUST NOT open one on its own initiative.
- **R2.** A use case MUST use one transaction for the state change and the records that must be atomic with it (`02-domain/lifecycles.md` R7).
- **R3.** A transaction MUST NOT span two consistency boundaries; effects on another boundary go through an event or a published interface (`03-architecture/system.md` R15).
- **R4.** A transaction MUST be bounded by `transaction_max_duration`.

### Contents

- **R5.** A transaction MUST NOT contain a network call to another component or an external system.
- **R6.** A transaction MUST NOT wait on a person, a timer or a queue.
- **R7.** A message or event that must be sent because of a state change MUST be recorded in the same transaction and sent after commit (`08-reliability/concurrency-and-idempotency.md`).

### Isolation and failure

- **R8.** A transaction MUST run at `transaction_isolation`; a stricter level MUST be requested per operation and justified by the invariant it protects, in a comment at the call site.
- **R9.** A transaction that fails on a serialisation or deadlock error MAY be retried as a whole, only if the operation is safe to repeat, and within the limits of `08-reliability/timeouts-retries.md`.
- **R10.** A partial commit MUST NOT be observable: on any error the transaction MUST be rolled back in full.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1, R2 | Architecture test: transactions are opened only in the application layer; review | ⬜ scheduled |
| R3 | Architecture test: no cross-boundary call inside a transaction scope | ⬜ scheduled |
| R4 | Store or data-access timeout setting; alert on long transactions | ⬜ scheduled |
| R5, R6 | Architecture test: no network client reachable from a transaction scope; review | ⬜ scheduled |
| R7 | Integration test that a rolled-back change sends nothing | ⬜ scheduled |
| R8 | Review of any isolation override | ❌ review-only |
| R9 | Retry helper that wraps the whole transaction; review | ⬜ scheduled |
| R10 | Integration test that injects a failure mid-transaction | ⬜ scheduled |

## AI guardrails

```text
A transaction wraps one use case, opened in the application layer. One transaction never spans two boundaries.
NEVER make a network call inside a transaction. NEVER wait on a person or a timer inside one.
Send messages after commit, from a record written in the same transaction.
Run at transaction_isolation; raising it needs a stated invariant at the call site.
Retry a failed transaction as a whole or not at all. A partial commit is a bug.
```

## References

- `02-domain/lifecycles.md` — the record written atomically with a state change
- `03-architecture/system.md` — cross-boundary communication
- `08-reliability/concurrency-and-idempotency.md` — safe repetition and delivery
- `08-reliability/timeouts-retries.md` — retry limits
