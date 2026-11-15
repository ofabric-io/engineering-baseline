---
name: new-adr
description: Write an Architecture Decision Record in docs/04-adr/, or supersede or amend an existing one. Use when a real trade-off has been decided and needs recording, when a ratified rule must change, when the bootstrap reaches an architecture or technology choice, or when the user says "write an ADR", "record this decision", "supersede ADR-N".
---

# Write an ADR

Standards say **how we work**. ADRs say **why we chose it**. One decision per file. The rules
for ADRs are in `docs/04-adr/README.md`; this skill is the procedure.

## Procedure

1. Read `docs/04-adr/README.md`: the index, the next free number, and the governance mode.
2. Check the index for an ADR on the same subject. If this changes it, go to **Superseding**
   or **Amending** below instead.
3. Copy `docs/04-adr/_template.md` to `docs/04-adr/ADR-NNN-kebab-title.md`.
4. Fill it in:
   - **Context** — the forces and what was known *at the time*, readable by someone who does
     not know today's situation.
   - **Decision** — present tense, stated as a rule.
   - **Alternatives considered** — at least one real alternative with a real reason. If there
     was none, this is a standard, not an ADR: stop and say so.
   - **Consequences** — positive, negative, and what becomes harder to change later.
   - **Compliance** — the script, CI gate, test, or deliberate review that verifies it.
5. Leave `status: proposed`. Only a human moves it to `accepted`; ask.
6. Add it to the index in `docs/04-adr/README.md`.
7. Link it from `## References` in every standard whose rules it decides.
8. Run `node scripts/check.mjs` and report the result.

## Amending (only in `pre-production` governance mode)

For an ADR that was incomplete or wrong from the start: edit it, and add an `## Amendments`
row with the date, what changed and why. Never rewrite Context. Ask the user before editing an
`accepted` ADR.

## Superseding

For a decision whose circumstances changed:

1. Write a new ADR with the next number; set `supersedes:` to the old number.
2. Its Context explains what changed since.
3. Set the old ADR to `status: superseded` and `superseded-by:` the new number; log it in the
   old ADR's `## Amendments`. Keep the old body intact.
