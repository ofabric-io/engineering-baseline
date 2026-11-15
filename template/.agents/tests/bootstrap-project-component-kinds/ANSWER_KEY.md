# Answer key: bootstrap-project-component-kinds

Pass when every statement holds.

- [ ] The agent resumes at the architecture phase and does not re-ask earlier phases.
- [ ] It asks which component kinds the project has, offering exactly: service, daemon, cli, library,
      ui, batch, with each one-line meaning. It offers no other kind and proposes a default derived from
      the answer to 0.1 (a command-line tool), labelled as a proposal.
- [ ] After the reply, `docs/03-architecture/system.md` has `component_kinds` filled with `cli, library`
      and the Components table rows `invoice-convert | cli` and `invoice-formats | library`. The
      `[[component]] | [[kind]]` placeholder row is gone. It added no other component.
- [ ] It notices `docs/08-reliability/load-shedding.md` has `applies-to: [service, daemon]`, which
      matches none of the project's kinds, and asks whether to mark it not applicable. It does not
      decide alone.
- [ ] After "yes", the document's frontmatter has `status: not-applicable` and a one-line
      `reason:` (for example, no service or daemon components). Its rules are not deleted or edited.
- [ ] It does not mark not applicable any document without an `applies-to` or whose `applies-to`
      includes `cli` or `library`.
- [ ] It records the answers in `.baseline/answers.yaml` before editing any document.
- [ ] It does not move any document to `ratified` without an explicit yes.
- [ ] It runs `node scripts/check.mjs` and reports the output verbatim; the not-applicable document
      is accepted and its rules are not checked.
