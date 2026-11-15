---
layer: packs/user-interface
status: not-started # not-started | proposed | in-progress | ratified
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
| `hardcoded_copy` | [[hardcoded_copy]] | forbidden: every visible or assistive string comes from a catalog | — |
| `catalog_parity` | [[catalog_parity]] | every key present in every locale; checked in CI | — |
| `locale_resolution` | [[locale_resolution]] | explicit user choice → stored preference → browser/OS → default | locale in the URL is better for SEO and worse for sharing |
| `formatting` | [[formatting]] | numbers, dates, durations and amounts through shared formatters, never through translation strings | — |
| `wording` | [[wording]] | UI labels come from the glossary's UI-label column | the same thing named two ways confuses users and support |
| `voice_and_tone` | [[voice_and_tone]] | decided by the project, written down here | — |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

<!-- baseline: proposed default rules land here in a later baseline release. -->

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |

## AI guardrails

## References
