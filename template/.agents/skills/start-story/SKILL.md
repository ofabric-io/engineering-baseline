---
name: start-story
description: Claim a story before implementing it — check it is startable, assign it to the current user, move it to in-progress, then cut the branch. Refuses to start a story that is not startable. Use whenever work on a STORY-NNN begins, or when the user says "start STORY-014", "pick up the next story", "let's do this task".
---

# Start a story

Claiming is the first act of implementation, not paperwork after it
(`docs/17-specs/work-tracking.md`). Everything below happens **before the first edit** and
**before the branch exists**. If any step stops you, stop the whole thing: a half-claim reads as
coverage that does not exist. The stage is declared in `docs/workflow.yaml` (`start`).

## Inputs

A story id, or a request to "pick up the next story". For the latter, run
`node scripts/tracker/cli.mjs list --startable`, pick the first, and **say which you picked**
before going on. If the command warns that its answer is offline (tracker unreachable), say so
and proceed only with the user's confirmation; the claim in step 2 still needs the tracker.

## Procedure

1. **Read the spec and check it is startable** (`docs/17-specs/spec-lifecycle.md`):
   `status: approved`; every `depends-on:` id is `implemented`; the parent is `approved` or
   `implemented`; no blocking open question remains. `list --startable` applies the first three.
   If one fails, name which and stop. Never move the spec to `approved` yourself.
2. **Claim it:**

   ```sh
   node scripts/tracker/cli.mjs claim <STORY-NNN>
   ```

   It assigns the current user and moves the item to `in progress`. It refuses to take over an
   item assigned to someone else, and refuses an unassigned item already `in progress`. Each refusal is a stop-and-ask; do not work around it.
3. **Only now cut the branch**, named per `docs/14-git/git.md`, off a clean tree, never on a
   protected branch. Record the name in the spec's `branch:` frontmatter only if the user asks.
4. **If the tracker is unreachable or unauthenticated, stop and say so.** Do not start and promise
   to claim later.
5. **Hand over:** report the item reference, assignee, status and branch; then follow `AGENTS.md`,
   the spec, and the documents under its `## Standards to read`.

## When the work ends

The item stays `in progress` while the branch and then the pull request
(`.agents/skills/open-pr/SKILL.md`) are open, and moves to `complete` only after merge. If work
stops for any other reason, move it back
(`node scripts/tracker/cli.mjs set-status <ID> todo`) and say so.

## Constraints

- Never assign anyone but the current user; never unassign anyone.
- Never create the item, the feature or the epic here.
- Never write rule text or acceptance criteria into the tracker.
- No delete verb exists; do not look for one.
