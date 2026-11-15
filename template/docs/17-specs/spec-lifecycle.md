---
layer: 17-specs
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Spec Lifecycle

## Purpose

When a spec is required, its states, who moves it, and how specs are numbered. A spec is the
input that makes a change reviewable before it is built; it cuts vertically through the
standards layers and never overrides them. Where the work is tracked is `work-tracking.md`.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `spec_required_for` | [[spec_required_for]] | feature spec: a new or changed business capability, or a change spanning more than one context; story spec: any tier 3 or 4 change | requiring a spec everywhere turns specs into a formality nobody reads |
| `id_prefixes` | [[id_prefixes]] | `FEAT-NNN` for features, `STORY-NNN` for stories; numbers never reused, gaps are reservations | shorter prefixes read better in branch names; changing them later breaks every existing reference |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Are there changes below tier 3 that this project wants a story spec for anyway?

## Rules

### What a spec is for

- **R1.** A spec MUST make a change reviewable before it is built. A record of a decision
  already made belongs in an ADR (`04-adr/`), not in a spec.
- **R2.** A spec MUST NOT override a standard. A needed exception is an ADR.
- **R3.** A spec MUST NOT restate a standard; it names the document under its standards-to-read
  section. A second copy of a rule drifts.

### When a spec is required

- **R4.** A feature spec MUST exist for every change covered by `spec_required_for` as feature
  spec.
- **R5.** A story spec MUST exist for every change covered by `spec_required_for` as story spec;
  by default, every tier 3 or 4 change (`16-ai/autonomy-and-context.md` R2).
- **R6.** A spec is not required for a bug fix with a failing regression test, a documentation
  change, or a refactor with no behaviour change, unless `spec_required_for` says so.
- **R7.** A bug fix MUST begin with a failing test (`12-testing/strategy.md`); the test is its
  spec.

### Status

- **R8.** A spec MUST carry one status, and only a human moves it forward:

  | Status | Meaning |
  | --- | --- |
  | `draft` | Being written; nothing may be implemented from it |
  | `approved` | A human accepted it; implementation may begin |
  | `implemented` | Merged, with the pull request linked |
  | `superseded` | Replaced by another spec, which is named |
  | `abandoned` | Deliberately not built, with the reason recorded |

- **R9.** An agent MUST NOT implement from a `draft` spec and MUST NOT move a spec to
  `approved`.
- **R10.** A spec MUST NOT be approved while it contains an unresolved
  `[NEEDS CLARIFICATION: ...]` marker or an unfilled `[[...]]` placeholder.
- **R11.** A `superseded` or `abandoned` spec MUST NOT be deleted; it stays with its reason.

### Open questions

- **R12.** A spec MUST list its open questions in an `## Open questions` section.
- **R13.** An agent that meets an open question relevant to its task MUST stop and ask
  (`16-ai/operating-procedure.md` R4). It MUST NOT resolve one by choosing.
- **R14.** A spec MAY be approved with open questions standing only if it states that none of
  them blocks the work in scope.

### Traceability

- **R15.** A story spec MUST name its parent feature spec.
- **R16.** Each acceptance criterion MUST be numbered, independently testable, and map to at
  least one test.
- **R17.** The pull request title MUST reference its story spec ID, and the body MUST tick each
  acceptance criterion individually (`14-git/git.md`).
- **R18.** A spec MUST record every deviation from it in a `## Deviations` section, and the pull
  request body MUST repeat it (`16-ai/operating-procedure.md` R12).
- **R19.** A spec MUST list the IDs it depends on in `depends-on`; a story is startable only
  when each of them is `implemented` or carries a merged pull request link.
- **R20.** A spec moves to `implemented` only with its pull request linked in `pr`.

### Numbering and files

- **R21.** Specs MUST be numbered as `id_prefixes` defines. A number is never reused, including
  after the spec is abandoned or superseded.
- **R22.** A new number MUST be the highest number in use, across spec files and the tracker,
  plus one. It MUST NOT be the lowest unused integer.
- **R23.** A gap in the sequence is a reservation, not a mistake, and MUST NOT be closed by
  renumbering; renumbering breaks every branch name, commit scope, pull request title and
  tracker link that cites the old number.
- **R24.** A spec file MUST be named `<ID>-<kebab-slug>.md` and live in `docs/17-specs/`.

### Tracking

- **R25.** Every spec past `draft` MUST be tracked per `work-tracking.md`, with the tracker
  reference recorded in the spec's `tracker` field.
- **R26.** The tracker MUST hold workflow state only, never a copy of a rule or of an acceptance
  criterion.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1, R2, R3 | Review | ❌ review-only |
| R4, R5, R6 | Review; the tier in the pull request body shows whether a story was required | ❌ review-only |
| R7 | Review of the commit history (failing test first) | ❌ review-only |
| R8 | `scripts/check.mjs` rejects a spec whose `status` is not one of the five values | ✅ automated |
| R9 | Frontmatter `status`; visible in the pull request | ❌ review-only |
| R10 | `scripts/check.mjs` rejects an `approved` or `implemented` spec containing an unresolved marker | ✅ automated |
| R11 | No delete path in the tracker adapter; review | ❌ review-only |
| R12, R14 | The spec templates carry the section; review | ❌ review-only |
| R13 | Instruction only | ❌ review-only |
| R15 | The story template requires `parent`; review | ◐ partial |
| R16 | Review; test-to-criterion mapping checked in review | ❌ review-only |
| R17, R18 | Pull request template sections, asserted by a CI job | ⬜ scheduled |
| R19 | Offline startability check over spec frontmatter, run in CI | ⬜ scheduled |
| R20 | Check that `implemented` specs carry a `pr` value | ⬜ scheduled |
| R21, R22, R23 | Numbering helper that reads spec files and the tracker and prints highest plus one | ⬜ scheduled |
| R24 | Filename check in CI | ⬜ scheduled |
| R25 | Check that every spec past `draft` has a `tracker` value | ⬜ scheduled |
| R26 | Review | ❌ review-only |

## AI guardrails

- A spec makes a change reviewable before it is built. It never overrides or restates a
  standard.
- Never implement from a `draft`. Never move a spec to `approved`.
- Unresolved `[NEEDS CLARIFICATION: ...]` or `[[...]]`? It is not approvable. Stop and ask.
- Every story names its parent; every criterion is numbered, testable and has a test.
- Deviations go in the spec and the pull request.
- New number = highest in use + 1. Never reuse one. Never close a gap.
- Never delete an abandoned or superseded spec.
- Never put a rule or acceptance criterion in the tracker.

## References

- `17-specs/work-tracking.md` — the tracker and what a task carries
- `17-specs/feature-spec-template.md`, `17-specs/story-spec-template.md`
- `16-ai/autonomy-and-context.md` — tiers
- `16-ai/operating-procedure.md` — R4, R12
- `14-git/git.md` — pull request title and body
- `12-testing/strategy.md`
