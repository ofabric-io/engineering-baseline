---
layer: packs/data-store
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Data Store Naming

## Purpose

How the things a data store holds are named: tables and columns in a relational store, collections
and fields in a document store, keys in a key-value store. The general naming rules are
`11-style/naming-and-style.md`; this document fixes the casing and shape those rules leave to a
store (its R13). The store, the migration tool and any ORM or naming-strategy library are
technology choices recorded in `13-technology/`.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `store_name_case` | [[store_name_case]] | `snake_case`, characters `a-z`, `0-9` and `_` only, starting with a letter | a quoted or mixed-case name must be quoted in every query and tool, and stores fold case differently; one lowercase form never needs quoting |
| `table_plurality` | [[table_plurality]] | singular: a table and a collection are named for one record (`customer_order`, not `customer_orders`) | plural reads naturally in a query (`from orders`); singular matches the entity and class name, so the mapping is mechanical and a name never needs a plural rule |
| `constraint_name_format` | [[constraint_name_format]] | `<kind>_<table>_<columns>` with kinds `pk`, `fk`, `uq`, `ix`, `ck`, columns joined by `_` (`fk_customer_order_customer_id`) | a generated hash is short and never collides, and tells nobody what failed; a readable name can overflow the length limit |
| `max_identifier_length` | [[max_identifier_length]] | the smallest limit among the project's stores (63 bytes in some widely used relational stores) | a longer limit is not portable across stores, and a store truncates longer names silently |
| `document_field_case` | [[document_field_case]] | `snake_case`, as `store_name_case` | `camelCase` removes a mapping layer for document stores whose fields serialise straight to the API; it makes two casings in one project |
| `kv_key_pattern` | [[kv_key_pattern]] | `<application>:<entity>:<id>[:<facet>]`, lowercase `snake_case` segments, `:` as the separator | a flatter key is shorter and gives no way to find or expire one entity's keys; a deeper one costs memory on every key |
| `other_store_naming` | [[other_store_naming]] | a store kind not covered here has its naming pattern written into its `13-technology/` document before its first use | allowing an ad hoc pattern is faster and leaves each such store with its own convention |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Which stores does the project use, and which of the three kinds below does each belong to?
- [ ] Which ORM or naming-strategy mechanism applies `store_name_case` (`13-technology/`)?

## Rules

### Every store

- **R1.** An identifier MUST follow `store_name_case`; a name that needs quoting MUST NOT be used.
- **R2.** A name MUST be derived from the entity's name in `02-domain/glossary.md`, and MUST NOT carry a storage or type prefix (`tbl_`, `col_`, `t_`, `str_`).
- **R3.** The mapping from the name in code to the name in the store MUST be one mechanical rule configured once (a naming strategy or equivalent), not a hand-written name per field. A custom name is permitted only with a comment saying why.
- **R4.** A name MUST NOT exceed `max_identifier_length`, and MUST NOT rely on the store to truncate it.
- **R5.** A name MUST NOT be a word reserved by any store the project uses; the entity is renamed to a more specific word (`account`, not `user`; `customer_order`, not `order`) instead of being quoted.
- **R6.** The rules in `11-style/naming-and-style.md` apply to store names in their snake form: units in the name (R5: `timeout_ms`), instants carrying a marker (R6: `created_at`, per `02-domain/time.md` R3), booleans prefixed (R3: `is_active`), no bare `id` outside an entity's own primary key (R8).
- **R7.** Renaming a table, column, collection, field or key pattern MUST be handled as a breaking change under `migrations.md` R1.

### Relational stores

- **R8.** A table MUST be named per `table_plurality`.
- **R9.** A foreign key column MUST be named `<referenced_entity>_id`; where one table references the same entity twice, the role MUST precede it (`billing_address_id`, `shipping_address_id`).
- **R10.** A link table that carries no data of its own MUST be named for the two entities it joins, in alphabetical order (`role_user`); one that carries data MUST be named for the relationship (`membership`).
- **R11.** A constraint and an index MUST be created with an explicit name per `constraint_name_format`. A name generated or hashed by the store or the framework MUST NOT be used.
- **R12.** A constraint name that would exceed `max_identifier_length` MUST be shortened by replacing its column list with a short descriptive word, never by truncation.

### Document stores

- **R13.** A collection MUST be named by the same rules as a relational table (R1, R2, R8).
- **R14.** A field MUST follow `document_field_case`, and a reference to another entity MUST be named as R9.
- **R15.** A field name MUST be static: a value from data (an id, a date, user input) MUST NOT be used as a field name or map key.
- **R16.** A field name MUST NOT contain `.`, `$`, or whitespace, and MUST NOT begin with `_` unless the store requires it for its own key.

### Key-value stores

- **R17.** Every key MUST match `kv_key_pattern`, and its first segment MUST name the application that owns it.
- **R18.** A key MUST be built by one function per entity; a key MUST NOT be assembled by string concatenation at a call site.
- **R19.** A value placed into a key segment MUST NOT contain the separator, and a value from outside the system MUST be validated or encoded first.
- **R20.** Every key pattern in use MUST be listed in a key register in the store's `13-technology/` document, with its owning entity and whether it expires.

### Other stores

- **R21.** A store kind not covered above (a search index, a graph, a wide-column store, object storage) MUST have its naming pattern recorded per `other_store_naming` before its first use, and the pattern MUST follow R1 to R7.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1, R4 | Schema lint or migration check against `store_name_case` and `max_identifier_length` (tool chosen in `13-technology/`) | ⬜ scheduled |
| R2, R6 | Naming lint with prefix and suffix selectors; PR review for the rest | ◐ partial |
| R3 | Naming-strategy configuration in the data layer; PR review of any custom name | ❌ review-only |
| R5 | Schema lint against the store's reserved-word list | ⬜ scheduled |
| R7 | Migration-safety check (`migrations.md` R10) | ⬜ scheduled |
| R8, R9, R10 | Schema lint for singular names and foreign-key column names; review of link tables | ◐ partial |
| R11, R12 | Schema check rejecting a constraint or index whose name does not match `constraint_name_format` | ⬜ scheduled |
| R13, R14, R16 | Schema validation or lint over the document definitions | ⬜ scheduled |
| R15 | PR review | ❌ review-only |
| R17, R18, R19 | Lint banning key concatenation outside the key builders; unit tests of each builder | ⬜ scheduled |
| R20 | Check that every key builder has a row in the key register | ⬜ scheduled |
| R21 | PR review of the `13-technology/` document that adds the store | ❌ review-only |

## AI guardrails

- Names in a store are lowercase `snake_case`; never quote an identifier to make a name work.
- Tables and collections are singular, named for the entity in the glossary.
- Name every constraint and index yourself, as `<kind>_<table>_<columns>`; never accept a generated name.
- A foreign key column is `<entity>_id`.
- Never use a value from data as a field name or key segment.
- Build a key with its key function; never concatenate one.
- Never rename a column or table in the same release as the code that stops using it.

## References

- `11-style/naming-and-style.md` — general naming rules; R13 delegates casing per kind
- `02-domain/glossary.md`, `02-domain/time.md`, `02-domain/identifiers.md`
- `packs/data-store/migrations.md` — renames are breaking changes
- The identifier rules in the project's relational store documentation: unquoted names are folded to one case and over-long names are truncated, both of which R1 and R4 avoid
- The naming-strategy interface of the project's ORM, where it has one — an example of the mechanism R3 asks for, not a requirement
