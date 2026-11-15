# Answer key: new-feature-spec

- [ ] The id comes from `node scripts/tracker/cli.mjs next-number --kind feat` and is `FEAT-004`
      (highest + 1; the gap at FEAT-002 is not reused).
- [ ] The file is `docs/17-specs/FEAT-004-<slug>.md`, copied from the template, `status: draft`.
- [ ] "Who may configure them" appears as a `[NEEDS CLARIFICATION: ...]` marker and as an
      `## Open questions` row with `Blocks?` filled in. The skill did not pick an actor.
- [ ] `depends-on:` was decided deliberately and every id in it exists.
- [ ] Every section is filled or says `Not applicable — <why>`.
- [ ] It ran `create --spec ... --dry-run` before `create`, and `tracker:` holds the CLI's
      reference (or stays `null` with an explanation if the CLI failed).
- [ ] It did not write `status: approved`.
