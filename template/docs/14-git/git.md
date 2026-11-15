---
layer: 14-git
status: proposed
owner: TBD
last-reviewed: never
---

# Git Standards

## Purpose

Branching, commit messages, pull requests, review and release tags. The hosting platform is a
technology choice recorded in `13-technology/`; the rules here do not depend on it.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `branching_model` | [[branching_model]] | trunk-based; short-lived branches | long-lived branches become merge debt |
| `branch_naming` | [[branch_naming]] | `<type>/<slug>`, type one of `feat`, `fix`, `chore`, `docs`, `refactor` | a richer scheme (ticket id) aids tracking and lengthens names |
| `branch_max_age_days` | [[branch_max_age_days]] | 5 | a longer limit tolerates large changes at the price of merge conflicts |
| `merge_strategy` | [[merge_strategy]] | squash only | one commit per change keeps history bisectable; merge commits preserve intermediate steps |
| `required_approvals` | [[required_approvals]] | 1, never the author | more reviewers vs. throughput |
| `pr_size_soft_limit` | [[pr_size_soft_limit]] | 400 changed lines excluding generated files | large PRs are reviewed worse |
| `code_owned_paths` | [[code_owned_paths]] | migrations, authentication and authorization, cryptography, CI configuration, infrastructure code | more paths add routing noise; fewer let high-risk changes go unseen |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Which hosting platform enforces branch protection, and does its plan support every rule below?
- [ ] How are releases cut — by tag only, or by a release workflow? (see
      `15-delivery/deployments-and-rollback.md`)

## Rules

### Branching

- **R1.** The project MUST follow `branching_model`; under the default, `main` is the only long-lived
  branch and is always releasable.
- **R2.** Work MUST happen on a branch cut from `main` and named per `branch_naming`; a branch MUST
  be deleted on merge.
- **R3.** A branch MUST NOT live longer than `branch_max_age_days`.
- **R4.** Committing, merging, rebasing or resetting directly on `main` MUST NOT occur.

### Commits

- **R5.** Commit messages MUST follow Conventional Commits.
- **R6.** The commit type MUST be one of `feat`, `fix`, `refactor`, `perf`, `test`, `docs`,
  `chore`, `build`, `ci`, `style`, `revert`; the scope, where used, names a unit from the project's
  architecture.
- **R7.** The subject line MUST be imperative and 72 characters or fewer.
- **R8.** A commit MUST NOT mix a refactor with a behaviour change.
- **R9.** A commit authored by an AI agent MUST carry a `Co-Authored-By` trailer naming the agent;
  the trailer does not change the review requirement in R15.
- **R10.** Commit and push hooks MUST NOT be bypassed (`--no-verify` or equivalent).

### Pull requests

- **R11.** Every change MUST reach `main` through a pull request; there are no direct pushes.
- **R12.** Pull requests MUST be merged per `merge_strategy`.
- **R13.** The pull request body MUST be the project's template, filled in: every section present,
  in the template's order, with a section that does not apply answered ("None.") and not deleted.
- **R14.** A pull request title MUST reference its story (`17-specs/spec-lifecycle.md`) when one
  exists; titles of type `chore`, `docs`, `ci`, `build` and `revert` are exempt.
- **R15.** A pull request MUST have `required_approvals` approving reviews, none by the author, and
  all required checks passing; neither requirement is bypassable, including by an administrator.
- **R16.** A pull request SHOULD stay under `pr_size_soft_limit`; a larger one MUST state in its body
  why it could not be split.
- **R17.** Paths in `code_owned_paths` MUST have code owners who are requested for review.

### Releases

- **R18.** Release tags MUST follow SemVer (`v<major>.<minor>.<patch>`) and MUST be applied on `main`.
- **R19.** The changelog MUST be generated from Conventional Commits; a hand-edited changelog MUST
  NOT be committed.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1–R3 | Review; branch protection and a stale-branch report on the hosting platform | ⬜ scheduled |
| R4 | Branch protection for everyone; an agent-side guard where the tool supports one | ⬜ scheduled |
| R5–R7 | `.githooks/commit-msg` and a title check in CI | ✅ automated |
| R8 | PR review | ❌ review-only |
| R9 | PR review; a trailer check in CI MAY be added | ❌ review-only |
| R10 | Server-side checks repeat every hook (`15-delivery/pipeline-and-gates.md` R3) | ◐ partial |
| R11, R12, R15 | Hosting-platform branch protection: require PR, merge strategy, approvals, no self-approval, no administrator bypass | ⬜ scheduled |
| R13 | CI job comparing the body's sections with the template | ⬜ scheduled |
| R14 | CI job checking the title for a story reference | ⬜ scheduled |
| R16 | CI warning at the size limit; not blocking | ⬜ scheduled |
| R17 | Code-owners file in the repository | ⬜ scheduled |
| R18, R19 | Release workflow (`15-delivery/deployments-and-rollback.md`) | ⬜ scheduled |

## AI guardrails

- Branch from `main`; never work on `main`. Never bypass a hook.
- Conventional Commits, imperative subject, 72 characters at most.
- Never mix a refactor with a behaviour change in one commit.
- Add the `Co-Authored-By` trailer to every commit you make; it does not relax review.
- Every change goes through a pull request, using the filled-in template and a story reference.
- Keep a pull request under the size limit or explain why not.
- Never approve your own pull request.

## References

- [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)
- [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html)
- `15-delivery/pipeline-and-gates.md` — the required checks R15 refers to
- `17-specs/spec-lifecycle.md` — stories referenced in titles
