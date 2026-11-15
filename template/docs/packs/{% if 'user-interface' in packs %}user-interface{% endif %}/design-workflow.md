---
layer: packs/user-interface
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Design Workflow & Fidelity

## Purpose

How designs are produced, stored and handed to implementation, and how the implementation is checked against them. Tool-neutral and platform-neutral.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `design_tool` | [[design_tool]] | decided in `13-technology/` (e.g. a design canvas, a code-first prototype); never assumed | the workflow must survive changing tools |
| `design_source_of_truth` | [[design_source_of_truth]] | an exported design artifact committed to the repository and linked from the spec | a link to a live canvas changes under you |
| `design_artifact_location` | [[design_artifact_location]] | one directory in the repository, one artifact per screen | scattered artifacts cannot be found or diffed |
| `tokens_in_design` | [[tokens_in_design]] | designs take every value from the project's tokens, never their own | drift between design and code starts here |
| `screen_specs` | [[screen_specs]] | one prompt/spec per screen plus a shared context file of product truths | — |
| `mismatch_resolution` | [[mismatch_resolution]] | a design/code mismatch is resolved explicitly (the token, the design or the code changes) and recorded | — |
| `fidelity_check` | [[fidelity_check]] | every implemented screen is compared to its committed design before the story is done | manual comparison does not scale; an automated check is chosen in `13-technology/` |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Which screen sizes, form factors and themes does a fidelity check cover?
- [ ] What tolerance counts as a match, and who may accept a deviation?

## Rules

### Designs

- **R1.** A story that adds or changes a screen MUST link a design artifact in its Design section (`17-specs/feature-spec-template.md`).
- **R2.** The artifact MUST be exported and committed at `design_artifact_location`. A link to a live canvas MUST NOT be the source of truth (`design_source_of_truth`).
- **R3.** When the design changes, the committed artifact MUST be refreshed before implementation continues; an implementation MUST be built against the committed copy.
- **R4.** A design MUST take every value from the project's tokens (`tokens_in_design`). A value with no token MUST be added to the token source first (`design-tokens.md` R16).
- **R5.** A design MUST show the states in `ux-states.md` R1 for every data-driven surface, and MUST show each theme.
- **R6.** Copy in a design MUST use the glossary's UI labels for each locale shown (`content-and-i18n.md` R11).

### Screen specs

- **R7.** Each screen MUST have one screen spec stating its purpose, data, states, actions and copy keys, and linking its design artifact.
- **R8.** A shared context file MUST hold the product truths every screen spec relies on: domain names, locales, themes, irreversible actions and the status map. A screen spec MUST NOT restate them.

### Fidelity

- **R9.** A design/code mismatch MUST be resolved explicitly by changing the token, the design or the code, and the resolution MUST be recorded in the story.
- **R10.** Before a story that changes a screen is done, the implementation MUST be checked against its committed artifact in every theme and the screen sizes named in its screen spec (`fidelity_check`), and the result MUST be attached to the change.
- **R11.** A deviation accepted from the design MUST be recorded with who accepted it; it MUST NOT be left as an unexplained difference.
- **R12.** No rule in this document may depend on `design_tool`; changing tools MUST NOT change the artifacts' location or the fidelity check's inputs.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | PR template checklist; spec lint for a missing Design section (`17-specs/spec-lifecycle.md`) | ⬜ scheduled |
| R2 | check that the linked artifact path exists in the repository | ⬜ scheduled |
| R3 | PR review comparing artifact and story dates | ❌ review-only |
| R4 | design-to-token validation chosen with `design_tool` | ⬜ scheduled |
| R5 | PR review of the artifact | ❌ review-only |
| R6 | PR review against the glossary | ❌ review-only |
| R7 | spec lint for required screen-spec sections | ⬜ scheduled |
| R8 | PR review | ❌ review-only |
| R9 | PR review of the story's recorded resolution | ❌ review-only |
| R10 | fidelity check run in CI or attached evidence (tool chosen in `13-technology/`) | ⬜ scheduled |
| R11 | PR review | ❌ review-only |
| R12 | review at tool change | ❌ review-only |

## AI guardrails

- Implement from the committed design artifact, never from memory or a live link.
- Take values only from tokens; if one is missing, add the token first.
- Resolve a mismatch by changing the token, the design or the code, and write down which.
- Run the fidelity check before calling a screen done.

## References

- [W3C Design Tokens Community Group format](https://www.designtokens.org/)
- `design-tokens.md`, `ux-states.md`, `content-and-i18n.md`
- `17-specs/feature-spec-template.md`, `17-specs/spec-lifecycle.md`
