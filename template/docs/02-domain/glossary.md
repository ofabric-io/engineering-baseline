---
layer: 02-domain
status: not-started # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Glossary & Ubiquitous Language

## Purpose

The words the project uses, one meaning each, and the words it forbids. Code, schemas, APIs, events and logs use these terms.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `terms` | [[terms]] | seeded by the bootstrap from the scope | a missing term gets invented differently in each module |

## Terms

One row per term. **UI label** is the wording users see, per locale, when the project has a
user interface; leave it empty otherwise. Forbidden synonyms are also listed in
`.baseline/forbidden-terms.txt`, which `scripts/check.mjs` enforces.

| Term | Meaning | Forbidden synonyms | UI label |
| --- | --- | --- | --- |
| [[term]] | | | |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

<!-- baseline: proposed default rules land here in a later baseline release. -->

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |

## AI guardrails

## References
