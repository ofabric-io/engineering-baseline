---
name: triage-specs
description: Sweep every spec in docs/17-specs/ and report what needs a decision — draft specs ready to approve, approved stories that are startable now, approved stories blocked by their dependencies, and drift between specs and the tracker. Writes nothing. Use when the user says "triage the specs", "what's startable now", "sweep the backlog", "which specs are ready to approve", or after a batch of changes has merged.
---

# Triage the specs

A read-only sweep that reports **only what changed and what needs a decision**. It enumerates; it
does not nudge, approve, claim or edit. Approval is `.agents/skills/approve-spec/SKILL.md` and
claiming is `.agents/skills/start-story/SKILL.md`; both are declared in `docs/workflow.yaml`.
Lifecycle and startability rules: `docs/17-specs/spec-lifecycle.md`, `docs/17-specs/work-tracking.md`.

## Procedure

1. **Startable now.** Run `node scripts/tracker/cli.mjs list --startable` and copy its answer as
   is. Do not re-rank or filter. If it warns that the answer is offline (tracker unreachable),
   report that warning first and mark every tracker-dependent section as unverified. A spec with
   `status: not-applicable` is out of scope for the sweep.
2. **Read every spec's frontmatter and `## Open questions`** in `docs/17-specs/`.
3. **Draft specs ready to approve:** `status: draft`, no `[NEEDS CLARIFICATION: ...]` or
   unresolved placeholder left, and no blocking question without an answer. Flag; never approve.
4. **Approved but blocked:** `status: approved` stories whose `depends-on:` names a spec that is not
   `implemented`, or whose parent is not `approved`. Name the blocking id.
5. **Backfill needed:** approved specs with no `depends-on:` field. Do not infer one from prose.
6. **Drift** (skip with a note if the tracker is unreachable):
   - a spec with `tracker: null` that has no tracker item, or an item with no spec
   - spec `implemented`, tracker item not `complete`
   - spec has a `pr:` or `branch:` but the tracker item is still `to do`
   Use `node scripts/tracker/cli.mjs list --json` and `get <ID>`.
7. **Report one section each**, in this order, ids and paths only: Startable now · Blocked ·
   Draft specs ready to approve · Backfill needed · Drift.
8. End with one sentence offering the next step; take none.

## Constraints

- Never change a spec's `status:` or `depends-on:`.
- Never claim, assign or move a tracker item.
- Never judge whether an open question "really" blocks: report it and leave the call to the author.
- Never invent a dependency from prose.
