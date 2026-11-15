---
layer: packs/user-interface
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Accessibility

## Purpose

The conformance target and the checks that hold every interface to it. Contrast of the tokens is checked mechanically; the rest combines an automated scan with review.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `conformance_target` | [[conformance_target]] | WCAG 2.2 AA | AAA is rarely achievable across a whole product |
| `contrast_checked_in` | [[contrast_checked_in]] | every theme | checking only the default theme ships unreadable dark modes |
| `contrast_minimum` | [[contrast_minimum]] | 4.5 for text, 3 for large text and graphics | a stricter ratio is safer and constrains the palette |
| `automated_check` | [[automated_check]] | an automated accessibility scan in end-to-end tests that fails the build; tool chosen in `13-technology/` | automation catches roughly a third of issues; the rest is review |
| `manual_review_for` | [[manual_review_for]] | new flows and new components | — |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Which assistive technologies and browsers are in the manual review matrix?
- [ ] Is a public accessibility statement required, and who owns it?

## Rules

### Conformance

- **R1.** Every interface MUST meet `conformance_target`. A known gap MUST be recorded with an owner and a date in this document's project copy.
- **R2.** Text and meaningful graphics MUST meet `contrast_minimum` against their background in every theme in `contrast_checked_in`.
- **R3.** Every text and graphic pairing used by a component MUST be listed as a contrast pair in the project's UI configuration (`.baseline/ui.json`), so R2 is checked rather than assumed.
- **R4.** Information MUST NOT be conveyed by colour alone; a status, an error and a selection MUST also carry text, shape or an icon with a text alternative.

### Operation

- **R5.** All functionality MUST be operable by keyboard alone, without a keyboard trap.
- **R6.** The focus indicator MUST be visible in every theme, MUST come from the focus token, and MUST NOT be removed without a replacement of equal visibility.
- **R7.** Focus order MUST follow reading order. Opening a dialog MUST move focus into it; closing it MUST return focus to the element that opened it.
- **R8.** Interactive elements MUST be the native element for their role (`components.md` R4).
- **R9.** Pointer targets MUST be at least 24 by 24 CSS pixels, or have equivalent spacing.

### Content

- **R10.** Non-text content MUST have a text alternative; decorative content MUST be hidden from assistive technology.
- **R11.** Every form control MUST have a programmatically associated label. A validation error MUST be associated with its control and identified in text.
- **R12.** A status change the user did not trigger by moving focus (a result, a failure, a refresh) MUST be announced through a live region.
- **R13.** Content MUST reflow without horizontal scrolling at a 320 CSS pixel width and remain usable when text is enlarged to 200%.
- **R14.** Visible text, assistive labels, alternative text and announcements MUST all come from the catalog (`content-and-i18n.md` R1), so they are translated together.

### Verification

- **R15.** The automated check in `automated_check` MUST run on every change to the interface and MUST fail the build on a violation at or above `conformance_target`.
- **R16.** A change listed in `manual_review_for` MUST pass a keyboard-only walkthrough and a screen-reader walkthrough before it is done; the result MUST be recorded on the change.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | PR review against the recorded gap list | ❌ review-only |
| R2 | `scripts/checks/ui-token-contrast.mjs` computes WCAG contrast for declared pairs in every theme file (hex colours only); becomes automated once `scripts/check.mjs` runs it | ◐ partial |
| R3 | `scripts/checks/ui-token-contrast.mjs` fails on a pair naming an unknown token; completeness of the list is PR review | ◐ partial |
| R4 | automated scan plus PR review | ◐ partial |
| R5 | end-to-end keyboard tests | ⬜ scheduled |
| R6 | automated scan plus PR review | ◐ partial |
| R7 | end-to-end tests for dialogs; PR review | ⬜ scheduled |
| R8 | lint rule for non-native interactive elements | ⬜ scheduled |
| R9 | automated scan | ⬜ scheduled |
| R10 | automated scan | ⬜ scheduled |
| R11 | automated scan | ⬜ scheduled |
| R12 | manual screen-reader walkthrough | ❌ review-only |
| R13 | end-to-end test at the narrow viewport and enlarged text | ⬜ scheduled |
| R14 | hard-coded-copy lint (`content-and-i18n.md` R1) | ⬜ scheduled |
| R15 | CI job running `automated_check` | ⬜ scheduled |
| R16 | PR template checklist | ❌ review-only |

## AI guardrails

- Never remove or hide a focus indicator.
- Never convey meaning by colour alone.
- Never make a generic element clickable; use the native element.
- Every control gets a label and every image a text alternative or an explicit decorative mark.
- Add every new text-on-background pairing to the contrast pairs.

## References

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- `design-tokens.md`, `components.md`, `content-and-i18n.md`
- `../../05-protocols/rfc-profile.md` (WCAG is added to the adopted standards by this pack)
