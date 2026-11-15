---
layer: 11-style
status: proposed
owner: TBD
last-reviewed: never
---

# Naming & Code Style

## Purpose

Language-independent naming and style principles, so that nobody argues about them and no agent
has to guess. Casing conventions, lint and format configuration belong to the project's
`13-technology/` documents, which MUST implement the rules here.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `comment_policy` | [[comment_policy]] | comments explain why, not what | a stricter policy (documentation required on public API) costs noise on trivial members |
| `unit_in_name` | [[unit_in_name]] | numbers carrying a unit name it (`timeoutMs`, `ttlSeconds`) | none significant; the cost of omitting it is a unit bug |
| `abbreviation_allowlist` | [[abbreviation_allowlist]] | `id`, `url`, `uri`, `api`, `http`, `utc`, `env` | a longer list is easier to write and harder to read for newcomers |
| `role_suffixes` | [[role_suffixes]] | `Error`, `Port`, `Adapter`, `Repository`, `Mapper`, `Schema` | more suffixes name more roles but need more enforcement |
| `boolean_prefixes` | [[boolean_prefixes]] | `is`, `has`, `can`, `should`, `was`, `will` | a longer list is flexible; a shorter one is easier to lint |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Which `13-technology/` document owns casing per kind (functions, types, constants, files)?

## Rules

### Meaning

- **R1.** A function name MUST be verb-first; a function named as a noun is a getter or misnamed.
- **R2.** These verb prefixes are reserved and MUST carry their meaning:
  - `get` — cheap, no I/O
  - `fetch` / `load` — performs I/O
  - `create` / `build` — returns a new object
  - `to` / `from` — pure conversion
  - `assert` — fails on violation; `ensure` — returns the valid value
- **R3.** A boolean MUST read as a positive assertion carrying a prefix in `boolean_prefixes`; a bare
  adjective (`retryable`, `ok`) MUST NOT be used.
- **R4.** A negated name (`isNotExpired`) MUST NOT be used; it produces double negatives at call
  sites.
- **R5.** A number carrying a unit MUST name the unit, per `unit_in_name`.
- **R6.** An instant MUST carry a name marking it as one and MUST be in UTC (see
  `02-domain/time.md`).
- **R7.** A collection's name MUST state its shape: plural for a sequence, `<thing>By<Key>` for a
  map, a `Count` suffix for a count; `<thing>List` and `<thing>Array` MUST NOT be used.
- **R8.** An identifier MUST be qualified by its entity (`orderId`, not `id`); a bare `id` is
  permitted only for an entity's own primary key inside its own definition.
- **R9.** Acronyms MUST be written as words (`httpUrl`, `ApiClient`), with no exception list.
- **R10.** An abbreviation MUST NOT be used unless it is in `abbreviation_allowlist`; everything else
  is spelled out.
- **R11.** A suffix in `role_suffixes` MUST be used only by a type that is that role, and a type that
  is that role MUST use the suffix.

### State and structure

- **R12.** Mutable module-level state MUST NOT exist; shared state is injected so a test can
  substitute it and it cannot leak between requests or tenants.
- **R13.** Casing per kind of identifier, and file naming, MUST be defined in the language's
  `13-technology/` document and checked by a naming lint.

### Comments, suppressions and formatting

- **R14.** A comment MUST explain why (per `comment_policy`); a comment restating the code MUST be
  deleted, not maintained.
- **R15.** A lint suppression MUST be local to the offending line, name the specific rule and give a
  reason on the same line; file-level blanket suppression MUST NOT be used.
- **R16.** Formatting MUST be owned by one automated formatter whose configuration is committed;
  formatting MUST NOT be debated in review.

### Tests

- **R17.** A test MUST be named after the unit under test and state the behaviour it verifies in
  the present tense (`rejects an amount above the limit`); the word "should" MUST NOT be used.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1, R2 | PR review; prefix-to-return-type is only partly checkable | ❌ review-only |
| R3, R4 | Naming lint with a boolean-prefix selector (tool chosen in `13-technology/`) | ⬜ scheduled |
| R5, R6 | PR review checklist | ❌ review-only |
| R7 | Naming lint catches bare `id`-style names; collection shape is review | ◐ partial |
| R8 | Naming lint for bare `id` | ⬜ scheduled |
| R9, R10 | Naming lint with an abbreviation allowlist | ⬜ scheduled |
| R11 | Naming lint selectors per suffix | ⬜ scheduled |
| R12 | Lint rule banning module-scope mutable bindings | ⬜ scheduled |
| R13 | Naming lint configured in the technology document | ⬜ scheduled |
| R14 | PR review | ❌ review-only |
| R15 | Lint rule requiring a rule name and description on every suppression | ⬜ scheduled |
| R16 | Formatter check in the hook and in CI (`15-delivery/pipeline-and-gates.md`) | ⬜ scheduled |
| R17 | PR review | ❌ review-only |

## AI guardrails

- Run the formatter and the linter; never fight them.
- Functions are verb-first. Booleans are positive and prefixed. Units go in the name.
- Acronyms are words. Abbreviate only from the allowlist.
- No mutable module-level state; inject it.
- Comments explain why. Suppress a lint rule inline, by name, with a reason — never per file.
- Do not give a type a role suffix it does not earn.

## References

- `02-domain/time.md` — instants and UTC
- `10-patterns/patterns.md` — pattern names and reserved suffixes
- `13-technology/README.md` — casing, lint and format configuration per language
