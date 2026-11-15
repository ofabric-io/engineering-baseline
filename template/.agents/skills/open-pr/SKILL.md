---
name: open-pr
description: Open a pull request that conforms to docs/14-git/git.md on the first try — template-shaped body, story-referencing title, clean tree — instead of finding out from a failed check. Use whenever work on a branch is ready for review, or the user says "open a PR", "create the pull request", "let's ship this".
---

# Open a pull request

`scripts/pr/open-pr.mjs` does the opening and does its own refusing: protected branch, dirty
tree, title without the story id, body missing a template section. The body rules are in
`docs/14-git/git.md`; the host decides the template (`.github/pull_request_template.md` or
`.gitlab/merge_request_templates/Default.md`). The stage is declared in `docs/workflow.yaml`
(`open-pr`).

## Procedure

1. **All work must already be committed.** This skill commits nothing. If the tree is dirty,
   stop and say so.
2. **Draft the body as a file outside the repository** (a scratch directory), starting from the
   host's template copied verbatim. Answer every section from the actual work; answer a section
   that does not apply ("None.") instead of deleting it:
   - **What and why**, with the `Story:` line.
   - **Autonomy tier**, per `docs/16-ai/autonomy-and-context.md`, ticked rather than guessed.
   - **Plan**: the approved plan's link for tier 3-4; otherwise "Not applicable".
   - **Acceptance criteria**, copied from the story spec, each ticked only after verifying it.
   - **Verification**: the commands you ran in this session and their real output.
   - **Deviations** and **Assumptions** (made where a standard was silent). "None." is valid;
     silence is not.
   - **Checklist**, answered honestly.
3. **Title:** `<STORY-NNN>: <summary>` when a story exists; otherwise a Conventional Commits
   summary. Never invent a story id.
4. **Run the gate** (dry run first if unsure):

   ```sh
   node scripts/pr/open-pr.mjs --title "<title>" --body-file <path> [--story STORY-NNN] [--draft]
   ```

   Do not also create the request by hand, and do not bypass the body check.
5. **A refusal is the script working.** Fix what it names; do not edit the script or retry with
   different flags first.
6. **Report the URL.** The tracker item stays `in progress` until merge; record the pull request
   in the spec's `pr:` frontmatter (a change to the spec on the same branch). Never mark the item
   `complete` before merge.
7. **Watch the checks** if the host CLI can report them. Fix mechanical failures (a formatter, a
   generator); report judgement failures (a failing test, a security finding) and ask.

## Constraints

- Branches and titles follow `docs/14-git/git.md`; never open the request from the default branch.
- Never merge the request; review rules are in `docs/14-git/git.md`.
- Never skip, disable or weaken a failing check to reach green.
- Never write body content the template has no section for.
- Never commit to "finish" the branch.
