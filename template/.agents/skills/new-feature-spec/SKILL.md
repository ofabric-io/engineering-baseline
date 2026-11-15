---
name: new-feature-spec
description: Create a parent feature specification from docs/17-specs/feature-spec-template.md and register it in the tracker. Use when starting a new capability or epic — "spec out X", "write a feature spec for X", "new feature". Produces the vertical slice that constrains every standards layer, then hands over to the new-story skill.
---

# Write a feature spec

A feature spec cuts vertically through every standards layer. It is an **input** to the
hierarchy, never an override: an exception to a ratified standard is an ADR
(`.agents/skills/new-adr/SKILL.md`), not a paragraph in the spec. The stage is declared in
`docs/workflow.yaml` (`feature-spec`); the lifecycle rules are in `docs/17-specs/spec-lifecycle.md`
and the tracker rules in `docs/17-specs/work-tracking.md`.

## Inputs

The request in the requester's words. If it is a one-liner, the interview in step 4 fills it out.

## Procedure

1. **Read the standards this feature touches**, using the path-to-layer guidance in
   `docs/16-ai/autonomy-and-context.md`. Note any that are `not-started`: a spec cannot rely on a
   rule that does not exist yet.
2. **Allocate the number.** Never pick one by eye:

   ```sh
   node scripts/tracker/cli.mjs next-number --kind feat
   ```

   It answers highest + 1 across `docs/17-specs/` and the tracker. A gap in the sequence is a
   reservation; do not reuse it. If the command prints an **offline answer** warning (the tracker
   was unreachable, so only `docs/17-specs/` was read), tell the user in those words and proceed
   only after they confirm the number against the tracker.
3. **Establish the epic**, if the project's tracker groups features under one
   (`docs/17-specs/work-tracking.md`). Epics are filed by a human; if none fits, ask which to use.
4. **Copy `docs/17-specs/feature-spec-template.md`** to `docs/17-specs/FEAT-NNN-<slug>.md`.
5. **Interview for what the codebase cannot answer.** One numbered batch, each question with a
   recommended default. Pin down: the problem in the requester's words; the success metric;
   non-goals; actors and permissions; failure paths.
6. **Fill every section.** A section that does not apply says `Not applicable — <why>`; never
   leave it empty. Keep the user-interface sections the template carries, if the project has them.
7. **Write acceptance criteria** that map one-to-one to tests: numbered, independently testable.
8. **Record every gap** as `[NEEDS CLARIFICATION: question]` inline and as a row in
   `## Open questions` with `Blocks?` answered. Never guess: a guess in a spec becomes a rule in
   code.
9. **Set `depends-on:`** to the upstream `FEAT-NNN` ids this cannot start before, or `[]` after
   deciding there are none. Every id must name a spec that exists.
10. **Register it in the tracker**, dry run first:

    ```sh
    node scripts/tracker/cli.mjs create --spec docs/17-specs/FEAT-NNN-<slug>.md --dry-run
    node scripts/tracker/cli.mjs create --spec docs/17-specs/FEAT-NNN-<slug>.md
    ```

    The CLI writes the item's reference back into `tracker:`. If it fails (unreachable, no
    credentials), stop and say so; leave `tracker: null` rather than inventing a reference.
11. **Decompose** with `.agents/skills/new-story/SKILL.md` and fill the `## Stories` table.
12. Leave `status: draft`. Approval is `.agents/skills/approve-spec/SKILL.md`, a human decision.
13. Run `node scripts/check.mjs` and report the result.

## Constraints

- Never write `status: approved`.
- Never restate a standard's rule in the spec: cite the document and rule.
- Never create an epic, and never delete a tracker item (the CLI has no delete verb).
