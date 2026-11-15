# Architecture Decision Records

Standards say **how we work**. ADRs say **why we chose it**. One decision per file.

## Rules

- **R1.** A decision with a plausible alternative gets an ADR. An obvious one does not.
- **R2.** Files are `ADR-NNN-kebab-title.md`. Numbers are sequential and never reused, not even
  for a rejected ADR.
- **R3.** Every ADR starts `proposed`. Only a human moves it to `accepted` or `rejected`.
- **R4.** A `ratified` standard changes only through an ADR, linked from the standard's
  `## References`.
- **R5.** A Context section is never rewritten. It records what was known at the time.
- **R6.** Governance mode decides whether an `accepted` ADR may be amended in place:

  | Mode | Accepted ADR may be… | Ends |
  | --- | --- | --- |
  | `pre-production` | amended in place, with an `## Amendments` row (date, change, why) | at the first production deployment, recorded by an ADR |
  | `immutable` | only superseded by a new ADR | never |

  This project's mode: **[[adr_governance_mode]]** (set by the bootstrap; default
  `pre-production`).
- **R7.** To supersede: write a new ADR whose `supersedes:` names the old number and whose
  Context explains what changed; set the old ADR to `status: superseded` with `superseded-by:`
  and log it in its `## Amendments`. Keep the old body intact.

Use the `new-adr` skill (`.agents/skills/new-adr/SKILL.md`) to write one.

## Index

| ADR | Title | Status | Date |
| --- | --- | --- | --- |
| [ADR-001](ADR-001-adopt-engineering-baseline.md) | Adopt the engineering baseline | proposed | — |
