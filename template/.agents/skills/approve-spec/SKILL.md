---
name: approve-spec
description: Walk one spec through the approval checklist and, only on the user's explicit yes, move it from draft to approved. Refuses while any unresolved placeholder or needs-clarification marker, placeholder field or blocking open question remains. Use when the user says "approve STORY-NNN", "approve the FEAT-NNN spec", "let's approve this", or picks a candidate that the triage-specs skill flagged.
---

# Approve one spec

The approval **decision** is human-owned (`docs/17-specs/spec-lifecycle.md`). This skill runs the
mechanical checklist around it, shows one diff, waits for a yes, then applies it. The stage is
declared in `docs/workflow.yaml` (`approve`).

## Inputs

One spec id (`FEAT-NNN` or `STORY-NNN`). If it matches no file or several, stop and ask.

## Procedure

1. **Resolve the spec** to a file in `docs/17-specs/`.
2. **Run the checklist.** Every item is pass or fail; one fail stops the run and is named:
   1. `status:` is `draft`. Anything else is a filing mistake: say which and stop.
   2. **No unresolved marker anywhere in the spec**: no `[[...]]` and no
      `[NEEDS CLARIFICATION: ...]` (ignore fenced code and comments). List each one found.
   3. Frontmatter has no placeholder: no `TBD`, no `YYYY-MM-DD`, `tier:` is a number (stories),
      `owner:` is a real name.
   4. For a story, the parent spec is `approved` or `implemented`.
   5. `depends-on:` is present, inline-list form, and every id names an existing spec.
   6. **No blocking open question remains.** A row in `## Open questions` with `Blocks?` = Yes and
      no recorded answer (an ADR, a decision-queue row, a merged change) blocks approval. Never
      resolve a question by choosing; ask the user.
   7. `## Acceptance criteria` is numbered and has real content.
   8. Every path under `## Standards to read` exists.
   9. `## Deviations` is `None.` (anything else belongs to a later stage).
3. **Present the plan and wait:** the spec path, each item's outcome, the exact edit
   (`status: draft` to `status: approved`) and what follows (startability is re-checked). Ask:
   **"Apply this approval? (yes / no)"**. Anything other than an unambiguous yes ends the skill
   with nothing changed. "Continue", "go" and "next" are not a yes.
4. **On yes**, make the one frontmatter edit. The tracker state does not change: only the spec's
   `status` is the gate (`docs/17-specs/work-tracking.md`). If the spec has no tracker item yet,
   say that `create` is owed (see the skill that wrote it); do not create it here. If the item's
   brief is stale, regenerate nothing by hand: say so.
5. **Report:** path, new status, whether it appears under `node scripts/tracker/cli.mjs list --startable`
   and, if not, the reason.

## Constraints

- Never approve without an explicit human yes in this conversation.
- Never approve while a marker or a blocking question remains, even if the user asks: report it.
- Never edit `depends-on:` or any other field to make a spec pass.
- Never approve more than one spec per invocation.
- Never move a tracker item here.
