---
name: bootstrap-project
description: Turn a freshly generated project into one with ratified standards and recorded decisions, by running the bootstrap questionnaire phase by phase on a branch and finishing with a pull request. Use when the project has just been created from the engineering baseline, when docs/01-business/principles.md is not yet ratified, or when the user says "bootstrap the project", "set up the standards", "let's do the questionnaire", or "continue the bootstrap".
---

# Bootstrap a project

Drives `bootstrap/questionnaire.md` from start to finish. It can stop after any phase and
resume later; progress lives in `.baseline/answers.yaml`, not in the conversation.

**Phase order:** 0 → 1 → 2 → 3 → 4P (packs) → 4 → 5 → 6. Packs run before phase 4 because a
pack's `PACK.md` `amends:` names core documents it changes.

## Before asking anything

1. Read `AGENTS.md`, `docs/README.md` and `bootstrap/questionnaire.md`.
2. Read `.baseline/answers.yaml`. `phase: null` means not started; otherwise it is a string
   naming the last completed phase. If it is set, this is a **resume**: say which phases are
   done, and start at the next one in the order above. Never re-ask an answered question unless
   the user asks. The file's header documents the answer-id scheme.
3. Read `.copier-answers.yml` for the installed packs, tracker, git host and CI. The owner and
   the tracker are already known from it: show them in 0.2 and 6.9 and only ask to confirm.
4. **Work on a branch**, never the default branch (`docs/14-git/git.md`): create
   `bootstrap/<project-slug>` (the slug is in `.copier-answers.yml`) before the first edit, from
   a clean tree. If a branch with that name exists, resume on it.
5. Check the toolchain: `node --version` must be 20 or later. The baseline's scripts need it
   whatever the project's own stack is.

## Each phase

1. **Read the documents the phase writes to** (the "Writes to" column), including their
   `## Parameters` tables, and every already-ratified document in a higher layer. A choice that
   contradicts a ratified higher layer is not available — say so instead of offering it.
   Run `node scripts/params.mjs <path>` for those documents to get every open parameter with its
   default; the questionnaire rows are only the headline ones. Skip a question, and set a
   document `status: not-applicable` with a `reason:`, only when the component kinds recorded in
   0.5 make it moot (frontmatter `applies-to:`); say so and ask for confirmation.
2. **Phase 4P first, then 4.** Before offering a core document, apply each installed pack's
   `PACK.md` `amends:` entry that names it, so the document is offered in its final shape.
3. **Ask in numbered batches.** Headline questions first; then the remaining open parameters as
   a bulk list ("accept all defaults, or name the ones to change"). Number with the
   questionnaire's ids, each with the recommended default and its trade-off in one line, so the
   user can reply `1.1 …, 1.2 …, 1.3 default, 1.4 later`. Ask as plain text, not through a
   tool-specific picker. If the phase has more than about 25 items, split it into numbered
   batches of that size and finish one before sending the next. Add a question the
   questionnaire missed if its answer would change what gets built.
4. **Never answer for the user.** An unanswered question is not a default. But an answer equal
   to the default is an answer: record `default` and fill the parameter. Only an explicit
   `later` goes to `docs/DECISION-QUEUE.md` under Deferred decisions and leaves the parameter
   `[[...]]`.
5. **Record answers immediately** in `.baseline/answers.yaml` (answer, date, ADR id) before
   writing any document, so an interrupted session loses nothing. Use the id scheme in the
   file's header.
6. **Write the documents.** Fill the `## Parameters` answers; then write or adjust `## Rules`,
   `## Enforcement` and `## AI guardrails` following `.agents/skills/ratify-standard/SKILL.md`.
   Do not hand-copy enforcement debt: after writing, run `node scripts/queue.mjs`, which
   regenerates the debt table in `docs/DECISION-QUEUE.md` from every `⬜` row.
7. **Write an ADR for every answer with a real alternative** — always for 3.1, 3.3 and every
   phase-5 choice — following `.agents/skills/new-adr/SKILL.md`. Not for an obvious default.
8. **Open decisions.** A ratified document may keep an unchecked `## Open decisions` bullet only
   if it ends `→ DECISION-QUEUE` and a matching row exists in the Deferred decisions table.
   Otherwise resolve it or move it to the queue with the user's agreement. Never leave a
   `[NEEDS CLARIFICATION: …]` marker in a document you ratify.
9. **Ratify only with a yes.** Show which documents are ready to move to `ratified` (or
   `not-applicable`) and ask. A document with any `[[...]]` or `[NEEDS CLARIFICATION: …]` left
   is not ready, except that a pointer "decided in `13-technology/`" is ready once its area is
   answered or deferred in phase 5.
10. **Accept ADRs explicitly.** At the end of every phase, list the ADRs written in it that are
    still `proposed` and ask: "Accept ADRs N..M? (yes / no / name the ones to leave)". Move only
    the named ones to `accepted`, and update the ADR index. Never accept on an implied yes.
11. **Update** `.baseline/answers.yaml` `phase` (a string: `"0"` … `"6"`, `"4P"`) and the status
    board in `docs/DECISION-QUEUE.md`.
12. **Run `node scripts/check.mjs`** and report its output verbatim. Fix what it reports before
    moving on.
13. **Commit the phase on the branch** (Conventional Commits, `docs/14-git/git.md`), then ask
    whether to continue to the next phase or stop here.

## Phase-specific notes

- **Phase 0:** write the answer to 0.1 into `AGENTS.md` "What this project is". 0.5 fills the
  Components table in `docs/03-architecture/system.md` (`| Component | Kind | Purpose |`); kinds
  come from the fixed list `service`, `daemon`, `cli`, `library`, `ui`, `batch`. Accept ADR-001
  only when the user confirms it, in the end-of-phase ADR step.
- **Phase 1:** question 1.5 also asks about payment-card scope; 1.10 asks how erasure meets
  records that must be kept (audit, ledger). Record both before ratifying compliance and
  sensitive-data documents.
- **Phase 2:** seed the glossary from the answers to 1.1; propose terms, do not invent meanings.
  The glossary's "Terms the baseline itself uses" note lets the project declare a collision and
  choose its own word. If the `multi-tenant` pack is installed, its isolation-unit name becomes
  a glossary term and the generic alternatives become forbidden words: write them to
  `.baseline/forbidden-terms.txt`. Do **not** forbid words the baseline's own files use;
  list such an exception in `.baseline/forbidden-allow.txt` (one term per line), and never
  by editing a baseline-owned file.
- **Phase 4P:** apply `amends:` first (step 2 above), then ask each pack's row. Skip a pack whose
  component kinds are absent.
- **Phase 4:** offer each document as a whole — accept, change named parameters, or later. Do
  not walk through every rule unless the user asks. Use the baseline's default for
  `environments` text ("local development, staging, production"). Do not ask 4.9: the
  `13-technology/README.md` question is 5.10.
- **Phase 5:** a technology choice is an ADR plus `docs/13-technology/<area>.md`. Rules in
  higher layers that say "decided in `13-technology/`" now link to it. Ask the `.baseline/ui.json`
  question (5.9) after the frontend decision. Close the phase with `13-technology/README.md`
  (5.10) once every area is answered or deferred.
- **Phase 6, question 6.7:** ask which AI vendors the team uses, then map each to the strong /
  standard / fast tiers in `docs/16-ai/model-routing.md`. Ask the user for current model names;
  do not assume them. 6.12 uses the `environments` default of D6 (local development, staging,
  production). 6.13 and 6.14 accept `16-ai/operating-procedure.md` and `16-ai/prohibitions.md`
  as a whole unless the user names a change.

## Finishing: pull request

When the last phase is done (or the user stops early), push the branch and open a pull request
with `.agents/skills/open-pr/SKILL.md`, reading the host from `git_host` in
`.copier-answers.yml`: `github` or `gitlab` uses `node scripts/pr/open-pr.mjs`; for `other`,
explain that the branch is ready, give the exact push command and the title and body the user
should paste into their host. Never push to or commit on the default branch, and never merge.

## Done

Report: phases completed, documents ratified or set not-applicable, ADRs written and accepted,
decisions deferred, the output of `node scripts/check.mjs`, and the pull request URL (or the
manual steps). If the user stopped early, list exactly what remains.
