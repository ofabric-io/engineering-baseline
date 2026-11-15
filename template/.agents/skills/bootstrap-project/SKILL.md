---
name: bootstrap-project
description: Turn a freshly generated project into one with ratified standards and recorded decisions. It starts from a free-text brief, recommends an answer for every decision from it, lets the user accept them all at once, asks only what the brief cannot settle, and works on a branch that ends in a pull request. Use when the project has just been created from the engineering baseline, when docs/01-business/principles.md is not yet ratified, or when the user says "bootstrap the project", "set up the standards", "let's do the questionnaire", or "continue the bootstrap".
---

# Bootstrap a project

Drives `bootstrap/questionnaire.md` from start to finish. It can stop at any point and resume
later. Progress lives in `.baseline/answers.yaml` and `.baseline/recommendations.md`, not in the
conversation.

**Flow:**
1. Brief (0.1).
2. Foundation gaps (⚑).
3. Recommendation sheet.
4. How to proceed (0.6).
5. The `ask` rows.
6. Write the phases in order: 0 → 1 → 2 → 3 → 4P → 4 → 5 → 6.
7. Confirm ratification and ADRs.
8. Open a pull request.

## Before asking anything

1. Read `AGENTS.md`, `docs/README.md` and `bootstrap/questionnaire.md`, in particular its "How it
   runs" section and the checklist for the brief.
2. Read `.baseline/answers.yaml` and work out where to resume:
   - `brief` is null: start at the brief.
   - `mode` is null: resume at the sheet or at 0.6.
   - Otherwise resume at the first unwritten phase, after the next phase in `phase`.

   Say what is already done. Never re-ask an answered question unless the user asks. A file with
   phases done but no `brief` was started before the brief existed: continue it in `review` mode.
3. Read `.copier-answers.yml` for the installed packs, tracker, git host and CI. The owner (0.2)
   and the tracker (6.9) come from it, so recommend them as they are.
4. **Work on a branch**, never the default branch (`docs/14-git/git.md`). Create
   `docs/bootstrap` from a clean tree before the first edit; it follows the `<type>/<slug>` branch
   naming of `docs/14-git/git.md`. If the branch exists, resume on it.
5. Check the toolchain: `node --version` must be 20 or later. The baseline's scripts need it
   whatever the project's own stack is.

## 1. The brief (0.1)

Ask for the brief in one message: show the questionnaire's checklist and say that "don't know" is
a fine answer. If the project was generated with a description, show it as a starting point. Do
not ask the checklist items as separate questions. Record the reply verbatim under `brief` in
`.baseline/answers.yaml` before doing anything else.

## 2. Foundation gaps (⚑)

The ⚑ questions are 0.2, 0.3, 0.5, 1.5 and 6.3. Every recommendation depends on them.

- For each one the brief settles, note the answer and the words of the brief that settle it.
- Ask every one the brief does not settle, or settles ambiguously, in one numbered message, each
  with its default.
- Record the replies with `source: user`.

In 0.5, kinds come only from the fixed list `service`, `daemon`, `cli`, `library`, `ui`,
`batch`. Do not invent a component the brief does not describe.

## 3. The recommendation sheet

1. Run `node scripts/recommend.mjs --kinds <kinds from 0.5>` (for example `--kinds cli,library`).
   It writes `.baseline/recommendations.md` with one row per open decision, pre-filled with
   `default` or `ask`. It marks as `n/a` the parameters and open decisions of documents whose
   `applies-to` names none of those kinds, and the parameters whose every citing rule is scoped to
   absent kinds. That includes every unticked bullet under a
   document's `## Open decisions` (ids ending `/open-<n>`). Their default is `later`, so they are
   deferred to the queue unless the brief or another answer settles them. Never resolve one
   outside the sheet: the user must see every decision before choosing 0.6.
2. Read the documents behind the rows (their `## Parameters` tables and rules), every installed
   pack's `PACK.md` `amends:`, and every already-ratified higher-layer document. A choice that
   contradicts a ratified higher layer cannot be recommended.
3. Fill in each row:
   - **`brief`**: only when the brief *says* something that answers the row, calls for a value
     other than the default, or makes the default false. "No server" makes a default of
     "staging and production environments" false; it is not a matter of taste. **Why** quotes the
     brief in a few words. "It seems likely" is not a reason: with no words in the brief to
     quote, the row stays `default`.
   - **`derived`**: the value follows from another answer or recommendation (2.6 from 2.2, 0.4
     from 0.3, 3.3 from 0.5). **Why** names the id it follows from.
   - **`n/a`**: the components recorded in 0.5 make the row moot (a document's `applies-to`, a
     rule's scope tag, or a pack whose kinds are absent). **Why** names the missing kinds.
   - **`ask`**: there is no default and the brief does not answer it, or the brief is ambiguous or
     contradicts itself on it. **Why** says what is missing.
   - **`default`**: everything else. Leave the default even when you would personally choose
     otherwise. Instead, list it under "worth a look" in step 4.
4. **Consistency pass.** Read the filled sheet as a whole. Where two recommendations contradict
   each other, make the one that follows from the other `derived`, naming it. For example, no
   accounts means `session_lifetime` is `n/a`. Where you cannot tell which should win, make the
   row `ask`. Accepting `all` must never produce standards that contradict themselves or the
   brief.
5. Run `node scripts/recommend.mjs --check` and fix what it reports until it passes.

## 4. How to proceed (0.6)

Send one message containing:

- Counts per source, and the path `.baseline/recommendations.md` for the full sheet.
- Every `brief` and `derived` row as a compact numbered list: `id — recommendation — why`.
- The `n/a` rows grouped by the kinds that are missing.
- **Worth a look:** at most about 10 `default` rows that you suspect fit this project poorly,
  each with one line on why. These are rows the brief says nothing about. A default the brief
  contradicts is already a `brief` row, not one to look at.
- How many `ask` rows there are.

Then ask 0.6 as plain text:
- `all`: accept every recommendation, and answer only the `ask` rows (recommended);
- `all except <ids>`: those ids are asked too;
- `review`: go phase by phase with the recommendations pre-filled.

Record `mode` (and `except`). Do not write any document before the user has answered 0.6.

## 5. The `ask` rows

- Ask the `ask` rows, plus the `except` ids, in numbered batches of about 25, in phase order.
  Finish one batch before sending the next.
- Give each question its id, any partial recommendation, and the trade-off in one line, so the
  user can reply `1.1 …, 1.2 …, 2.1 later`.
- Ask as plain text, never through a tool-specific picker.
- Add a question the questionnaire missed if its answer would change what gets built.

**Never answer for the user.** Accepting `all` is the user's answer for every row they were
shown. A row the user never saw is unanswered; nor is an `ask` row the user skipped. Only an
explicit `later` defers: it goes to `docs/DECISION-QUEUE.md` under Deferred decisions and leaves
the parameter `[[...]]`.

**Record before writing.** Write every answer to `.baseline/answers.yaml` before editing a
document: answer, source, date, and `adr: null` until its ADR is written. Use one line per
entry, in the format the file's header gives. In `all` / `all-except` mode, write the accepted
recommendations at once, with their sources; an `n/a` row is `answer: n/a, source: n/a`. Then
run `node scripts/recommend.mjs` again: answered `ask` rows show as `user`. If an answer changes a row that others were derived
from, recompute those rows, show the changed ones, and get a yes before using them.

## 6. Write the phases

Go through the phases in order. In `review` mode, ask each phase's rows as a numbered batch first.
Show the recommendation as the proposed answer, then record the replies. In `all` / `all-except`
mode, write without stopping between phases. For each phase:

1. **Packs before core.** In phase 4P, and before writing a core document in phase 4, apply each
   installed pack's `PACK.md` `amends:` entry that names it. The comment after each entry says
   what to change, and the pack's "What it uses" section says how its rules and the core's
   combine.
2. **Fill in the answers** with `node scripts/apply-answers.mjs` (try `--dry-run` first). It writes
   every recorded answer into its `## Parameters` cell, ticks or queues each open decision, and
   adds a numbered row to the Deferred decisions table for every `later`. It lists what it cannot
   write itself (a headline answer that covers several parameters). Write those by hand. Never
   hand-edit `[[...]]` cells it can fill.
3. **Rules.** Then write or adjust `## Rules`, `## Enforcement` and `## AI guardrails`, following
   `.agents/skills/ratify-standard/SKILL.md`. A rule that applies only to some component kinds
   gets a scope tag; once the Components table is filled, `node scripts/queue.mjs` leaves rules
   scoped to absent kinds out of the debt table. Mark a document whose `applies-to` kinds are all
   absent as ready to be `not-applicable`, with a `reason:`.
4. **Enforcement debt.** Do not hand-copy it: run `node scripts/queue.mjs`, which regenerates the
   debt table in `docs/DECISION-QUEUE.md` from every `⬜` row.
5. **ADRs.** Write one for every answer with a real alternative, following
   `.agents/skills/new-adr/SKILL.md`: always for 3.1, 3.3, every phase-5 choice, and every `brief`
   row that departs from the default. Not for an accepted default. Leave each ADR `proposed`, and
   record its id in the answer's `adr` field once it exists.
6. **Open decisions.** A document may keep an unchecked `## Open decisions` bullet only if it ends
   `→ DECISION-QUEUE` and a matching row exists in the Deferred decisions table; `check.mjs`
   checks both. Never leave a `[NEEDS CLARIFICATION: …]` marker in a document that is to be
   ratified.
7. **Progress.** Update `phase` in `.baseline/answers.yaml` (a string: `"0"` … `"6"`, `"4P"`).
8. **Run `node scripts/check.mjs`** and fix what it reports. In `review` mode, report its output
   verbatim at the end of the phase. In the other modes, keep each phase's output for the final
   report.
9. **Commit the phase** on the branch (Conventional Commits, `docs/14-git/git.md`). In `review`
   mode, ask whether to continue to the next phase or stop. In the other modes, carry on.

## 7. Confirm ratification and ADRs

These two questions are asked in every mode, and neither can be inferred from `all`. In `review`
mode, ask them at the end of each phase. Otherwise, ask them once, after the last phase, in one
message:

1. "Ratify these documents?", listing them grouped by layer, with those that would become
   `not-applicable` and their reasons, and those not ready. A document with any `[[...]]` or
   `[NEEDS CLARIFICATION: …]` left is not ready. The one exception: a pointer "decided in
   `13-technology/`" counts as ready once its area is answered or deferred in phase 5. The user
   may answer per layer ("yes except 08").
2. "Accept ADRs N..M? (yes / no / name the ones to leave)".

Apply only what the user says yes to:
- `node scripts/ratify.mjs --owner <owner> <doc>…` sets status, owner, review date, the Ratify
  bullet and the status board;
- add `--not-applicable "<reason>"` for those documents;
- update each accepted ADR and the ADR index.

Then run `node scripts/check.mjs` again and commit.

## Phase-specific notes

- **Phase 0:** summarize the brief in two or three sentences under "What this project is" in
  `AGENTS.md`. 0.5 fills the Components table in `docs/03-architecture/system.md`
  (`| Component | Kind | Purpose |`). ADR-001 is accepted only in the step 7 question.
- **Phase 1:** 1.5 also covers payment-card scope. 1.10 covers how erasure meets records that
  must be kept (audit, ledger).
- **Phase 2:** propose glossary terms from the brief and 1.1. They are recommendations, not
  invented meanings, and 2.1 has no default, so it is asked unless the brief lists the terms.
  - The glossary's "Terms the baseline itself uses" note lets the project declare a collision and
    choose its own word.
  - If the `multi-tenant` pack is installed, the isolation-unit name becomes a glossary term, and
    the generic alternatives become forbidden words in `.baseline/forbidden-terms.txt`.
  - Do **not** forbid words the baseline's own files use. List such an exception in
    `.baseline/forbidden-allow.txt` (one term per line), never by editing a baseline-owned file.
- **Phase 5:** a technology choice is an ADR plus `docs/13-technology/<area>.md`. A technology the
  brief names is a `brief` row. Rules in higher layers that say "decided in `13-technology/`"
  now link to it. With the `user-interface` pack only, write `.baseline/ui.json` (5.9) after the
  frontend decision. Close the phase with `13-technology/README.md` (5.10).
- **Phase 6:**
  - **6.3 and 6.8:** a solo project uses the solo mode of `required_approvals`, and `lightweight`
    `spec_depth` is the usual recommendation for it. Say so in the row's Why when the brief
    describes a solo project.
  - **6.7:** ask which AI vendors the team uses unless the brief says. Ask the user for current
    model names; never assume them.
  - **6.13, 6.14 and 6.15:** accept their documents as a whole unless a row changes them.

## Finishing: pull request

When the last phase is done (or the user stops early), push the branch and open a pull request
with `.agents/skills/open-pr/SKILL.md`. Read the host from `git_host` in `.copier-answers.yml`:

- `github` or `gitlab`: use `node scripts/pr/open-pr.mjs`.
- `other`: explain that the branch is ready, and give the exact push command plus the title and
  body the user should paste into their host.

The pull request body lists the `brief` and `derived` rows, so a reviewer sees what was inferred.
It also states that the bootstrap exceeds the soft size limit of `docs/14-git/git.md` because it
writes every standard at once, and that its commits are one per phase for review. Never push to or
commit on the default branch, and never merge.

## Done

Report:
- the decisions, counted by source;
- the documents ratified or set `not-applicable`;
- the ADRs written and accepted;
- the decisions deferred;
- the output of `node scripts/check.mjs`;
- the pull request URL, or the manual steps.

If the user stopped early, list exactly what remains.
