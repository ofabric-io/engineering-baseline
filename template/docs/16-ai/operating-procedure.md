---
layer: 16-ai
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Agent Operating Procedure

## Purpose

The steps an agent follows from picking up a task to handing it back, and how it reports. An
agent that follows them produces changes a human can review in minutes; one that does not
produces changes a human must re-derive.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| _none_ | | | |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Which verification commands make up "done" for this project? They live in
      `15-delivery/pipeline-and-gates.md`; each story spec lists the ones it needs.

## Rules

### Before implementation

- **R1.** An agent MUST read, before its first edit and in this order: `AGENTS.md`,
  `docs/README.md`, the parent feature spec and the story spec when the task has them, then the
  standards the spec names and the `ratified` documents of the touched layers
  (`16-ai/autonomy-and-context.md` R8).
- **R2.** An agent MUST confirm a clean working tree and an active task branch before its first
  edit, and MUST NOT work on a protected branch.
- **R3.** An agent MUST NOT infer a rule from a `not-started` document, and MUST treat a
  `proposed` document as unadopted: usable as a suggestion, labelled as such, never as a
  requirement.
- **R4.** When a needed rule is absent, ambiguous, or lives in a document that is not `ratified`,
  the agent MUST stop and ask a human. It MAY propose a rule or an ADR; it MUST NOT adopt one
  silently or proceed on an assumed answer.
- **R5.** An approved plan MUST exist before an agent writes tier 3 or tier 4 code
  (`16-ai/autonomy-and-context.md` R2).

### After implementation

- **R6.** Before declaring work done an agent MUST run the verification commands named in the
  story spec (or, with no spec, those required by `15-delivery/pipeline-and-gates.md`), and MUST
  verify each acceptance criterion one by one.
- **R7.** An agent MUST re-read its complete diff, checking for changes unrelated to the task.
- **R8.** An agent MUST report the verification commands and their results verbatim, failures
  included. Declaring work done while a step failed or was skipped is prohibited
  (`16-ai/prohibitions.md` P15).

### Blocked work and records

- **R9.** A blocked sub-task MUST NOT block the rest of the work. The agent completes every
  independent part, then reports precisely what it could not do and why.
- **R10.** An agent MUST obtain explicit human approval, per change, before it:
  - edits CI, deployment or infrastructure configuration;
  - edits an agent tool's own settings, hooks or permissions.
- **R11.** An agent MAY author a migration; executing one is governed by `16-ai/prohibitions.md`
  P16, which owns that rule.
- **R15.** Adding, upgrading or removing a dependency MUST follow
  `06-security/dependencies-and-supply-chain.md`, which owns that policy.
- **R12.** An agent MUST record every deviation from the spec or a standard in both the spec's
  deviations section and the pull request body.
- **R13.** An agent MUST state every assumption it made, where no explicit answer existed, in the
  pull request body; a code comment does not satisfy this.
- **R14.** The pull request body MUST state the autonomy tier (`16-ai/autonomy-and-context.md`
  R6) and link the plan where R5 applied.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | `AGENTS.md` read-first list; pull request review | ❌ review-only |
| R2 | Hook or git guard refusing commits on a protected branch; branch protection | ⬜ scheduled |
| R3 | `docs/README.md` status table; `scripts/check.mjs` validates `status` values | ◐ partial |
| R4 | Instruction only; the open question is visible in the pull request | ❌ review-only |
| R5 | Plan link required in the pull request body | ⬜ scheduled |
| R6 | CI runs the same verification commands (`15-delivery/pipeline-and-gates.md`) | ⬜ scheduled |
| R7 | Pull request review | ❌ review-only |
| R8 | CI is the source of truth; pull request template field for results | ⬜ scheduled |
| R9 | Pull request review | ❌ review-only |
| R10 | Permission prompts and deny rules in the agent tool's settings; code-ownership review of CI and dependency files | ◐ partial |
| R11 | As P16 in `16-ai/prohibitions.md`; authoring is unrestricted | ◐ partial |
| R15 | As `06-security/dependencies-and-supply-chain.md` | ⬜ scheduled |
| R12, R13, R14 | Pull request template sections, asserted by a CI job | ⬜ scheduled |

## AI guardrails

- Order: `AGENTS.md`, `docs/README.md`, specs, standards. Then edit.
- Clean tree, task branch, never a protected branch.
- `not-started` has no rules; `proposed` is not adopted. Ask.
- Plan first for tier 3 and 4.
- Run the verification commands; paste results verbatim; never claim done on a failure.
- Blocked on one part? Finish the rest, then say what is left.
- Record deviations and assumptions in the spec and the pull request.
- Never run a migration (P16). Dependency changes follow the dependency policy.
- Ask before touching CI or tool settings.

## References

- `16-ai/autonomy-and-context.md`, `16-ai/prohibitions.md`
- `15-delivery/pipeline-and-gates.md`
- `06-security/dependencies-and-supply-chain.md`
- `17-specs/spec-lifecycle.md`
