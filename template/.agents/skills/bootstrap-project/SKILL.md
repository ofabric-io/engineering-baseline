---
name: bootstrap-project
description: Turn a freshly generated project into one with ratified standards and recorded decisions, by running the bootstrap questionnaire phase by phase. Use when the project has just been created from the engineering baseline, when docs/01-business/principles.md is not yet ratified, or when the user says "bootstrap the project", "set up the standards", "let's do the questionnaire", or "continue the bootstrap".
---

# Bootstrap a project

Drives `bootstrap/questionnaire.md` from start to finish. It can stop after any phase and
resume later; progress lives in `.baseline/answers.yaml`, not in the conversation.

## Before asking anything

1. Read `AGENTS.md`, `docs/README.md` and `bootstrap/questionnaire.md`.
2. Read `.baseline/answers.yaml`. If `phase` is above 0, this is a **resume**: say which phases
   are done, and start at the next one. Never re-ask an answered question unless the user asks.
3. Read `.copier-answers.yml` for the installed packs, AI tools, tracker and CI.

## Each phase

1. **Read the documents the phase writes to** (the "Writes to" column), including their
   `## Parameters` tables, and every already-ratified document in a higher layer. A choice that
   contradicts a ratified higher layer is not available — say so instead of offering it.
2. **Ask the whole phase in one message.** Numbered with the questionnaire's ids, each with the
   recommended default and its trade-off in one line, so the user can reply
   `1.1 …, 1.2 …, 1.3 default, 1.4 later`. Ask as plain text, not through a tool-specific picker.
   Add a question the questionnaire missed if its answer would change what gets built.
3. **Never answer for the user.** An unanswered question is not a default. `later` goes to
   `docs/DECISION-QUEUE.md` under Deferred decisions, and the parameter stays `[[...]]`.
4. **Record answers immediately** in `.baseline/answers.yaml` (answer, date, ADR id) before
   writing any document, so an interrupted session loses nothing.
5. **Write the documents.** Fill the `## Parameters` answers; then write or adjust `## Rules`,
   `## Enforcement` and `## AI guardrails` following `.agents/skills/ratify-standard/SKILL.md`
   steps 4–6.
6. **Write an ADR for every answer with a real alternative** — always for 3.1, 3.3 and every
   phase-5 choice — following `.agents/skills/new-adr/SKILL.md`. Not for an obvious default.
7. **Ratify only with a yes.** Show which documents are ready to move to `ratified` and ask.
   A document with any `[[...]]` or `[NEEDS CLARIFICATION: …]` left is not ready.
8. **Update** `.baseline/answers.yaml` `phase`, the status board in `docs/DECISION-QUEUE.md`,
   and the ADR index.
9. **Run `node scripts/check.mjs`** and report its output verbatim. Fix what it reports before
   moving on.
10. Ask whether to continue to the next phase or stop here.

## Phase-specific notes

- **Phase 0:** write the answer to 0.1 into `AGENTS.md` "What this project is". Accept ADR-001
  only when the user confirms it.
- **Phase 2:** seed the glossary from the answers to 1.1; propose terms, do not invent meanings.
  If the `multi-tenant` pack is installed, its isolation-unit name becomes a glossary term and
  the generic alternatives (tenant, account, organization…) become forbidden words.
- **Phase 4:** offer each document as a whole — accept, change named parameters, or later. Do
  not walk through every rule unless the user asks.
- **Phase 5:** a technology choice is an ADR plus `docs/13-technology/<area>.md`. Rules in
  higher layers that say "decided in 13-technology/" now link to it.
- **Phase 6, question 6.7:** ask which AI vendors the team uses, then map each to the strong /
  standard / fast tiers in `docs/16-ai/model-routing.md`. Ask the user for current model names;
  do not assume them.

## Done

Report: phases completed, documents ratified, ADRs written, decisions deferred, and the output
of `node scripts/check.mjs`. If the user stopped early, list exactly what remains.
