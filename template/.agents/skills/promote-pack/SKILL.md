---
name: promote-pack
description: Promote a project's locally grown pack (docs/packs-local/<name>/) into the engineering baseline as a reusable pack — copy it under the conditional folder name, replace project-specific terms with parameters, and add the Copier choice, validator entry and bootstrap row. Use when the user says "promote this pack", "contribute the <name> pack to the baseline", or a local pack has been ratified and should be shared.
---

# Promote a local pack into the baseline

Run this in a checkout of the **baseline repository**, with the project's `docs/packs-local/<name>/`
available as a path. The procedure and rules are `maintainers/pack-authoring.md` and
`maintainers/principles.md`; this skill is the order of work.

## Inputs

- The path to the project's `docs/packs-local/<name>/`.
- The pack name (kebab-case) and whether it requires another pack.

## Procedure

1. **Read** `maintainers/pack-authoring.md`, `maintainers/principles.md` and the local pack's
   documents. Stop if any document is not `ratified` in the source project; ratified-in-practice
   is the entry condition.
2. **Copy** the folder to `template/docs/packs/{% if '<name>' in packs %}<name>{% endif %}/`
   (the folder name is a Copier expression, literally).
3. **Generalize every document.** Replace project-specific words, product and technology names
   with a parameter row (default plus one-line trade-off) or neutral wording. Remove the source
   project's decision history, ADR numbers, dates and paths. List each core rule it amends in
   `PACK.md` under `amends:`. A core document must never link into the pack.
4. **Add the Copier choice** to `packs` in `copier.yml` and its `requires` to the validator.
5. **Add a row** to the Phase 4P pack table in `template/bootstrap/questionnaire.md.jinja`
   (phase 4P runs before phase 4, so each `amends:` entry is applied before its document is
   offered). Say which component kinds the pack concerns.
6. **Add a render scenario** to `tests/render.mjs` with the pack on, and confirm it is also absent
   when off.
7. **Run `node tests/render.mjs`**; the leftover-name scan must pass. Fix by generalizing, never by
   editing the scan.
8. **Hand the change over:** list files changed and the parameters introduced. The CHANGELOG entry
   and minor release are the maintainer's.

## Constraints

- Never edit the source project; read-only.
- Never promote a pack the source project has not ratified.
- Never leave a project term in the baseline to make a rule read better: parameterize it.
- Never add an unconditional file for a pack; every pack file lives under the conditional folder.
