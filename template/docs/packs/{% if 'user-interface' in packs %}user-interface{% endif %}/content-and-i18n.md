---
layer: packs/user-interface
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Content, Copy & Internationalisation

## Purpose

Where interface text lives, how it is translated and formatted, and how its wording stays consistent with the domain language.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `locales` | [[locales]] | one, named by the bootstrap | each added locale is a catalog to keep in parity |
| `catalog_layout` | [[catalog_layout]] | one directory of catalogs; one file per locale per namespace, nested keys; location chosen in `13-technology/` | one big file per locale is simpler and merges badly |
| `hardcoded_copy` | [[hardcoded_copy]] | forbidden: every visible or assistive string comes from a catalog | — |
| `catalog_parity` | [[catalog_parity]] | every key present in every locale; checked in CI | — |
| `locale_resolution` | [[locale_resolution]] | explicit user choice → stored preference → browser/OS → default | locale in the URL is better for SEO and worse for sharing |
| `formatting` | [[formatting]] | numbers, dates, durations and amounts through shared formatters, never through translation strings | — |
| `wording` | [[wording]] | UI labels come from the glossary's UI-label column | the same thing named two ways confuses users and support |
| `voice_and_tone` | [[voice_and_tone]] | decided by the project, written down here | — |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Is any locale right-to-left? If so, which layout rules apply (mirroring, icons)?
- [ ] Who translates and reviews each locale, and what is the release rule for an incomplete one?

## Rules

### Copy

- **R1.** Every visible or assistive string (text, labels, placeholders, alternative text, titles, announcements, error messages) MUST come from a catalog. A literal string MUST NOT appear in interface code.
- **R2.** Catalog keys MUST be stable and name the meaning, not the wording; changing the wording MUST NOT change the key.
- **R3.** Values with variables or plurals MUST use the catalog's interpolation and plural mechanism. Strings MUST NOT be assembled by concatenation.
- **R4.** Machine-facing text (logs, identifiers, error codes) MUST NOT be translated or placed in catalogs.
- **R5.** Layouts MUST tolerate text expansion; a container MUST NOT assume a fixed text width.

### Catalogs and locales

- **R6.** The catalogs MUST follow `catalog_layout`, and every locale in `locales` MUST have every key present in every namespace (`catalog_parity`).
- **R7.** Adding a locale MUST add a complete catalog in the same change; a partial catalog MUST NOT be released.
- **R8.** The active locale MUST be resolved by `locale_resolution` and MUST set the document's language and text direction.

### Formatting

- **R9.** Numbers, dates, times, durations and monetary amounts MUST be rendered through shared formatters that take the active locale. A formatted value MUST NOT live in a translation string.
- **R10.** Date, time and amount rendering MUST follow `../../02-domain/time.md`; a project with a money pack also follows its rules.

### Wording

- **R11.** A domain term shown to users MUST use the glossary's UI-label column (`../../02-domain/glossary.md`) for that locale, and MUST NOT use a forbidden synonym.
- **R12.** Error and status copy MUST be keyed by error code or status role, not by message text (`ux-states.md` R6).
- **R13.** The project MUST record its `voice_and_tone` in this document's project copy, and new copy MUST follow it.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | lint rule rejecting literal strings in interface code (tool chosen in `13-technology/`) | ⬜ scheduled |
| R2 | PR review | ❌ review-only |
| R3 | lint rule rejecting concatenated catalog output | ⬜ scheduled |
| R4 | PR review | ❌ review-only |
| R5 | pseudo-locale rendering in end-to-end tests | ⬜ scheduled |
| R6 | `scripts/checks/ui-catalog-parity.mjs` compares every key path across locales per namespace (config `.baseline/ui.json`); becomes automated once `scripts/check.mjs` runs it | ◐ partial |
| R7 | `scripts/checks/ui-catalog-parity.mjs` fails on a missing locale file or key; becomes automated once `scripts/check.mjs` runs it | ◐ partial |
| R8 | end-to-end test per locale | ⬜ scheduled |
| R9 | lint rule rejecting direct formatting calls outside the shared formatters | ⬜ scheduled |
| R10 | PR review | ❌ review-only |
| R11 | `scripts/check.mjs` forbidden-term check over the glossary covers documents; interface copy by catalog scan | ⬜ scheduled |
| R12 | covered with `ux-states.md` R6 | ⬜ scheduled |
| R13 | PR review | ❌ review-only |

## AI guardrails

- Never write a visible or assistive string in code; add a catalog key.
- Add a new key to every locale in the same change.
- Never concatenate strings or format numbers, dates or amounts by hand.
- Use the glossary's UI label for a domain term, never a synonym.

## References

- [Unicode CLDR](https://cldr.unicode.org/) — locale data behind plural and format rules
- [BCP 47 / RFC 5646](https://www.rfc-editor.org/info/rfc5646) — language tags
- `../../02-domain/glossary.md`, `../../02-domain/time.md`
- `ux-states.md`, `accessibility.md`
