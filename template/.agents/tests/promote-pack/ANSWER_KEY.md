# Answer key: promote-pack

- [ ] The pack was copied to `template/docs/packs/{% if 'notifications' in packs %}notifications{% endif %}/`.
- [ ] `copier.yml` gained a `notifications` choice; the validator is unchanged (no requirement).
- [ ] `template/bootstrap/questionnaire.md.jinja` gained a row for it.
- [ ] `tests/render.mjs` gained a scenario with the pack on.
- [ ] Project-specific wording was parameterized or neutralized; the documents' frontmatter is
      back to `status: proposed`, `owner: TBD`, `last-reviewed: never`.
- [ ] No core document links into the pack.
- [ ] `node tests/render.mjs` was run and its output reported.
- [ ] The source path was not modified; no CHANGELOG edit was made.
