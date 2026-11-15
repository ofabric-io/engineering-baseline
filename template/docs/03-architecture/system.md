---
layer: 03-architecture
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# System Architecture

## Purpose

The shape of the system: components, deployables, internal boundaries, and how parts communicate. Which components, boundaries and deployables exist is a bootstrap answer; the technology behind them is decided in `13-technology/`. This document also owns the component kinds that other documents use to scope their rules.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `component_kinds` | [[component_kinds]] | the kinds present in the Components table below, from the fixed vocabulary | a rule scoped to a kind applies only where that kind exists |
| `system_shape` | [[system_shape]] | modular monolith: one deployable per `deployables` entry, internal boundaries enforced at build time. Alternatives: several deployables, or a control plane with a separate data plane | a single deployable is simplest to operate; a split buys independent scaling and failure domains at an operational cost, so it follows a measured need |
| `boundaries` | [[boundaries]] | listed by the bootstrap | each owns its data exclusively |
| `deployables` | [[deployables]] | listed by the bootstrap | each deployable is a release, a runtime and an on-call surface |
| `cross_boundary_communication` | [[cross_boundary_communication]] | events for notification; published interfaces for queries | synchronous coupling vs. eventual consistency |
| `infrastructure_baseline` | [[infrastructure_baseline]] | decided in `13-technology/` | each added component is an operational cost and needs an ADR |

## Components

The fixed vocabulary of component kinds is:

- `service` — a request/response network service.
- `daemon` — a long-running process without request/response: a worker, agent, supervisor or consumer.
- `cli` — a command-line program.
- `library` — code consumed by other code.
- `ui` — an interface a person uses: web, mobile or desktop.
- `batch` — a job or pipeline that runs and ends.

Other documents scope a rule to some kinds by ending its first line with ` _(applies to: service, daemon)_`; a rule with no such tag applies to every kind. A document may declare `applies-to` in its frontmatter; a project with no component of those kinds may mark it `status: not-applicable` with a `reason`.

| Component | Kind | Purpose |
| --- | --- | --- |
| [[component]] | [[kind]] | |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] What is the deploy target, or is it deliberately undecided? Nothing may assume one until recorded.
- [ ] Which boundaries, if any, share an ownership or isolation key, and which must not be merged?

## Rules

### Components

- **R1.** Every component MUST be listed in the Components table with exactly one kind from the fixed vocabulary and a one-line purpose.
- **R2.** Adding a component or changing its kind MUST update the table in the same change.

### Shape

- **R3.** The system MUST follow `system_shape`; no document or rule MAY assume a modular monolith unless `system_shape` says so.
- **R4.** Where `system_shape` has several deployables or a control plane and a data plane, this document MUST name which component runs in which deployable and which side owns which data.
- **R5.** A deployable MUST NOT be split out speculatively; a split MUST be justified by a measured need (an independent scaling profile, an independent failure domain, or a team boundary that cannot share a release) and recorded in an ADR.
- **R6.** The deployables MUST be exactly those listed in `deployables`; adding one MUST be a visible change that updates the parameter.
- **R7.** Operating the platform itself and operations performed on behalf of its customers MUST be named as separate concerns wherever both exist, with separate ownership and access.

### Boundaries

- **R8.** Every boundary MUST be listed in `boundaries` with what it owns.
- **R9.** A boundary MUST own its data exclusively; another boundary MUST NOT read or write it directly, in code or in queries.
- **R10.** Two concepts that sit on different ownership or isolation keys MUST NOT be merged into one boundary.
- **R11.** A new boundary MUST be recorded in an ADR, because it adds a module and a line to police.

### Communication

- **R12.** Within a boundary, parts MAY call each other directly, following the layering in `03-architecture/dependency-rules.md`.
- **R13.** Across boundaries, communication MUST follow `cross_boundary_communication`: an event, or a published interface on the owning boundary. Nothing else.
- **R14.** A synchronous cross-boundary call MUST go through a published interface and only where the caller cannot proceed without the answer.
- **R15.** A cross-boundary call MUST NOT participate in the caller's transaction.
- **R16.** A call to an external system MUST go through an adapter behind an interface owned by the calling boundary (`10-patterns/patterns.md`).

### Infrastructure

- **R17.** The system MUST use only the components in `infrastructure_baseline`.
- **R18.** Adding an infrastructure component MUST be recorded in an ADR stating the operational cost, failure mode and recovery story.
- **R19.** Nothing in the architecture MAY assume a deploy target that is not recorded as decided.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1, R2 | Review of the Components table against the workspace | ❌ review-only |
| R3, R4, R6 | Workspace contents match the parameters; adding a deployable is a reviewed change | ❌ review-only |
| R5, R11, R18 | ADR required; review | ❌ review-only |
| R7 | Review | ❌ review-only |
| R8 | Module-boundary check rejects an unlisted boundary (tool chosen in `13-technology/`) | ⬜ scheduled |
| R9 | Module-boundary check; architecture test that no data-access code is imported across boundaries | ⬜ scheduled |
| R10 | Review | ❌ review-only |
| R12–R14 | Module-boundary check; a published interface is an explicit export | ⬜ scheduled |
| R15 | Architecture test: no cross-boundary call inside a transaction scope | ⬜ scheduled |
| R16 | Module-boundary check: only adapters may import an external client | ⬜ scheduled |
| R17 | Dependency manifest review; no undeclared infrastructure | ⬜ scheduled |
| R19 | Review | ❌ review-only |

## AI guardrails

```text
Follow system_shape; never assume a modular monolith it does not name.
Every component is in the Components table with one kind.
NEVER split a deployable speculatively; a split needs a measured reason and an ADR.
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
