# Authoring a pack

A pack is an optional set of standards for a capability only some projects have.

## Layout

```text
template/docs/packs/{% if '<name>' in packs %}<name>{% endif %}/
  PACK.md          frontmatter: pack, version, requires, amends, documents
  <document>.md    standards documents, same shape as docs/_template.md
```

The folder name is a Copier expression, so the pack exists only in projects that chose it.
Add the pack to the `packs` choices in `copier.yml`, add its `requires` to the `packs`
validator there, and add its row to the "Phase 4P" table in
`template/bootstrap/questionnaire.md.jinja`.

## Rules

- **Depends on the core, never the reverse.** No core document links into a pack;
  `scripts/check.mjs` fails if one does.
- **Parameterized.** Every choice a project could reasonably make differently is a row in the
  document's `## Parameters` table, with a default and a one-line trade-off.
- **Neutral words.** A pack never uses one product's vocabulary. Where the domain needs a name
  (the isolation unit, the ledger's owner), it is a parameter.
- **Amending the core is explicit.** List each amended core rule under `amends:` in `PACK.md`.
- **Tested both ways.** `tests/render.mjs` renders a project with the pack on and with it off;
  both must pass.

## Where packs come from

Packs are not written for hypothetical projects. A new pack is grown inside a real project as
`docs/packs-local/<name>/`, ratified there against real decisions, then promoted:

1. Copy it into `template/docs/packs/` under the conditional folder name.
2. Replace every project-specific term with a parameter; the leftover-name scan in
   `tests/render.mjs` must pass.
3. Add the Copier choice, the validator entry and the bootstrap row.
4. Add a CHANGELOG entry and release a minor version.

The `promote-pack` skill (`template/.agents/skills/promote-pack/SKILL.md`) walks steps 1–3 and adds
the render scenario; run it from a checkout of this repository.
