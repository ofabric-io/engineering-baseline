---
layer: packs/user-interface
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Design Tokens & Semantic Roles

## Purpose

How visual decisions are named and layered: primitives hold raw values, semantic tokens name a role, components use only semantic tokens. Covers themes, scales and the mapping from domain states to status roles. It does not decide what any component looks like; that is design work done against these tokens (`design-workflow.md`).

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `token_tiers` | [[token_tiers]] | two: primitives → semantic (a third, component tier, only when a component library needs it) | more tiers = more indirection to maintain |
| `token_vocabulary` | [[token_vocabulary]] | adopt an existing published vocabulary unchanged rather than inventing names | own names fit the brand better and match no tool or library |
| `token_format` | [[token_format]] | W3C Design Tokens Community Group format as the source; generated into whatever the stack consumes | a stack-native file is simpler but ties the tokens to one tool |
| `token_source` | [[token_source]] | one directory, one file per theme plus one for primitives; path chosen in `13-technology/` | several sources become several design systems |
| `themes` | [[themes]] | light and dark; every semantic token resolves in every theme | a high-contrast theme adds a third set to verify |
| `brand_roles` | [[brand_roles]] | listed by the bootstrap: brand, primary action, focus; never substituted for one another | one accent for everything blurs what is clickable |
| `status_roles` | [[status_roles]] | success, warning, danger, info, neutral; domain states map to a role, never to a colour | mapping states straight to colours breaks on the first rebrand |
| `status_map_location` | [[status_map_location]] | one table in this document's project copy, keyed by lifecycle state (`02-domain/lifecycles.md`) | a map scattered across components drifts |
| `scales` | [[scales]] | spacing, type, radius, elevation, z-index and motion are each a named scale | an unscaled value is a one-off that nobody can change globally |
| `units` | [[units]] | sizes relative to the user's font size; no fixed pixel type | fixed units ignore user zoom preferences |
| `motion` | [[motion]] | durations and easings from tokens; reduced-motion preference always honoured | — |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Is a third (component) tier needed, and for which library? Answer when the component inventory is chosen (`components.md`).
- [ ] How is a theme selected at runtime: explicit user choice, system preference, or both, and in what order?

## Rules

### Structure

- **R1.** Tokens MUST have exactly one source, in `token_format`, at `token_source`. A second token source MUST NOT exist.
- **R2.** Tokens MUST follow `token_tiers`. A primitive holds a raw value and no meaning; a semantic token names a role and references a primitive or another semantic token.
- **R3.** Components and screens MUST reference semantic tokens only. They MUST NOT reference a primitive or hold a literal colour, size, duration or z-index.
- **R4.** Semantic token names MUST follow `token_vocabulary` and describe a role, never a value (`action-primary`, not `blue-500`).
- **R5.** Files generated from the token source for the stack MUST NOT be edited by hand; the source is changed and regenerated.

### Themes and roles

- **R6.** Every semantic token MUST resolve to a value in every theme in `themes`; a theme MUST NOT omit one.
- **R7.** Switching theme MUST change only which primitive a semantic token resolves to. It MUST NOT require different component code.
- **R8.** Each role in `brand_roles` MUST be its own semantic token. One MUST NOT be used in place of another, even when their values are equal today.
- **R9.** A domain state MUST reach the interface through a status role in `status_roles`, via the map at `status_map_location`. A component MUST NOT choose a colour for a state itself.
- **R10.** Every text-on-background and graphic-on-background pairing used by components MUST be declared as a contrast pair and meet the minimum in `accessibility.md` R2 in every theme.

### Scales

- **R11.** Spacing, type size, radius, elevation, z-index, duration and easing MUST each come from a named scale in `scales`. A literal value MUST NOT appear outside the token source.
- **R12.** Sizes MUST use the relative units in `units`; fixed-pixel type MUST NOT be used.
- **R13.** Stacking order MUST be expressed with the z-index scale only; a component MUST NOT raise itself with an arbitrary number.
- **R14.** When the user's reduced-motion preference is set, non-essential motion MUST be removed or replaced by a non-moving alternative.

### Change

- **R15.** Removing or renaming a semantic token, or changing the role it names, MUST be treated as a breaking change and recorded in the change log; adding a token is not.
- **R16.** A value a design needs and no token provides MUST be added to the token source first; it MUST NOT be hard-coded in the design or the code.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | single-source check in the stack's lint (tool chosen in `13-technology/`) | ⬜ scheduled |
| R2 | token-source schema validation in CI | ⬜ scheduled |
| R3 | lint rule rejecting literals and primitive references in component code | ⬜ scheduled |
| R4 | token-source naming validation | ⬜ scheduled |
| R5 | CI job regenerating outputs and failing on a diff | ⬜ scheduled |
| R6 | `scripts/checks/ui-token-contrast.mjs` fails when a declared contrast token does not resolve in a theme (partial: only declared tokens); becomes automated once `scripts/check.mjs` runs it | ◐ partial |
| R7 | PR review of theme changes | ❌ review-only |
| R8 | PR review; lint where the stack allows | ❌ review-only |
| R9 | PR review of the status map and its consumers | ❌ review-only |
| R10 | `scripts/checks/ui-token-contrast.mjs` computes contrast for declared pairs in every theme (partial: only declared pairs); becomes automated once `scripts/check.mjs` runs it | ◐ partial |
| R11 | lint rule rejecting literal values | ⬜ scheduled |
| R12 | lint rule rejecting fixed-pixel type | ⬜ scheduled |
| R13 | lint rule rejecting literal z-index | ⬜ scheduled |
| R14 | end-to-end test with the preference emulated | ⬜ scheduled |
| R15 | PR review against the change log | ❌ review-only |
| R16 | PR review of designs and code against the token source | ❌ review-only |

## AI guardrails

- Never write a colour, size, duration or z-index literal in a component; find or add a semantic token.
- Never use a primitive in a component.
- Never pick a colour for a domain state; use its status role.
- Never use one brand role where another is meant because the values match.
- Add a new semantic token to every theme in the same change.

## References

- [W3C Design Tokens Community Group format](https://www.designtokens.org/)
- [WCAG 2.2, 1.4.3 Contrast (Minimum)](https://www.w3.org/TR/WCAG22/#contrast-minimum) and [1.4.11 Non-text Contrast](https://www.w3.org/TR/WCAG22/#non-text-contrast)
- `accessibility.md`, `components.md`, `design-workflow.md`
- `../../02-domain/lifecycles.md`
