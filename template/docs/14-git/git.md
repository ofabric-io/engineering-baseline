---
layer: 14-git
status: proposed
owner: TBD
last-reviewed: never
---

# Git Standards

## Purpose

Branching, commit messages, pull requests, review and release tags. This document owns three
rules others cite: the reviewer is never the author (R15, R20), the approval requirement (R15) and
the pull-request title rule (R14). The hosting platform is a technology choice recorded in
`13-technology/`; the rules here do not depend on it. "The default branch" is the one long-lived
branch the hosting platform names as such; its name is the project's.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `branching_model` | [[branching_model]] | trunk-based; short-lived branches | long-lived branches become merge debt |
| `branch_naming` | [[branch_naming]] | `<type>/<slug>`, type one of `commit_types` | a richer scheme (ticket id) aids tracking and lengthens names |
| `branch_max_age_days` | [[branch_max_age_days]] | 5 | a longer limit tolerates large changes at the price of merge conflicts |
| `merge_strategy` | [[merge_strategy]] | squash only | one commit per change keeps history bisectable; merge commits preserve intermediate steps |
| `commit_types` | [[commit_types]] | `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `chore`, `build`, `ci`, `style`, `revert` | a smaller set is easier to remember; a larger one drives finer changelog sections |
| `commit_subject_max_length` | [[commit_subject_max_length]] | 72 characters | a shorter limit forces sharper subjects; a longer one truncates in some tools |
| `changelog_source` | [[changelog_source]] | generated from Conventional Commits | a hand-written changelog reads better and drifts from what shipped; choosing it changes R19 |
| `required_approvals` | [[required_approvals]] | 1, never the author | more reviewers vs. throughput |
| `self_review_allowed` | [[self_review_allowed]] | no | `yes` removes the independent reviewer (see "Solo mode"); only a one-person project should choose it |
| `pr_size_soft_limit` | [[pr_size_soft_limit]] | 400 changed lines excluding generated files | large PRs are reviewed worse |
| `code_owned_paths` | [[code_owned_paths]] | schema and data migrations, authentication and authorization, cryptography, CI configuration, infrastructure code | more paths add routing noise; fewer let high-risk changes go unseen |

### Solo mode (`self_review_allowed`)

With `no`, every change needs `required_approvals` approvals from people other than the author;
this is the default and the only setting that gives an independent check. A project with a single
human maintainer cannot satisfy it and MAY set `yes`. The trade-off is explicit: nobody else sees
the change, so the compensating controls in R20 replace the second pair of eyes, and they are a
weaker substitute, not an equal one. A project that gains a second maintainer MUST switch the
parameter back to `no`.

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Does the hosting platform's plan support branch protection for every rule below?

## Rules

### Branching

- **R1.** The project MUST follow `branching_model`; under the default, the default branch is the
  only long-lived branch and is always releasable.
- **R2.** Work MUST happen on a branch cut from the default branch and named per `branch_naming`; a
  branch MUST be deleted on merge.
- **R3.** A branch MUST NOT live longer than `branch_max_age_days`.
- **R4.** Committing, merging, rebasing or resetting directly on the default branch MUST NOT occur.

### Commits

- **R5.** Commit messages MUST follow Conventional Commits.
- **R6.** The commit type MUST be one of `commit_types`; the scope, where used, names a unit from
  the project's architecture.
- **R7.** The subject line MUST be imperative and no longer than `commit_subject_max_length`.
- **R8.** A commit MUST NOT mix a refactor with a behaviour change.
- **R9.** A commit authored by an AI agent MUST carry a `Co-Authored-By` trailer naming the agent;
  the trailer does not change the review requirement in R15.
- **R10.** Commit and push hooks MUST NOT be bypassed (`--no-verify` or equivalent).

### Pull requests

- **R11.** Every change MUST reach the default branch through a pull request; there are no direct
  pushes.
- **R12.** Pull requests MUST be merged per `merge_strategy`.
- **R13.** The pull request body MUST be the project's template, filled in: every section present,
  in the template's order, with a section that does not apply answered ("None.") and not deleted.
  The template is `.github/pull_request_template.md` on GitHub,
  `.gitlab/merge_request_templates/Default.md` on GitLab, and `docs/14-git/pull-request-template.md`
  on any other host; `scripts/pr/open-pr.mjs` checks a body against it.
- **R14.** A pull request title MUST reference its story (`17-specs/spec-lifecycle.md`) when one
  exists; titles of type `chore`, `docs`, `ci`, `build` and `revert` are exempt.
- **R15.** A pull request MUST have `required_approvals` approving reviews, none by the author
  (subject to R20), and all required checks passing; neither requirement is bypassable, including
  by an administrator.
- **R16.** A pull request SHOULD stay under `pr_size_soft_limit`; a larger one MUST state in its body
  why it could not be split.
- **R17.** Paths in `code_owned_paths` MUST have code owners who are requested for review.

### Releases

- **R18.** Release tags MUST follow the versioning scheme in
  `15-delivery/releases-and-distribution.md` R1 and MUST be applied on the default branch.
- **R19.** Where `changelog_source` is generated, the changelog MUST be generated from Conventional
  Commits and a hand-edited changelog MUST NOT be committed; otherwise the changelog MUST be
  updated in the same pull request as the change it describes.

### Solo mode

- **R20.** Where `self_review_allowed` is `no`, the author of a pull request MUST NOT approve it,
  and an AI agent MUST NOT be the approving reviewer of a change it or another agent wrote. Where
  it is `yes`, a pull request MUST NOT merge until every required check has passed and at least 24
  hours have passed since its last push, and the author MUST re-read the full diff after that
  period and record having done so in the pull request.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1–R3 | Review; branch protection and a stale-branch report on the hosting platform | ⬜ scheduled |
| R4 | Branch protection for everyone; an agent-side guard where the tool supports one | ⬜ scheduled |
| R5–R7 | `.githooks/commit-msg` and a title check in CI | ✅ automated |
| R8 | PR review | ❌ review-only |
| R9 | PR review; a trailer check in CI MAY be added | ❌ review-only |
| R10 | Server-side checks repeat every hook (`15-delivery/pipeline-and-gates.md` R3) | ◐ partial |
| R11, R12, R15 | Hosting-platform branch protection: require PR, merge strategy, approvals, no self-approval unless R20 allows it, no administrator bypass | ⬜ scheduled |
| R13 | `scripts/pr/open-pr.mjs` refuses a body missing a template section; a CI job for PRs opened by other means | ◐ partial |
| R14 | CI job checking the title for a story reference | ⬜ scheduled |
| R16 | CI warning at the size limit; not blocking | ⬜ scheduled |
| R17 | Code-owners file in the repository | ⬜ scheduled |
| R18, R19 | Release workflow (`15-delivery/releases-and-distribution.md`) | ⬜ scheduled |
| R20 | Branch protection for the approval rule; a merge gate on the waiting period and the recorded re-read | ⬜ scheduled |

## AI guardrails

- Branch from the default branch; never work on it. Never bypass a hook.
- Conventional Commits, imperative subject, within the length limit.
- Never mix a refactor with a behaviour change in one commit.
- Add the `Co-Authored-By` trailer to every commit you make; it does not relax review.
- Every change goes through a pull request, using the filled-in template and a story reference.
- Keep a pull request under the size limit or explain why not.
- Never approve your own pull request, or one written by another agent.

## References

- [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)
- `15-delivery/releases-and-distribution.md` — versioning behind release tags
- `15-delivery/pipeline-and-gates.md` — the required checks R15 refers to
- `17-specs/spec-lifecycle.md` — stories referenced in titles
- `16-ai/autonomy-and-context.md` — autonomy tiers and review of agent work
