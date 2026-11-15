---
layer: packs/user-interface
status: not-started # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Design Workflow & Fidelity

## Purpose

How designs are produced, stored and handed to implementation, and how the implementation is checked against them. Tool-neutral.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `design_tool` | [[design_tool]] | decided in 13-technology/ (e.g. a design canvas, a code-first prototype); never assumed | the workflow must survive changing tools |
| `design_source_of_truth` | [[design_source_of_truth]] | an exported design artifact committed to the repository and linked from the spec | a link to a live canvas changes under you |
| `tokens_in_design` | [[tokens_in_design]] | designs take every value from the project's tokens, never their own | drift between design and code starts here |
| `screen_specs` | [[screen_specs]] | one prompt/spec per screen plus a shared context file of product truths | — |
| `mismatch_resolution` | [[mismatch_resolution]] | a design/code mismatch is resolved explicitly — the token, the design or the code changes — and recorded | — |
| `fidelity_check` | [[fidelity_check]] | every implemented screen is compared to its committed design before the story is done | manual comparison does not scale; an automated check is chosen in 13-technology/ |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

<!-- baseline: proposed default rules land here in a later baseline release. -->

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |

## AI guardrails

## References
