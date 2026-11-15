---
layer: packs/user-interface
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Components

## Purpose

How the component inventory is organised and reused, and what a component may and may not do. Stated for any platform (web, mobile, desktop); a platform pack adds its element-level mechanics.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `one_component_per_role` | [[one_component_per_role]] | yes: a control is chosen by role and variant, never restyled per screen | per-screen styling is how inventories fork |
| `reuse_before_authoring` | [[reuse_before_authoring]] | search the inventory before writing a new component; a new component needs a second real use | — |
| `semantic_elements` | [[semantic_elements]] | interactive elements use the platform's native control for their role, never a generic element made interactive | custom controls fail keyboard and screen-reader users unless rebuilt by hand |
| `inventory_location` | [[inventory_location]] | one shared library, location chosen in `13-technology/` | — |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Is the inventory built, adopted from a published library, or both? Record the choice in `13-technology/`.
- [ ] How is a component's documentation produced and where is it published?

## Rules

- **R1.** Every component MUST live in the inventory at `inventory_location`. A screen MUST NOT define a reusable component locally.
- **R2.** A control MUST be chosen by role and variant (`one_component_per_role`). A screen MUST NOT restyle a component; a missing variant is added to the component.
- **R3.** Before a new component is written, the inventory MUST be searched, and the new component MUST meet `reuse_before_authoring`. The change description MUST say what was searched.
- **R4.** Interactive elements MUST be the platform's native control for their role (`semantic_elements`).
- **R5.** A component MUST use semantic tokens only (`design-tokens.md` R3) and MUST render correctly in every theme.
- **R6.** A component MUST carry its own accessibility: role, accessible name, keyboard behaviour and focus handling. A consumer MUST NOT be able to remove them.
- **R7.** A component MUST be documented with each of its states (default, hover, focus, disabled, and error or loading where they apply) and its variants.
- **R8.** A component MUST take its text through properties from the catalog; it MUST NOT embed copy (`content-and-i18n.md` R1).
- **R9.** A shared component MUST NOT fetch data or know about domain entities; data and domain mapping belong to the screen that uses it.
- **R10.** A component replaced by another MUST be removed once its last use is migrated; the replacement and migration MUST be recorded.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | module-boundary or import rule restricting where components are defined (tool chosen in `13-technology/`) | ⬜ scheduled |
| R2 | lint rule rejecting style overrides on inventory components; PR review | ⬜ scheduled |
| R3 | PR template checklist | ❌ review-only |
| R4 | lint rule for non-native interactive controls | ⬜ scheduled |
| R5 | token-literal lint (`design-tokens.md` R3); visual check per theme | ⬜ scheduled |
| R6 | component tests plus automated accessibility scan | ⬜ scheduled |
| R7 | documentation build failing on a component without its states | ⬜ scheduled |
| R8 | hard-coded-copy lint (`content-and-i18n.md` R1) | ⬜ scheduled |
| R9 | module-boundary rule forbidding data access from the inventory | ⬜ scheduled |
| R10 | PR review | ❌ review-only |

## AI guardrails

- Search the inventory before writing any new component; reuse a component by role and variant.
- Never restyle a component for one screen; add a variant to it.
- Never make a generic element interactive; use the native control for the role.
- Never fetch data or name a domain entity inside a shared component.

## References

- `design-tokens.md`, `accessibility.md`, `content-and-i18n.md`
- `13-technology/README.md`
