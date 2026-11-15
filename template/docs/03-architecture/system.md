---
layer: 03-architecture
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# System Architecture

## Purpose

The shape of the system: deployables, internal boundaries, and how parts communicate. Which boundaries and deployables exist is a bootstrap answer; the technology behind them is decided in `13-technology/`.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `system_shape` | [[system_shape]] | modular monolith | split a service out only on a measured need, recorded as an ADR |
| `boundaries` | [[boundaries]] | listed by the bootstrap | each owns its data exclusively |
| `deployables` | [[deployables]] | listed by the bootstrap | each deployable is a release, a runtime and an on-call surface |
| `cross_boundary_communication` | [[cross_boundary_communication]] | events for notification; published interfaces for queries | synchronous coupling vs. eventual consistency |
| `infrastructure_baseline` | [[infrastructure_baseline]] | decided in `13-technology/` | each added component is an operational cost and needs an ADR |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] What is the deploy target, or is it deliberately undecided? Nothing may assume one until recorded.
- [ ] Which boundaries, if any, share an ownership or isolation key, and which must not be merged?

## Rules

### Shape

- **R1.** The system MUST follow `system_shape`; the default is one deployable per `deployables` entry with internal boundaries enforced at build time rather than by the network.
- **R2.** A service MUST NOT be split out speculatively.
- **R3.** A split MUST be justified by a measured need (an independent scaling profile, an independent failure domain, or a team boundary that cannot share a release) and recorded in an ADR.
- **R4.** The deployables MUST be exactly those listed in `deployables`; adding one MUST be a visible change that updates the parameter.

### Boundaries

- **R5.** Every boundary MUST be listed in `boundaries` with what it owns.
- **R6.** A boundary MUST own its data exclusively; another boundary MUST NOT read or write it directly, in code or in queries.
- **R7.** Two concepts that sit on different ownership or isolation keys MUST NOT be merged into one boundary.
- **R8.** A new boundary MUST be recorded in an ADR, because it adds a module, a tag and a line to police.

### Communication

- **R9.** Within a boundary, parts MAY call each other directly, following the layering in `03-architecture/dependency-rules.md`.
- **R10.** Across boundaries, communication MUST follow `cross_boundary_communication`: an event, or a published interface on the owning boundary. Nothing else.
- **R11.** A synchronous cross-boundary call MUST go through a published interface and only where the caller cannot proceed without the answer.
- **R12.** A cross-boundary call MUST NOT participate in the caller's transaction.
- **R13.** A call to an external system MUST go through an adapter behind an interface owned by the calling boundary (`10-patterns/patterns.md`).

### Infrastructure

- **R14.** The system MUST use only the components in `infrastructure_baseline`.
- **R15.** Adding an infrastructure component MUST be recorded in an ADR stating the operational cost, failure mode and recovery story.
- **R16.** Nothing in the architecture MAY assume a deploy target that is not recorded as decided.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1, R4 | Workspace contents match the parameters; adding a deployable is a reviewed change | ❌ review-only |
| R2, R3, R8, R15 | ADR required; review | ❌ review-only |
| R5 | Module-boundary check rejects an unlisted boundary (tool chosen in `13-technology/`) | ⬜ scheduled |
| R6 | Module-boundary check; architecture test that no data-access code is imported across boundaries | ⬜ scheduled |
| R7 | Review | ❌ review-only |
| R9–R11 | Module-boundary check; a published interface is an explicit export | ⬜ scheduled |
| R12 | Architecture test: no cross-boundary call inside a transaction scope | ⬜ scheduled |
| R13 | Module-boundary check: only adapters may import an external client | ⬜ scheduled |
| R14 | Dependency manifest review; no undeclared infrastructure | ⬜ scheduled |
| R16 | Review | ❌ review-only |

## AI guardrails

```text
Follow system_shape. NEVER split a service speculatively; a split needs a measured reason and an ADR.
A boundary owns its data exclusively. NEVER read another boundary's data, in code or queries.
Across boundaries: an event or a published interface. Nothing else.
A cross-boundary call NEVER joins the caller's transaction.
External systems go through an adapter behind an interface the caller owns.
Never add an infrastructure component or a new boundary without an ADR.
Never assume a deploy target that is not recorded as decided.
```

## References

- `03-architecture/dependency-rules.md` — the direction rules
- `10-patterns/patterns.md` — ports and adapters
- `13-technology/README.md` — where the stack is decided
- `04-adr/` — splitting and infrastructure decisions
- [Modular monolith (Fowler, "MonolithFirst")](https://martinfowler.com/bliki/MonolithFirst.html)
