---
layer: 16-ai
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Agent Autonomy & Context

## Purpose

Two questions, answered once: who approves a change, and what an agent must have read before
making it. Both are properties of the kind of change, not of how confident the agent is. How an
agent works through a task is `operating-procedure.md`; what it must never do is
`prohibitions.md`.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `autonomy_tiers` | [[autonomy_tiers]] | 1 docs · 2 tests · 3 feature code · 4 security, data migrations, CI, infrastructure, dependencies | which change types need a plan and per-step approval: more in tier 4 means more safety and slower delivery |
| `auto_merge` | [[auto_merge]] | never, at any tier | speed vs. a human having read every change |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Adjust the path-to-layer table in R9 to the project's real directory layout once it exists.
- [ ] Which change types beyond the defaults belong in tier 4 for this project (for example,
      changes to a regulated data flow)?

## Rules

### Autonomy tiers

- **R1.** Nothing merges without a human's approval. There MUST NOT be an auto-merge path at any
  tier, for any author; changing this requires an ADR that supersedes this rule.
- **R2.** The tier of a change is set by its change type, using the tiers in `autonomy_tiers`.
  The default tiers are:

  | Tier | Change type | Requirement |
  | --- | --- | --- |
  | 1 | Docs, comments, spec text | Pull request; one reviewer, skim-level |
  | 2 | Tests only | Pull request; one reviewer, skim-level |
  | 3 | Feature code, refactors, bug fixes | Approved plan, pull request, and a reviewer who read the diff |
  | 4 | Security, data migrations, CI, infrastructure, dependencies | Approved plan, pull request, a reviewer who read the diff, and explicit human approval per step for agent-authored changes |

- **R3.** When a change spans tiers, the highest tier applies to the whole change.
- **R4.** For tier 3 and 4, review means a human read the diff and can say what it does. An
  approval from someone who has not read the diff does not count.
- **R5.** The reviewer MUST NOT be the author. The number of approvals required is
  `required_approvals` in `14-git/git.md`.
- **R6.** An agent MUST state in the pull request body the tier it believes the change falls
  under, and why when the change spans tiers.
- **R7.** An agent MUST NOT lower a change's tier by splitting it into pieces that each fall in a
  lower tier.

### Context protocol

- **R8.** Before its first edit an agent MUST have loaded, in this order:
  1. `AGENTS.md`
  2. `docs/README.md`
  3. the story spec and its parent feature spec, when the task has them
  4. every standard the spec names under its standards-to-read section
  5. every `ratified` document in the layers the change touches (R9, R10)
- **R9.** The touched layers are derived from the paths the change will modify, using the table
  below. The project adjusts the table to its real layout and records the adjustment here.

  | Kind of change | Documents to read |
  | --- | --- |
  | Any source code | `03-architecture/`, `10-patterns/`, `11-style/`, `09-errors/` |
  | Domain model, entities, state transitions | `02-domain/` |
  | Persistence, queries, data schema | `06-security/`, `08-reliability/`, `13-technology/` |
  | Data migrations | `15-delivery/deployments-and-rollback.md`, `08-reliability/` |
  | Public interfaces, protocols, message formats | `05-protocols/`, `09-errors/`, and any installed pack for that interface |
  | Authentication, authorization, cryptography, secrets | `06-security/` |
  | Logging, metrics, tracing, health | `07-observability/` |
  | Retries, timeouts, concurrency, background work | `08-reliability/` |
  | User-facing screens and copy | any installed user-interface pack |
  | Tests | `12-testing/` |
  | Build, CI, deployment, infrastructure | `14-git/`, `15-delivery/`, `13-technology/` |
  | Documentation, specs, ADRs | `16-ai/`, `17-specs/`, `04-adr/` |

- **R10.** An agent that cannot map a path to a layer MUST ask a human; it MUST NOT guess.
- **R11.** Loading a layer means reading its `ratified` documents. A `not-started` or `proposed`
  document in a touched layer is a signal to ask under `operating-procedure.md` R4, not a file to
  skim and move past.
- **R12.** A rule lives in exactly one document. A rules file written only for agents MUST NOT
  exist alongside the standard it paraphrases; agent-facing content goes in the document's
  `## AI guardrails` section.
- **R13.** `AGENTS.md` at the repository root is the canonical agent entry point. Tool-specific
  entry files are pointers to it and MUST NOT restate a rule held elsewhere.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | Branch protection: required approval, no auto-merge, no self-approval | ⬜ scheduled |
| R2, R3, R6 | Pull request template tier field, asserted by a CI job | ⬜ scheduled |
| R4 | Reviewer names what the diff does in the approval | ❌ review-only |
| R5 | Branch protection: no self-approval | ⬜ scheduled |
| R7 | Pull request review | ❌ review-only |
| R8, R10 | `AGENTS.md` read-first list; pull request review | ❌ review-only |
| R9 | This table; pull request review | ❌ review-only |
| R11 | `scripts/check.mjs` validates every `status` value, so a document's status is always readable | ◐ partial |
| R12 | Review rejects a parallel rules file | ❌ review-only |
| R13 | `scripts/check.mjs` runs `sync-adapters.mjs --check`, failing when an adapter holds more than a pointer | ✅ automated |

## AI guardrails

- Nothing auto-merges, at any tier.
- The highest tier of the change governs all of it. Never split a change to lower its tier.
- Tier 3 and 4 need an approved plan first. Tier 4 also needs per-step human approval.
- State the tier, and why, in the pull request body.
- Always load first: `AGENTS.md`, `docs/README.md`, the specs, the standards the spec names.
- Cannot map a path to a layer? Ask.
- Never create an agent-only copy of a rule.

## References

- `16-ai/operating-procedure.md` — the loop these tiers sit inside
- `16-ai/prohibitions.md` — what is never allowed at any tier
- `14-git/git.md` — `required_approvals`
- `17-specs/spec-lifecycle.md` — when a spec is required
