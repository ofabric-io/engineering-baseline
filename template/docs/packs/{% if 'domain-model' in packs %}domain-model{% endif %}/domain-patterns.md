---
layer: packs/domain-model
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Domain Patterns & Anti-Patterns

## Purpose

The design patterns and anti-patterns that belong to modelling a domain with aggregates: Repository, Unit of Work, Factory, Value object, and the failures that come from getting them wrong. They extend the approved-pattern table of `10-patterns/patterns.md` R1 and obey its trigger rule: a pattern is used only when its trigger holds today. Aggregate boundaries themselves are in this pack's aggregates document.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `repository_scope` | [[repository_scope]] | one repository per aggregate root, persisting and loading the whole aggregate | a repository per table is simpler to write and lets invariants leak out of the aggregate |
| `value_object_scope` | [[value_object_scope]] | a value with an invariant, or a pair of values that only make sense together | wrapping every primitive is safe and noisy |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Which operations genuinely span more than one aggregate in one transaction (R3)? List them by name.

## Rules

### Approved domain patterns

- **R1.** These patterns are approved for `10-patterns/patterns.md` R1, each only when its trigger holds today:

  | Pattern | Use it when |
  | --- | --- |
  | Repository | Persisting or loading an aggregate |
  | Unit of Work | One transaction must span more than one aggregate |
  | Factory | Construction must preserve an invariant the constructor cannot |
  | Value object | A value with invariants that validates itself on construction |

- **R2.** A repository MUST follow `repository_scope`, MUST expose operations in the domain's language rather than generic query construction, and MUST NOT return a partially loaded aggregate.
- **R3.** A Unit of Work MUST be used only for an operation named in the open decision above; the default is one aggregate per transaction.
- **R4.** A factory MUST return a valid aggregate or fail; it MUST NOT return an object that needs a second call to become valid.
- **R5.** A value object MUST be immutable, MUST validate on construction, and MUST be compared by value; a type covered by `value_object_scope` MUST NOT be passed around as its raw primitive.

### Behaviour and boundaries

- **R6.** Behaviour MUST live on the aggregate that owns the data, not in a service beside it.
- **R7.** Code outside an aggregate MUST change its state only through the aggregate's own operations; it MUST NOT reach inside and modify its parts.

### Domain anti-patterns

- **R8.** The following MUST NOT be used (in addition to those in `10-patterns/patterns.md` R8):
  - **Anemic aggregate** — an entity of public setters with its rules in a service (R6 stated as its failure).
  - **God aggregate** — an aggregate that grew to own several consistency boundaries.
  - **Generic repository** — one repository interface parameterised over every type, exposing arbitrary queries.
  - **Leaky repository** — a repository returning persistence-layer records instead of aggregates.
  - **Primitive obsession** — an identifier, amount or code carried as a raw primitive where a value object would validate it.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | PR review (`10-patterns/patterns.md` R1) | ❌ review-only |
| R2 | PR review; architecture test on repository return types | ◐ partial |
| R3 | PR review against the named list | ❌ review-only |
| R4 | Unit tests of each factory | ⬜ scheduled |
| R5 | Unit tests of each value object; lint for raw primitives in signatures where supported | ◐ partial |
| R6 | PR review; a type with only accessors is a searchable smell | ❌ review-only |
| R7 | Architecture test on visibility of aggregate internals, tool chosen in `13-technology/` | ⬜ scheduled |
| R8 | PR review | ❌ review-only |

## AI guardrails

- Behaviour goes on the aggregate that owns the data.
- One aggregate per transaction unless a named operation says otherwise.
- Repositories load and persist whole aggregates; no generic repository.
- Value objects are immutable and validate on construction.
- Never modify an aggregate's internals from outside it.

## References

- `10-patterns/patterns.md` — the trigger rule and the generic patterns
- `09-errors/taxonomy.md` — what a failed construction signals
