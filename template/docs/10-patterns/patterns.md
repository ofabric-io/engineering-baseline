---
layer: 10-patterns
status: proposed
owner: TBD
last-reviewed: never
---

# Approved Patterns & Anti-Patterns

## Purpose

Which design patterns are approved and the trigger that justifies each; which are banned; and the
anti-abstraction rules that stop speculative design. Language-specific anti-patterns are not
listed here — they live in the project's `13-technology/` documents, and patterns that belong to a
particular way of modelling the domain are added by the packs that adopt it.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `duplication_threshold` | [[duplication_threshold]] | 3 — duplication is tolerated until the third occurrence | a lower number extracts sooner and couples code that only looks alike; a higher one leaves more to maintain |
| `cqs_strictness` | [[cqs_strictness]] | strict, except for atomic operations that must both change state and return a result (take, compare-and-swap, create returning an identifier) | strict is simple to review; the exceptions avoid races that two separate calls would create |
| `port_boundaries` | [[port_boundaries]] | storage, clock, outbound client, queue; listed in `03-architecture/dependency-rules.md` | a longer list permits more single-implementation interfaces; a shorter one forces concrete types |
| `cqrs_scope` | [[cqrs_scope]] | naming discipline only; a separate read model needs a measured need and an ADR | separate models scale reads and add synchronisation and cost |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Which approved patterns in R1 does the project never need? Strike them.

## Rules

### Approved patterns

- **R1.** A pattern MUST be used only when its trigger holds today. A pattern not in this table
  MUST have an ADR before first use.

  | Pattern | Use it when |
  | --- | --- |
  | Adapter | Integrating an external system behind a port |
  | Strategy | Behaviour genuinely varies today, with more than one live implementation |
  | Command / Query | Naming discipline: a method either changes state or returns data |
  | Domain event | Notifying another part of the system that something happened |
  | Outbox | An event or message that must not be lost |
  | Result | An expected failure that the caller must handle (see `09-errors/taxonomy.md`) |
  | State machine | A thing has more than two states and rules about which moves between them are legal |
  | Reconciler (control loop) | A desired state is declared and an actual state is observed; a loop repeatedly acts to close the difference |
  | Snapshot swap | Readers need a consistent view of data or configuration that is replaced as a whole; build the new immutable version, then switch readers to it atomically |

- **R2.** A method MUST either change state or return data, never both, to the degree set by `cqs_strictness`.

### Anti-abstraction rules

- **R3.** An abstraction MUST NOT be introduced for hypothetical future reuse; the trigger is a
  second real caller that exists now.
- **R4.** An interface with a single implementation MUST NOT exist, unless it is a port crossing
  a boundary in `port_boundaries`.
- **R5.** Duplication MUST be tolerated until the occurrence count in `duplication_threshold`.
- **R6.** Behaviour MUST live with the module or type that owns the data it governs, not in a service beside it.
- **R7.** CQRS MUST be used within `cqrs_scope`. A separate read model, store or write path MUST NOT be introduced beyond it without a measured need and an ADR.

### Named anti-patterns

- **R8.** The following MUST NOT be used:
  - **Service locator** — a container resolved at call time; dependencies are explicit inputs.
  - **God service** — a unit that grew to own several unrelated responsibilities.
  - **Deep inheritance** — more than one level of extension outside a framework-mandated base
    type; use composition.
  - **Speculative generality** — a type parameter, hook or configuration flag with one caller.
- **R9.** A pattern's name MUST NOT be used for a unit that is not that pattern. A type named
  after Strategy with one implementation is misnamed or violates R4.
- **R10.** Anti-patterns specific to a language or framework MUST be recorded in the matching
  `13-technology/` document, with the same MUST NOT force as R8.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | PR review; an unlisted pattern shows up as an unfamiliar name suffix | ❌ review-only |
| R2 | PR review | ❌ review-only |
| R3, R5 | PR review — judgement calls no tool can make | ❌ review-only |
| R4 | Architecture test: an interface with one implementation must be tagged as a port in `port_boundaries` (tool chosen in `13-technology/`) | ⬜ scheduled |
| R6 | PR review; a type with only accessors is a searchable smell | ❌ review-only |
| R7 | PR review; an ADR is required to change it | ❌ review-only |
| R8 | Dependency-cycle and size-limit linting where the stack supports it; the rest is review | ⬜ scheduled |
| R9 | Naming lint tying reserved suffixes to roles (`11-style/naming-and-style.md` R11) | ⬜ scheduled |
| R10 | Present in the technology document, checked at ratification | ❌ review-only |

## AI guardrails

- Use a pattern only when its trigger is true today; anything unlisted needs an ADR.
- No abstraction for hypothetical reuse. No interface with one implementation unless it is a port.
- Tolerate duplication until the third occurrence.
- Put behaviour with the type that owns the data.
- A method changes state or returns data, never both, as `cqs_strictness` allows.
- CQRS stays within `cqrs_scope`. No separate read model without an ADR.
- Do not name a type after a pattern it is not.

## References

- `09-errors/taxonomy.md` — the Result pattern's trigger
- `03-architecture/dependency-rules.md` — what a port crosses
- `11-style/naming-and-style.md` — reserved suffixes
- `13-technology/README.md` — where language-specific anti-patterns live
