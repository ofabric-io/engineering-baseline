---
layer: packs/web-ui
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Web Styling & Semantics

## Purpose

How the design tokens (`packs/user-interface/design-tokens.md`) reach stylesheets, and the CSS
rules that keep themes, units and stacking order consistent. Which styling tool or framework is
used is decided in `13-technology/`.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `token_output` | [[token_output]] | generated stylesheet custom properties, one set per theme, consumed through variable references | build-time substitution is smaller and cannot switch theme at runtime |
| `text_unit` | [[text_unit]] | root-relative units for type and spacing | fixed pixels ignore the user's font-size setting |
| `theme_selection` | [[theme_selection]] | the colour-scheme preference signal by default; an explicit user choice overrides it and is stored | forcing one theme ignores the user's system setting |
| `style_scoping` | [[style_scoping]] | component-scoped styles; no global rule targets a component's internals | global styles are simpler and collide as the inventory grows |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] How is the first paint themed so that a stored choice does not flash the wrong theme?

## Rules

- **R1.** The stylesheet values for tokens MUST be generated from the token source in the form `token_output` states and MUST NOT be edited by hand (`packs/user-interface/design-tokens.md` R5).
- **R2.** Component styles MUST reference semantic tokens only; a literal colour, size, duration or stacking value MUST NOT appear in a stylesheet outside the generated output (`packs/user-interface/design-tokens.md` R3, R11).
- **R3.** Type and spacing MUST use `text_unit`; fixed-pixel type MUST NOT be used (`packs/user-interface/design-tokens.md` R12).
- **R4.** Theme switching MUST change only which values the token variables resolve to, per `theme_selection`; component styles MUST NOT branch on the theme (`packs/user-interface/design-tokens.md` R7).
- **R5.** Stacking order MUST come from the stacking scale only (`packs/user-interface/design-tokens.md` R13).
- **R6.** Styles MUST follow `style_scoping`. A rule MUST NOT raise specificity with an important flag to defeat another rule; the conflicting rule is fixed instead.
- **R7.** Non-essential animation and transition MUST be disabled or replaced under the reduced-motion preference (`packs/user-interface/design-tokens.md` R14).
- **R8.** Layout MUST NOT rely on a fixed width for text containers (`packs/user-interface/content-and-i18n.md` R5); logical properties SHOULD be used where a locale may be right-to-left.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | CI job regenerating the stylesheet and failing on a diff | ⬜ scheduled |
| R2 | stylesheet lint rejecting literal values | ⬜ scheduled |
| R3 | stylesheet lint rejecting fixed-pixel type | ⬜ scheduled |
| R4 | end-to-end test rendering each theme; PR review | ⬜ scheduled |
| R5 | stylesheet lint rejecting literal stacking values | ⬜ scheduled |
| R6 | stylesheet lint rejecting forced specificity | ⬜ scheduled |
| R7 | end-to-end test with the preference emulated | ⬜ scheduled |
| R8 | pseudo-locale and right-to-left rendering in end-to-end tests | ⬜ scheduled |

## AI guardrails

- Reference token variables only; never write a colour, size or stacking number in a stylesheet.
- Use root-relative units for type and spacing.
- Fix the conflicting rule instead of forcing specificity.
- Never edit the generated token stylesheet.

## References

- [CSS Custom Properties for Cascading Variables (W3C)](https://www.w3.org/TR/css-variables-1/)
- [Media Queries Level 5 (W3C)](https://www.w3.org/TR/mediaqueries-5/) — colour-scheme, reduced-motion and contrast preferences
- `packs/user-interface/design-tokens.md`, `packs/user-interface/content-and-i18n.md`
