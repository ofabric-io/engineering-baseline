---
layer: 03-architecture
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Dependency Rules

## Purpose

Which parts of the code may depend on which, and how violations are prevented. This is the rule agents and humans break most often, because every individual violation looks locally reasonable.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `layering_model` | [[layering_model]] | dependencies point inward: adapters → application → domain | the domain must not know about frameworks or I/O |
| `boundary_enforcement` | [[boundary_enforcement]] | automated module-boundary check, chosen in `13-technology/` | review-only boundaries erode |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] What are the layer names and the allowed arrows between them in this project?
- [ ] Which categories of shared code exist (shared utilities, published contracts), and which boundaries may use each?

## Rules

### The single principle

- **R1.** Dependencies MUST point inward as defined by `layering_model`: infrastructure depends on the domain, and the domain depends on nothing outside itself.
- **R2.** A dependency error MUST be treated as a sign the code is in the wrong place, not as an obstacle to route around.

### Layer direction

- **R3.** Inside a boundary, a layer MAY depend only on the layers `layering_model` permits; an adapter depends inward by implementing an interface the domain defines.
- **R4.** The domain layer MUST NOT import a framework, a persistence library, a network client, a logger, a telemetry library or a date library; its dependencies are the language's standard library and other domain code.
- **R5.** A layer MUST NOT be skipped; an entry point calling a data-access layer directly is a violation even for a read.

### Boundary direction

- **R6.** A boundary MUST NOT import another boundary's internals: no entity, no repository, no use case, no data structure.
- **R7.** Cross-boundary communication MUST follow `03-architecture/system.md` R10.
- **R8.** A published interface MUST belong to the owning boundary's domain, and its consumers MUST depend on that interface, never on the implementation.
- **R9.** There MUST NOT be a cycle between boundaries or between modules.

### Shared code and applications

- **R10.** Shared code MUST NOT depend on a specific boundary; code that needs one belongs to that boundary.
- **R11.** Nothing MAY depend on a deployable; a deployable is a composition root.
- **R12.** Client-side and server-side code MUST NOT depend on each other; the only bridge is a contracts module holding schemas and types and no behaviour.
- **R13.** One user-facing surface MUST NOT depend on another; shared behaviour moves down, never sideways.

### Resolving a violation

- **R14.** A boundary violation MUST NOT be resolved by loosening the rule: adding a tag or permission, moving the file to a more permissive location, widening an interface, adding an exception entry, or re-exporting through an aggregating module.
- **R15.** The legitimate resolutions are: move the code to the layer or boundary that should own it; invert the dependency with an interface; extract the shared concept into shared or contracts code; or change the architecture deliberately with an ADR.
- **R16.** The boundary check MUST run with no per-import exception list; an exception negotiated in configuration is invisible where it matters.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1, R3, R5 | Module-boundary check by layer (tool chosen in `13-technology/`) plus an architecture test asserting direction | ⬜ scheduled |
| R2, R14, R15 | Review; the boundary error message names the rule | ❌ review-only |
| R4 | The domain module declares no such dependency; undeclared imports fail to resolve | ⬜ scheduled |
| R6–R8 | Module-boundary check by boundary | ⬜ scheduled |
| R9 | Cycle detection in the module-boundary check | ⬜ scheduled |
| R10–R13 | Module-boundary check by category | ⬜ scheduled |
| R16 | Check configuration has an empty exception list; review of any change to it | ◐ partial |

## AI guardrails

```text
DEPENDENCIES POINT INWARD. The domain depends on NOTHING - no framework, persistence, network, logger,
telemetry or date library.
NEVER skip a layer, even for a read.
NEVER import another boundary's entity, repository, use case or data. Cross-boundary is an event or a published interface.
No cycles. Shared code never imports a boundary. Nothing imports a deployable.
Hit a boundary error? Do NOT add a tag or exception, move the file, widen an interface, or re-export through an aggregator.
Legitimate fixes: move the code, invert with an interface, extract to shared or contracts, or change the architecture with an ADR.
```

## References

- `03-architecture/system.md` — the boundaries these rules separate
- `10-patterns/patterns.md` — ports and adapters
- `13-technology/README.md` — where the boundary check is chosen
- `16-ai/prohibitions.md` — loosening a rule to pass a check
- [Hexagonal architecture (Cockburn)](https://alistair.cockburn.us/hexagonal-architecture/)
