---
name: new-story
description: Create a child story specification from docs/17-specs/story-spec-template.md and register it in the tracker. Use when breaking a feature spec into implementable units, or when the user says "next story", "break this down", "story spec". Produces one implementable slice with the standards an agent must read and the commands that must pass.
---

# Write a story spec

A story is one implementable slice of a parent feature: small enough to review in one sitting,
complete enough to ship on its own. The stage is declared in `docs/workflow.yaml` (`story`).
Lifecycle rules: `docs/17-specs/spec-lifecycle.md`; tracker rules: `docs/17-specs/work-tracking.md`.

## Inputs

A parent feature spec (`docs/17-specs/FEAT-NNN-*.md`). A story with no parent is a smell: either the
feature spec is missing or this is not a story.

## Procedure

1. **Read the parent spec** in full.
2. **Allocate the number:** `node scripts/tracker/cli.mjs next-number --kind story`. Never choose
   one by eye; gaps are reservations. If the command prints an **offline answer** warning (the
   tracker was unreachable, so only `docs/17-specs/` was read), tell the user in those words and
   proceed only after they confirm the number against the tracker.
3. **Copy `docs/17-specs/story-spec-template.md`** to `docs/17-specs/STORY-NNN-<slug>.md` and set
   `parent:`.
4. **Write `## Parent context`**: one paragraph, so an agent that loads only this file is not
   working blind.
5. **Scope it precisely.** Name the parts and files expected to change and say what is explicitly
   out. Vague scope is the cause of unrelated changes (`docs/16-ai/prohibitions.md`).
6. **List `## Standards to read`** as real paths under `docs/`, derived from the path-to-layer
   guidance in `docs/16-ai/autonomy-and-context.md`. Flag any that is `not-started`; that standard is
   settled first.
7. **Set the autonomy tier** in the frontmatter per `docs/16-ai/autonomy-and-context.md`, and tick it
   in the body.
8. **Set `depends-on:`** to the upstream story or feature ids this cannot start before, or `[]`
   after deciding there are none. Ask when it is not obvious. Every id must name an existing spec.
9. **Write acceptance criteria**, numbered, each independently verifiable.
10. **Write `## Verification`** as literal commands that must pass, plus any manual check.
11. **Record gaps** as `[NEEDS CLARIFICATION: question]` and as rows in `## Open questions`.
12. **Leave `## Deviations` as `None.`**; the implementer fills it.
13. **Update the parent's `## Stories` table.**
14. **Register it in the tracker**, dry run first:

    ```sh
    node scripts/tracker/cli.mjs create --spec docs/17-specs/STORY-NNN-<slug>.md --dry-run
    node scripts/tracker/cli.mjs create --spec docs/17-specs/STORY-NNN-<slug>.md
    ```

    The item body is generated from the spec and holds pointers only, never rule text or acceptance
    criteria. If the CLI fails, stop and say so; leave `tracker: null`.
15. **Leave the item unassigned.** Creating a story is not starting it; claiming belongs to
    `.agents/skills/start-story/SKILL.md`.
16. Leave `status: draft`; run `node scripts/check.mjs`.

## Sizing

One story, one reviewable change. If the diff will not fit in one sitting, split it. A story that
cannot be verified on its own is half of one.

## Constraints

- Never write `status: approved`.
- Never copy a rule or an acceptance criterion into the tracker item.
