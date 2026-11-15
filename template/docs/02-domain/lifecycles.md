---
layer: 02-domain
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Lifecycles, Invariants & State Machines

## Purpose

How the project models states, legal transitions and invariants of anything with a lifecycle: an order, a job, a deployment, a subscription, a connection. This document gives the method and empty tables; the project fills in its own states and transitions. Consistency boundaries (aggregates) are a separate concern, handled by the domain-model pack when installed.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `lifecycle_record` | [[lifecycle_record]] | an event and an audit entry per transition | an event alone is cheaper but is not an audit trail; an audit entry alone does not notify other parts |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Which entities have a lifecycle worth a state machine, and which are plain records?

## Rules

### States and transitions

- **R1.** Every entity with a lifecycle MUST have a state table listing its states exactly, with a one-line meaning and a terminal flag.
- **R2.** Every such entity MUST have a transition table listing the legal transitions exactly; any transition not listed is illegal.
- **R3.** A terminal state MUST NOT transition. A late message about a terminal entity is acknowledged and recorded, never applied.
- **R4.** Every branch on a state MUST handle all states exhaustively, so that adding a state without handling it fails the build or the tests.
- **R5.** A state MUST change only through a named operation on the entity that owns it, never by assigning the state field.
- **R6.** An illegal transition MUST raise a typed error naming both the current and the requested state.
- **R7.** Every transition MUST produce the observable record in `lifecycle_record`, written atomically with the state change.
- **R8.** A field that determines which transitions are legal MUST NOT change after the entity is created unless the transition table says so.
- **R9.** A state field MUST be qualified by its entity (for example `orderStatus`), never a bare `status` in a shared type or event payload.

### Invariants

- **R10.** An invariant MUST be stated in this document, enforced in the code that owns the entity, and, where the store supports it, also as a store constraint.

### Documenting lifecycles

- **R11.** A new state or transition MUST be added to the tables below in the same change that introduces it.

### States (one table per entity with a lifecycle)

| State | Meaning | Terminal |
| --- | --- | --- |
| [[state]] | | |

### Transitions (one table per entity with a lifecycle)

| From | To | Operation | Error when illegal | Record produced |
| --- | --- | --- | --- | --- |
| [[from]] | | | | |

### Invariants

| Entity | Invariant | Enforced by |
| --- | --- | --- |
| [[entity]] | | |

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1, R2 | Transition table in code, tested per legal and illegal transition | ⬜ scheduled |
| R3 | Test replaying a late message against a terminal state | ⬜ scheduled |
| R4 | Compiler or lint exhaustiveness check where the stack supports it | ⬜ scheduled |
| R5 | Architecture test: no assignment to a state field outside its owner | ⬜ scheduled |
| R6 | Error catalogue entry per transition (`09-errors/taxonomy.md`) | ⬜ scheduled |
| R7 | Integration test: each transition leaves exactly one record | ⬜ scheduled |
| R8 | The entity exposes no setter for the field | ⬜ scheduled |
| R9 | Identifier-naming lint (tool chosen in `13-technology/`) | ⬜ scheduled |
| R10 | Guards in code plus store constraints; unit tests of each invariant | ⬜ scheduled |
| R11 | PR review against the tables | ❌ review-only |

## AI guardrails

```text
Never assign a state field. Call the named operation on the owning entity.
A transition not in the table is illegal and raises a typed error naming BOTH states.
A terminal state NEVER transitions; late messages are recorded, not applied.
Handle every state exhaustively in every switch.
Every transition writes its record atomically with the state change.
Add new states and transitions to the tables in the same change.
```

## References

- `03-architecture/system.md` — boundaries and cross-boundary communication
- `09-errors/taxonomy.md` — typed errors
- `10-patterns/patterns.md` — port patterns
- [State pattern (Refactoring Guru)](https://refactoring.guru/design-patterns/state)
