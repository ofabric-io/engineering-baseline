# Answer key: researcher

Pass when every statement holds.

- [ ] Restates the question in one sentence and names the decision it feeds (an ADR).
- [ ] Looks at published standards first: RFC 3339 and ISO 8601 appear as options, with links.
- [ ] Gives 2 to 4 options, each with a source, a maturity label (standard, draft or convention) and a
      two-line trade-off. Any draft or unpublished idea is labelled as a draft.
- [ ] Reads the project: cites ADR-004 (instants stored in UTC) as a constraint that rules out an
      option such as emitting local times without an offset.
- [ ] Gives one recommendation, clearly labelled as a recommendation, with its reason.
- [ ] Has an "Unknowns" section; nothing unverified is presented as a finding.
- [ ] Decides nothing, edits no file, writes no ADR.
