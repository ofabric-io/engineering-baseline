---
pack: domain-model
version: 0.1.0
requires: []
amends:
  - 02-domain/lifecycles.md  # adds aggregates as the consistency boundary around each lifecycle
  - 03-architecture/dependency-rules.md  # adds the domain-layer import ban to R4
documents:
  - aggregates.md  # Aggregates and Consistency Boundaries
  - domain-patterns.md  # Domain Patterns (written alongside this pack's other documents)
---

# Pack: domain-model

Optional standards for projects that model a rich domain with aggregates, consistency boundaries and
the patterns around them (repositories, units of work, factories, value objects). A CLI, a thin
service or a pipeline usually does not need it. Documents in this folder depend on the core layers;
no core document links here.

## Bootstrap

The bootstrap asks this pack's parameters in its own section of `bootstrap/questionnaire.md`.
