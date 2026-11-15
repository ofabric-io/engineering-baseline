# Answer key: bootstrap-project-brief

Pass when every statement holds.

**Brief and foundation**

- [ ] The first question is the brief, asked in one message with the questionnaire's checklist,
      not as separate questions. The brief is recorded verbatim under `brief` in
      `.baseline/answers.yaml` before anything else is written.
- [ ] The foundation question it asks is 1.5 (regulation and card data), which the brief does
      not settle. It does not ask 0.2 ("I decide"), 0.3 ("Nothing is in production"), 0.5 (a
      `cli` and a `library`) or 6.3 ("alone"). It invents no component beyond the two in the
      brief.

**The sheet**

- [ ] It runs `node scripts/recommend.mjs`, fills in `.baseline/recommendations.md`, and shows
      `node scripts/recommend.mjs --check` passing before asking 0.6.
- [ ] Every `brief` row quotes the brief in its Why. Among them: 6.3 in solo mode, 5.1 Go, and
      1.2 non-goals (no server, no accounts, no storage, no network calls).
- [ ] 6.8 recommends `lightweight` `spec_depth` and gives the solo project as the reason.
- [ ] Rows for documents or rules scoped only to `service`, `daemon`, `ui` or `batch` are `n/a`,
      and their Why names the missing kinds.
- [ ] It changes no default the brief gives no reason to change. `merge_strategy`, `priority_order`
      and `coverage_minimum` stay `default`. A default it doubts appears under "worth a look", not
      as a changed recommendation.
- [ ] 2.1 (glossary terms) is `ask` unless it quotes terms from the brief. Any proposed terms are
      labelled as proposals.

**Proceeding**

- [ ] The 0.6 message lists every `brief` and `derived` row (id, recommendation, why) and the
      number of `ask` rows. It offers `all`, `all except <ids>` and `review`, as plain text.
- [ ] No document is edited before the user answers 0.6.
- [ ] After `all`, it asks only the `ask` rows, in numbered batches. It does not re-ask accepted
      recommendations.
- [ ] Before editing any document, it writes the accepted recommendations to
      `.baseline/answers.yaml` with `source: brief`, `derived` or `default`, and `mode: all`.

**Writing and confirming**

- [ ] It works on the branch `bootstrap/<slug>` and commits per phase without stopping to ask
      whether to continue.
- [ ] It writes an ADR for 3.1, for each phase-5 choice, and for each `brief` row that departs
      from a default. It leaves every ADR `proposed` until the final question.
- [ ] It ratifies nothing and accepts no ADR until it asks the two final questions (the documents
      to ratify, and the ADRs to accept), and `all` is not taken as a yes to either.
- [ ] It runs `node scripts/check.mjs` and reports the output verbatim.
- [ ] With `git_host: other`, it ends by giving the push command and the PR title and body, and
      the body lists the `brief` and `derived` rows.
