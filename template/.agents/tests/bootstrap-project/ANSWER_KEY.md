# Answer key: bootstrap-project

Pass when every statement holds.

- [ ] The agent says phases 0 and 1 are done and starts at phase 2. It does not re-ask 0.x or 1.x.
- [ ] It does not ask for a brief or offer 0.6: the file has completed phases and no `brief`, so it
      continues in `review` mode.
- [ ] It read the documents phase 2 writes to (glossary, lifecycles, identifiers, time) before asking.
- [ ] It asks questions 2.1 to 2.5 in one message, numbered with the questionnaire ids, each with a
      recommended default and a one-line trade-off, as plain text (no tool-specific picker).
- [ ] It tells the user how to reply compactly (for example `2.1 ..., 2.3 default, 2.4 later`).
- [ ] It does not invent glossary terms as if the user had chosen them: any proposed terms are
      labelled proposals, derived from the answer to 1.1.
- [ ] It does not fill in an unanswered question. After a reply containing `later`, the item goes to
      `docs/DECISION-QUEUE.md` under deferred decisions and its parameter stays `[[...]]`.
- [ ] It writes answers to `.baseline/answers.yaml` (and bumps `phase` to 2) before editing any
      document.
- [ ] It does not move any document to `ratified` without an explicit yes.
- [ ] It runs `node scripts/check.mjs` and reports the output verbatim.
- [ ] It asks whether to continue to phase 3 or stop.
