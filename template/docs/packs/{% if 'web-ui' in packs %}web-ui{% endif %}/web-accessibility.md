---
layer: packs/web-ui
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Web Accessibility Specifics

## Purpose

The browser mechanics that meet the platform-neutral accessibility rules of
`packs/user-interface/accessibility.md`: native HTML semantics, ARIA and live regions, reflow at a
CSS pixel width, focus and zoom behaviour, and the browser's own preference signals.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `reflow_width` | [[reflow_width]] | 320 CSS pixels | a wider minimum is easier to lay out and fails users who zoom |
| `live_region_default` | [[live_region_default]] | polite for results and refreshes; assertive only for a failure that blocks the user | assertive announcements interrupt whatever the user is hearing |
| `skip_navigation` | [[skip_navigation]] | a skip link to the main content on every page with repeated navigation | single-view applications with no repeated block may omit it |
| `browser_matrix` | [[browser_matrix]] | the current and previous major version of each engine the project supports, with one screen reader per desktop and mobile platform | a wider matrix finds more defects and costs review time |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Which screen reader and browser pairs are in the manual review matrix?

## Rules

### Semantics

- **R1.** Interactive elements MUST be real buttons, links and form controls; a generic element MUST NOT be made clickable (`packs/user-interface/accessibility.md` R8, `packs/user-interface/components.md` R4).
- **R2.** A link MUST navigate and a button MUST act; a control MUST NOT be used for the other role.
- **R3.** Each page MUST have one level-one heading, a heading order that does not skip levels, and landmark regions for its main areas.
- **R4.** ARIA MUST be used only where native elements cannot express the role, state or relationship; a role MUST NOT contradict its element, and every ARIA state MUST be kept in step with the visible state.
- **R5.** Each page MUST declare its language, and a passage in another language MUST declare its own.
- **R6.** Each page MUST have a unique, descriptive title, updated on every route change in a single-page application.

### Announcements and focus

- **R7.** A status change that does not move focus (`packs/user-interface/accessibility.md` R12) MUST be announced through a live region that is present in the document before its content changes; its politeness MUST follow `live_region_default`.
- **R8.** A route change in a single-page application MUST move focus to the new view's heading or main region and MUST announce the new title.
- **R9.** The skip mechanism in `skip_navigation` MUST be the first focusable element and MUST become visible on focus.
- **R10.** Focus indicators MUST NOT be suppressed by a style rule unless a replacement of equal visibility is applied (`packs/user-interface/accessibility.md` R6).

### Reflow, zoom and size

- **R11.** Content MUST reflow without horizontal scrolling at `reflow_width`, except content that needs two-dimensional layout (a data table, a map).
- **R12.** The page MUST NOT disable user zoom or scaling, and MUST remain usable at 200% text enlargement (`packs/user-interface/accessibility.md` R13).
- **R13.** `target_size_minimum` (`packs/user-interface/accessibility.md` R9) is measured in CSS pixels on the web.
- **R14.** Content shown on hover or focus MUST be dismissible, hoverable and persistent until dismissed.

### Preferences

- **R15.** The interface MUST honour the browser's reduced-motion, colour-scheme and contrast preference signals (`packs/user-interface/design-tokens.md` R14).

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | lint rule for non-native interactive elements | ⬜ scheduled |
| R2 | lint rule and automated scan | ⬜ scheduled |
| R3 | automated scan | ⬜ scheduled |
| R4 | automated scan; PR review | ◐ partial |
| R5 | automated scan | ⬜ scheduled |
| R6 | end-to-end test of route titles | ⬜ scheduled |
| R7 | manual screen-reader walkthrough | ❌ review-only |
| R8 | end-to-end test of focus after navigation | ⬜ scheduled |
| R9 | end-to-end keyboard test | ⬜ scheduled |
| R10 | automated scan plus PR review | ◐ partial |
| R11 | end-to-end test at `reflow_width` | ⬜ scheduled |
| R12 | automated scan for the viewport declaration; end-to-end test at enlarged text | ⬜ scheduled |
| R13 | automated scan | ⬜ scheduled |
| R14 | PR review | ❌ review-only |
| R15 | end-to-end tests with each preference emulated | ⬜ scheduled |

## AI guardrails

- Use a real button or link; never a generic element with a click handler.
- Add ARIA only when no native element fits, and keep it in step with the visible state.
- Put a live region in the page before filling it.
- Never disable zoom or remove a focus outline.
- Move focus and announce the title on every route change.

## References

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/)
- `packs/user-interface/accessibility.md`, `packs/user-interface/components.md`
