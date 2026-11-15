---
layer: 17-specs
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Work Tracking

## Purpose

How specs map to tracked work items, what the tracker may hold, and what a task needs before an
agent picks it up. `spec-lifecycle.md` decides what a spec is and how it is approved; this
document decides where the work is tracked and how the two stay in step. It says nothing about
estimates or velocity.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `tracker` | [[tracker]] | the `tracker` answer in `.copier-answers.yml`; `none` means a Markdown queue file in the repository | an external tracker gives boards and notifications but is a surface outside the repository's controls |
| `tracker_states` | [[tracker_states]] | `to do` · `in progress` · `complete` | more states give finer visibility, but state that only the tracker holds cannot be checked from the repository |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] What groups features above them (an epic, a milestone, a label), if anything?

## Rules

### What the tracker is

- **R1.** The tracker is the one place where workflow state lives: status, assignee, ordering
  and dates. It MUST NOT be the place where a rule, a standard or an acceptance criterion lives.
- **R2.** With `tracker` set to `none`, the tracker is the Markdown queue `docs/17-specs/QUEUE.md`;
  every rule below applies to it unchanged, with "task" meaning a row or entry in that file.
- **R3.** Access to an external tracker MUST go through one project-owned client or adapter that
  implements only the operations R17 permits. Credentials MUST be read from an ignored local
  file or the environment and MUST NOT be committed (`16-ai/prohibitions.md` P6).
- **R4.** Every call to an external tracker MUST be scoped explicitly to the project's own
  workspace; a client MUST refuse to run against another workspace the same credential can
  reach.

### Mapping specs to work items

- **R5.** The mapping is fixed: a feature spec is one tracked feature item (a list, a group or
  an equivalent); a story spec is one tracked task inside exactly one feature; an implementation
  step is a subtask.
- **R6.** A feature item MUST NOT exist without a `FEAT` spec, and a story task MUST NOT exist
  without a `STORY` spec (identifier format per `id_prefixes` in `17-specs/spec-lifecycle.md`).
  The spec is written first and the tracker item created from it.
- **R7.** A story is the unit that gets a branch, a pull request and a review. A subtask MUST NOT
  carry a spec, a branch, a pull request or acceptance criteria; one that needs its own review
  was a story.
- **R8.** A story MUST NOT be moved between features to reflect what someone preferred to do;
  re-parenting means the parent spec was wrong, and the spec is fixed first.
- **R9.** The spec ID is the primary identifier in branch names, commit scopes and pull request
  titles; the tracker's own ID is a cross-reference, never a substitute.
- **R10.** The link MUST be recorded on both sides: the spec's `tracker` field holds the
  tracker reference, and the task holds the spec path.

### What a task carries before an agent may pick it up

- **R11.** Every feature and story task MUST carry a brief of pointers only, as the first thing
  in its description. For a story it names: the spec path and its status, the parent feature,
  the autonomy tier, the parts touched, the standards to read, the literal verification
  commands, the branch, and the pull request (empty until one exists).
- **R12.** The brief MUST NOT copy the text of a standard, a rule or an acceptance criterion; it
  names what to read. When the brief and the spec disagree, the spec is right and the brief is
  stale.
- **R13.** A story task is startable only when all hold together:
  1. its spec is `approved` (`17-specs/spec-lifecycle.md` R8);
  2. every line of its brief is filled;
  3. every ID in the spec's `depends-on` is cleared: that spec is `implemented`, or carries a
     merged pull request link.
- **R14.** An agent that picks up a task with an unmet condition MUST stop and say which
  condition is unmet and which ID or line is at fault. It MUST NOT infer the missing part.
- **R15.** A tracker status MUST NOT authorise implementation. A task moved to `in progress`
  while its spec is `draft` authorises nothing; only the spec's `status` is the gate.
- **R16.** An open question on the spec that blocks the work in scope blocks the task. The agent
  stops and asks; it MUST NOT resolve the question by choosing and recording the choice in a
  tracker comment (`17-specs/spec-lifecycle.md` R13).

### What an agent may do in the tracker

- **R17.** An agent MAY create a feature or story from a spec, fill or repair a brief, claim a
  story per R19, move a story's status per R21, and comment.
- **R18.** An agent MUST NOT delete any tracked item, comment or field; MUST NOT edit or
  reassign an item it did not create, except for the self-claim in R19; MUST NOT create a
  grouping above features unless the project's rules allow it; and MUST NOT mark a task complete
  before its pull request is merged. Deletion is a human act.

### Claiming work

- **R19.** A story MUST be claimed before its first edit and before its branch is cut: assign it
  to the current user, move it to `in progress`, and only then create the branch. The claim is
  additive and self-only: an agent MAY add the current user as assignee; it MUST NOT remove an
  existing assignee or assign anyone else.
- **R20.** The assignee MUST be the human the session runs for, never the agent, resolved by
  matching the clone's `git config user.email` against the tracker's members. Display names MUST
  NOT be used. With no match, the agent MUST stop and ask.
- **R21.** Status follows the work: a task stays `in progress` while the branch and then the
  pull request are open, and moves to `complete` only after merge, with the pull request link
  recorded in the task. Work stopped or handed back MUST be moved back to `to do` and said out
  loud.
- **R22.** A story already assigned to someone else, or already `in progress`, is claimed; the
  agent MUST stop and ask rather than take it over.
- **R23.** A feature carries no assignee or status of its own; starting a feature means claiming
  its first story. An agent MUST NOT invent a feature-level assignee, status or field to hold a
  claim.

### What never goes into the tracker

- **R24.** The tracker is an external surface. The following MUST NOT be written into any task,
  comment, description or attachment: a secret, token, key or connection string; personal data
  (`06-security/sensitive-data.md`); an unredacted production log excerpt.
- **R25.** A bug report needing real data MUST reference the record by identifier, never by its
  contents.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1, R12 | Review. The rule most likely to be broken by good intentions | ❌ review-only |
| R2 | `scripts/tracker/cli.mjs` with the `none` adapter reads and writes only `docs/17-specs/QUEUE.md` | ✅ automated |
| R3, R4 | `scripts/tracker/cli.mjs` is the only client and uses only the configured workspace; `scripts/checks/secrets.mjs` rejects a committed token | ◐ partial |
| R5, R6, R8 | Review; spec-creation skill creates the item | ❌ review-only |
| R7 | Review | ❌ review-only |
| R9 | Pull request title check in CI | ⬜ scheduled |
| R10 | Check that every spec past `draft` has a `tracker` value | ⬜ scheduled |
| R11, R14 | Adapter command that verifies every startable task has a complete brief | ⬜ scheduled |
| R13 | Offline startability check over spec frontmatter, run in CI; human owns `approved` | ⬜ scheduled |
| R15, R16 | Review; no tool sees intent | ❌ review-only |
| R17, R18 | The adapter implements the permitted operations and has no delete or reassign operation | ⬜ scheduled |
| R19, R20, R22 | `.agents/skills/start-story/SKILL.md` performs the claim through `scripts/tracker/cli.mjs claim` in one step | ◐ partial |
| R21, R23 | Review | ❌ review-only |
| R24 | Redaction scan on outbound payloads in the adapter | ⬜ scheduled |
| R25 | Review | ❌ review-only |

## AI guardrails

- The tracker holds state. The repository holds content. Never copy a rule or criterion into it.
- Spec first, tracker item generated from it, `tracker` written back to the spec.
- Startable means: spec `approved`, brief complete, every dependency cleared. Else stop, say
  which condition, and do not infer.
- A tracker status authorises nothing. Only a human approves a spec.
- Claim first: assign the current user (matched by `git config user.email`), move to
  `in progress`, then cut the branch. Add yourself only; never unassign or reassign.
- Assigned to someone else or already `in progress`? Stop and ask.
- Never delete anything in the tracker. Never mark complete before merge.
- Never write a secret, personal data or a raw log into the tracker.

## References

- `17-specs/spec-lifecycle.md` — R8, R9, R13, R22, R23
- `16-ai/autonomy-and-context.md` — tiers
- `16-ai/prohibitions.md` — P6, P12, P14
- `06-security/sensitive-data.md`
- `14-git/git.md` — pull request title and body
