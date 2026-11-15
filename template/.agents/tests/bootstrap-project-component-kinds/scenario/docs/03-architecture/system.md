---
layer: 03-architecture
status: proposed # not-started | proposed | in-progress | ratified | not-applicable
owner: TBD
last-reviewed: never
---

# System Shape

## Purpose

The shape of the system: its components and what kind each is.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `component_kinds` | [[component_kinds]] | the kinds the project has, from service, daemon, cli, library, ui, batch | a wrong list scopes the wrong rules in or out |

### Components

| Component | Kind | Purpose |
| --- | --- | --- |
| [[component]] | [[kind]] | |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

- **R1.** Every component MUST appear in the Components table with exactly one kind.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | review | ❌ |

## AI guardrails

- Never add a component without a row in the Components table.

## References

- `docs/README.md`
