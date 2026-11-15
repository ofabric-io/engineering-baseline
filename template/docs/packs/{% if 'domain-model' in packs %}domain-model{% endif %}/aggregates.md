---
layer: packs/domain-model
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Aggregates and Consistency Boundaries

## Purpose

How the project groups entities into aggregates, the units that are loaded, changed and saved as a whole and that keep their invariants. The states and transitions of an aggregate are documented under `02-domain/lifecycles.md`; this document owns the boundary around them.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `aggregates` | [[aggregates]] | listed by the bootstrap from the scope | each is a consistency boundary; too large serialises writes, too small pushes invariants across transactions |
| `domain_layer_import_policy` | [[domain_layer_import_policy]] | the domain layer imports only the language's standard library and other domain code; time and zone rules arrive through a port | a stricter ban keeps the domain testable without infrastructure; allowing a utility library trades that for convenience |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

### Aggregates

- **R1.** Every entity that must keep an invariant MUST belong to exactly one aggregate, listed in the table below with the boundary that owns it.
- **R2.** A single transaction MUST NOT span two aggregates; consistency across aggregates is eventual, through an event or published interface (`03-architecture/system.md` R13).
- **R3.** An aggregate MUST be loaded, mutated and saved as a whole; code outside an aggregate MUST NOT reach into its internals.
- **R4.** An aggregate MUST reference another aggregate by identifier, never by holding the other object.
- **R5.** An invariant of an aggregate MUST be enforced inside the aggregate and, where the store supports it, also as a store constraint (`02-domain/lifecycles.md` R10).
- **R6.** A new aggregate MUST be added to the table below in the same change that introduces it.

### Domain layer

- **R7.** The domain layer MUST follow `domain_layer_import_policy`: it MUST NOT import a framework, a persistence library, a network client, a logger or a telemetry library.
- **R8.** The domain layer MUST obtain the current time and zone rules through a port (`02-domain/time.md` R5), never by reading the system clock or a date library's global state.

### Aggregates

| Aggregate | Context | Owns | Invariants |
| --- | --- | --- | --- |
| [[aggregate]] | | | |

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1, R2 | Architecture test that no transaction spans two aggregates (tool chosen in `13-technology/`) | ⬜ scheduled |
| R3 | Module-boundary check on aggregate internals | ⬜ scheduled |
| R4 | Review; aggregate fields hold identifiers, not aggregate types | ❌ review-only |
| R5 | Aggregate guards plus store constraints; unit tests of each invariant | ⬜ scheduled |
| R6 | PR review against the table | ❌ review-only |
| R7 | The domain module declares no such dependency; undeclared imports fail to resolve | ⬜ scheduled |
| R8 | Lint rule banning direct clock reads in the domain layer | ⬜ scheduled |

## AI guardrails

```text
One transaction, one aggregate. Cross-aggregate effects go through an event or published interface.
Load, change and save an aggregate whole. Never reach into its internals from outside.
Reference another aggregate by identifier, never by object.
The domain layer imports no framework, persistence, network, logger or telemetry code.
Time comes through the clock port, never the system clock.
Add a new aggregate to the table in the same change.
```

## References

- `02-domain/lifecycles.md` — states, transitions and invariants
- `03-architecture/system.md` — boundaries and cross-boundary communication
- `03-architecture/dependency-rules.md` — the generic inner-code rule this pack makes concrete
- `packs/data-store/transactions.md` — transaction boundaries
- [Aggregate (Domain-Driven Design)](https://martinfowler.com/bliki/DDD_Aggregate.html)
