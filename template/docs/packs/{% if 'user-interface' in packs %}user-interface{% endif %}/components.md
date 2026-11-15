---
layer: packs/user-interface
status: not-started # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Components

## Purpose

How the component inventory is organised and reused, and what a component may and may not do.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `one_component_per_role` | [[one_component_per_role]] | yes: a control is chosen by role and variant, never restyled per screen | per-screen styling is how inventories fork |
| `reuse_before_authoring` | [[reuse_before_authoring]] | search the inventory before writing new markup; a new component needs a second real use | — |
| `semantic_elements` | [[semantic_elements]] | interactive elements are real buttons, links and form controls, never generic elements made clickable | generic clickable elements fail keyboard and screen-reader users |
| `inventory_location` | [[inventory_location]] | one shared library, location chosen in 13-technology/ | — |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

<!-- baseline: proposed default rules land here in a later baseline release. -->

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |

## AI guardrails

## References
