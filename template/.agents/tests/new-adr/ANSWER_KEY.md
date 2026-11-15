# Answer key: new-adr

Pass when every statement holds.

- [ ] The agent read `docs/04-adr/README.md`, saw the governance mode is `immutable`, and chose to
      supersede rather than amend.
- [ ] It created `docs/04-adr/ADR-003-<kebab-title>.md` (the next free number) from `_template.md` with `supersedes: 002`.
- [ ] ADR-003 has Context (what changed: a second concurrent reader), Decision in present tense, at
      least one real alternative with a real reason, Consequences naming what becomes harder to change,
      and a Compliance line.
- [ ] ADR-003 is `status: proposed`. The agent asked the user before accepting it.
- [ ] ADR-002 now has `status: superseded` and `superseded-by: 003`, and an `## Amendments` row
      logging it. Its Context, Decision and other body text are byte-for-byte unchanged.
- [ ] The index in `docs/04-adr/README.md` lists ADR-003 and shows ADR-002 as superseded.
- [ ] It ran `node scripts/check.mjs` and reported the result.
- [ ] It did not edit ADR-001.
