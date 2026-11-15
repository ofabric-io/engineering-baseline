---
layer: 15-delivery
status: proposed
owner: TBD
last-reviewed: never
---

# Product Documentation

## Purpose

The documentation a product ships for the people who use and run it: user guides, operator guides,
and API, command-line or configuration reference. It is distinct from this `docs/` tree, which
holds the project's engineering standards. The tooling that builds and hosts the documentation is a
technology choice recorded in `13-technology/`.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `documentation_audiences` | [[documentation_audiences]] | user, operator, reference | an audience dropped is a support burden accepted; an audience added is more to keep accurate |
| `reference_source` | [[reference_source]] | reference is generated from the machine-readable definition of each surface (interface schema, command definitions, configuration schema) | hand-written reference reads better and drifts |
| `documentation_languages` | [[documentation_languages]] | one language | each added language multiplies review and update cost |
| `documentation_review_cadence` | [[documentation_review_cadence]] | every page reviewed at least once per release cycle by its owner | rarer review lets pages go stale |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Where is the documentation published?
- [ ] Who owns each audience's pages?

## Rules

### Content

- **R1.** The project MUST maintain documentation for each audience in `documentation_audiences`.
  User documentation is organised by task. Operator documentation covers installing, configuring,
  upgrading, backing up and restoring, and diagnosing the product, and links to the incident
  runbook (`07-observability/incident-management.md`). Reference documentation is exhaustive.
- **R2.** Reference documentation MUST cover every public surface listed in `15-delivery/releases-and-distribution.md` `public_surfaces`, including defaults, errors or exit codes, and deprecations. _(applies to: service, daemon, cli, library)_
- **R3.** Reference MUST come from `reference_source`; text copied by hand from the source of truth
  MUST NOT be committed.
- **R4.** Documentation MUST NOT contain secrets, real customer data or internal-only details
  (`06-security/sensitive-data.md`).

### Change discipline

- **R5.** A change that alters behaviour a document describes MUST update that document in the same
  pull request; a pull request that adds a public surface MUST add its documentation.
- **R6.** Each page MUST have an owner, and MUST be reviewed at `documentation_review_cadence`.
- **R7.** Documentation MUST be published per version of the product that is supported
  (`15-delivery/releases-and-distribution.md` R13), and a page MUST state the version it describes.
- **R8.** Documentation source MUST live in the repository as reviewable text and follow the same
  review as code (`14-git/git.md`).

### Accuracy gates

- **R9.** The pipeline MUST build the documentation and fail on a broken internal link, a broken
  external link in a scheduled run, or a build error.
- **R10.** Every code or command example MUST be executed or compiled in CI, so that an example that
  no longer works fails the build.
- **R11.** Where the reference is generated, CI MUST fail when regenerating it changes the committed
  output, and when a public surface exists with no reference entry.
- **R12.** A removed or renamed public surface MUST be removed or renamed in the documentation in the
  same change, and the release notes MUST say so (`15-delivery/releases-and-distribution.md` R9).

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | Review against the audiences list | ❌ review-only |
| R2, R11 | Reference-coverage and drift check in CI | ⬜ scheduled |
| R3 | Reference built by a generator; review rejects pasted copies | ◐ partial |
| R4 | Secret scan over the documentation tree (`scripts/checks/secrets.mjs`) | ◐ partial |
| R5, R12 | PR review; the pull request template asks whether documentation changed | ◐ partial |
| R6 | Owners file; a scheduled report of pages past their review date | ⬜ scheduled |
| R7 | Documentation build produces one site per supported version | ⬜ scheduled |
| R8 | Repository layout | ❌ review-only |
| R9, R10 | Documentation build and example-run jobs in CI | ⬜ scheduled |

## AI guardrails

- A behaviour change without its documentation change is incomplete. Update both in one pull request.
- Never hand-edit generated reference; change the source and regenerate.
- Never leave an example you did not run.
- Never put a secret, a real customer record or an internal address in documentation.

## References

- `15-delivery/releases-and-distribution.md` — public surfaces, supported versions, release notes
- `07-observability/incident-management.md` — incident runbook linked from operator documentation
- `06-security/sensitive-data.md` — what must not appear in documentation
- `15-delivery/pipeline-and-gates.md` — where the accuracy gates run
