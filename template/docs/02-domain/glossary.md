---
layer: 02-domain
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Glossary & Ubiquitous Language

## Purpose

The words the project uses, one meaning each, and the words it forbids. Code, schemas, interfaces, events and logs use these terms. The terms themselves belong to the project; this document fixes how they are defined and enforced.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `terms` | [[terms]] | seeded by the bootstrap from the scope | a missing term gets invented differently in each module |

## Terms

One row per term. **UI label (`<locale>`)** is the wording users see in that locale, when the
project has a user interface: keep one column per locale and rename the placeholder header
(for example `UI label (en)`); delete the columns if there is no interface. Forbidden synonyms are
also listed in `.baseline/forbidden-terms.txt`, which `scripts/check.mjs` enforces.

| Term | Meaning | Forbidden synonyms | UI label (<locale>) |
| --- | --- | --- | --- |
| [[term]] | | | |

### Terms the baseline itself uses

These standards use some everyday words with a specific meaning: **zone** (a time zone, or a
network or trust zone, never both unqualified), **agent** (an AI agent acting on the project, not
a software agent installed on a host), **domain** (the business problem space, not an internet
domain), **configuration** (values that change behaviour without a code change), **operator**
(vendor personnel who run the system, as distinct from a customer's user), **validation** (the
error category for input that breaks a stated constraint, `09-errors/taxonomy.md`). If one collides with
a term in this project, declare the collision here, choose the project's own word and add the
baseline's use to the forbidden synonyms.

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Which external vocabularies (a partner's API, a legal or industry phrase) legitimately use a forbidden synonym, and at which boundary is each mapped to the project's term?

## Rules

- **R1.** Every term MUST have exactly one meaning, and every concept exactly one term.
- **R2.** Code identifiers, database schemas, interface payloads, event names and log fields MUST use glossary terms.
- **R3.** Each term MUST list its forbidden synonyms, and each forbidden synonym MUST be added to `.baseline/forbidden-terms.txt` in the same change.
- **R4.** A word that names two different things MUST be split into two terms or banned as a domain term.
- **R5.** A forbidden synonym MAY appear only where it is external vocabulary (quoting a third-party payload, or a legal or industry phrase), only at an adapter boundary, and MUST be mapped to the glossary term on the way in.
- **R6.** A new concept MUST be added to the glossary in the change that introduces it; a term used in code but absent from the glossary is a defect.
- **R7.** Renaming a term MUST be one change that updates the glossary, the forbidden list and every use, and MUST NOT leave the old name as an alias.
- **R8.** A qualifier that disambiguates a term across entities (for example a field called `status`) MUST be part of the identifier, not left bare in a shared type or an event payload.
- **R9.** Where the project has a user interface, the UI label MAY differ from the term; the term MUST NOT change to match a label.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | Review of new rows | ❌ review-only |
| R2 | Term search in code, schemas, docs and logs by `scripts/check.mjs` against `.baseline/forbidden-terms.txt` | ◐ partial |
| R3 | `scripts/check.mjs` fails on any forbidden synonym outside this document and `.baseline/` | ✅ automated |
| R4 | Review | ❌ review-only |
| R5 | Review at the adapter boundary; adapters are the only place an external word may appear | ❌ review-only |
| R6 | Review; unknown-term detection is not automated | ❌ review-only |
| R7 | `scripts/check.mjs` fails on the retired name once it is in the forbidden list | ◐ partial |
| R8 | Identifier-naming lint rule (tool chosen in `13-technology/`) | ⬜ scheduled |
| R9 | Review | ❌ review-only |

## AI guardrails

```text
Use glossary terms in code, schemas, interfaces, events and logs. Never invent a synonym.
Never use a forbidden synonym; scripts/check.mjs fails the build on it.
A new concept goes in the glossary in the SAME change. If you are unsure of a term, ASK.
A forbidden word is allowed only when quoting external vocabulary at an adapter, and is
mapped to the glossary term on the way in.
```

## References

- `03-architecture/system.md` — the boundaries that own terms
- `11-style/naming-and-style.md` — naming conventions
- [Ubiquitous Language (Domain-Driven Design)](https://martinfowler.com/bliki/UbiquitousLanguage.html)
