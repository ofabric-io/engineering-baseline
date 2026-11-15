---
layer: 02-domain
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Aggregates, Invariants & State Machines

## Purpose

How the project models consistency boundaries, states, legal transitions and invariants. This document gives the method and empty tables; the project fills in its own aggregates, states and transitions.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `aggregates` | [[aggregates]] | listed by the bootstrap from the scope | each is a consistency boundary; too large serialises writes, too small pushes invariants across transactions |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Which entities have a lifecycle worth a state machine, and which are plain records?

## Rules

### Aggregates

- **R1.** Every entity that must keep an invariant MUST belong to exactly one aggregate, listed in the aggregates table below with the boundary that owns it.
- **R2.** A single transaction MUST NOT span two aggregates; consistency across aggregates is eventual, through an event or published interface (`03-architecture/system.md`).
- **R3.** An aggregate MUST be loaded, mutated and saved as a whole; code outside an aggregate MUST NOT reach into its internals.
- **R4.** Invariants MUST be stated in this document, enforced in the aggregate, and, where the store supports it, also as store constraints.

### States and transitions

- **R5.** Every stateful aggregate MUST have a state table listing its states exactly, with a one-line meaning and a terminal flag.
- **R6.** Every stateful aggregate MUST have a transition table listing the legal transitions exactly; any transition not listed is illegal.
- **R7.** A terminal state MUST NOT transition. A late message about a terminal entity is acknowledged and recorded, never applied.
- **R8.** Every branch on a state MUST handle all states exhaustively, so that adding a state without handling it fails the build or the tests.
- **R9.** A state MUST change only through a named method on the owning aggregate, never by assigning the state field.
- **R10.** An illegal transition MUST raise a typed error naming both the current and the requested state.
- **R11.** Every transition MUST produce an observable record (an event, an audit entry, or both as the project decides), written in the same transaction as the state change.
- **R12.** A field that determines which transitions are legal MUST NOT change after the entity is created unless the transition table says so.
- **R13.** A state field MUST be qualified by its aggregate (for example `orderStatus`), never a bare `status` in a shared type or event payload.

### Documenting aggregates

- **R14.** A new aggregate, state or transition MUST be added to the tables below in the same change that introduces it.

### Aggregates

| Aggregate | Context | Owns | Invariants |
| --- | --- | --- | --- |
| [[aggregate]] | | | |

### States (one table per stateful aggregate)

| State | Meaning | Terminal |
| --- | --- | --- |
| [[state]] | | |

### Transitions (one table per stateful aggregate)

| From | To | Method | Error when illegal | Record produced |
| --- | --- | --- | --- | --- |
| [[from]] | | | | |

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1, R2 | Architecture test that no transaction spans two aggregates (tool chosen in `13-technology/`) | ⬜ scheduled |
| R3 | Module-boundary check on aggregate internals | ⬜ scheduled |
| R4 | Aggregate guards plus store constraints; unit tests of each invariant | ⬜ scheduled |
| R5, R6 | Transition table in code, tested per legal and illegal transition | ⬜ scheduled |
| R7 | Test replaying a late message against a terminal state | ⬜ scheduled |
| R8 | Compiler or lint exhaustiveness check where the stack supports it | ⬜ scheduled |
| R9 | Architecture test: no assignment to a state field outside the aggregate | ⬜ scheduled |
| R10 | Error catalogue entry per transition (`09-errors/taxonomy.md`) | ⬜ scheduled |
| R11 | Integration test: each transition leaves exactly one record | ⬜ scheduled |
| R12 | Aggregate exposes no setter for the field | ⬜ scheduled |
| R13 | Identifier-naming lint (tool chosen in `13-technology/`) | ⬜ scheduled |
| R14 | PR review against the tables | ❌ review-only |

## AI guardrails

```text
Never assign a state field. Call the named method on the aggregate.
A transition not in the table is illegal and raises a typed error naming BOTH states.
A terminal state NEVER transitions; late messages are recorded, not applied.
Handle every state exhaustively in every switch.
One transaction, one aggregate. Cross-aggregate effects go through an event or published interface.
Every transition writes its record in the same transaction.
Add new states and transitions to the tables in the same change.
```

## References

- `03-architecture/system.md` — boundaries and cross-boundary communication
- `09-errors/taxonomy.md` — typed errors
- `10-patterns/patterns.md` — aggregate and port patterns
- [Aggregate (Domain-Driven Design)](https://martinfowler.com/bliki/DDD_Aggregate.html)
