---
layer: packs/user-interface
status: not-started # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Accessibility

## Purpose

The conformance target and the checks that hold every interface to it.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `conformance_target` | [[conformance_target]] | WCAG 2.2 AA | AAA is rarely achievable across a whole product |
| `contrast_checked_in` | [[contrast_checked_in]] | every theme | checking only the default theme ships unreadable dark modes |
| `automated_check` | [[automated_check]] | an automated accessibility scan in end-to-end tests that fails the build; tool chosen in 13-technology/ | automation catches roughly a third of issues; the rest is review |
| `manual_review_for` | [[manual_review_for]] | new flows and new components | — |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

<!-- baseline: proposed default rules land here in a later baseline release. -->

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |

## AI guardrails

## References
