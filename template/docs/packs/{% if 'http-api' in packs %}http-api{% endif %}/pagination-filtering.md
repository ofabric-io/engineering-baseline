---
layer: packs/http-api
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Pagination, Filtering & Sorting

## Purpose

How collections are paged, filtered and sorted, and how clients revalidate and guard writes with conditional requests.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `pagination` | [[pagination]] | opaque cursor, navigation in an RFC 8288 `Link` header | Offset pagination is simpler and supports "jump to page N", but degrades on large sets and skips or repeats rows under concurrent writes |
| `default_limit` | [[default_limit]] | 25 | A larger default means fewer round trips and heavier responses |
| `max_limit` | [[max_limit]] | 100 | A higher cap helps bulk readers and costs the server; bulk export belongs on a dedicated endpoint |
| `total_count` | [[total_count]] | not returned by default | A total is a scan on every page; a separate explicit endpoint may offer one |
| `filter_syntax` | [[filter_syntax]] | flat query parameters, one per declared field | An operator syntax is more expressive and becomes a query language each endpoint implements differently |
| `caching` | [[caching]] | `ETag` + `If-None-Match` revalidation on reads; `Cache-Control` set explicitly per resource kind | Some resources must never be cached by anyone (`no-store`); shared caching helps public, slow-changing data |
| `conditional_writes` | [[conditional_writes]] | `If-Match` required on updates of resource kinds that declare a version | Required preconditions prevent lost updates and cost clients an extra read |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Which resource kinds are `no-store`, which are privately cacheable and which are publicly cacheable? (Recorded per kind in the API description.)
- [ ] Is there a reporting or export need that offset or full-scan access would serve, and where does it live instead?

## Rules

### Pagination

- **R1.** Collections MUST be paged as `pagination` says. With the default, offset pagination MUST NOT be used, including on internal and reporting surfaces.
- **R2.** Navigation MUST be returned in a `Link` header per RFC 8288 with `rel="next"` and, where it exists, `rel="prev"`:

  ```http
  Link: <https://api.example.com/v1/widgets?cursor=eyJ...&limit=25>; rel="next"
  ```

  A client MUST follow the link rather than construct one.
- **R3.** A cursor MUST be opaque to clients, who MUST NOT parse, construct or modify it. A server SHOULD sign or authenticate it so tampering is detected; the escape hatch is a cursor that carries no information beyond a public sort key.
- **R4.** A cursor MUST encode a stable, unique ordering: the sort field plus a unique tiebreaker such as the identifier.
- **R5.** `limit` MUST default to `default_limit` and MUST be clamped to `max_limit`; a request above the cap is clamped, not rejected, and the effective value appears in the `Link` header.
- **R6.** A total count MUST NOT be returned unless `total_count` says so.

### Filtering and sorting

- **R7.** Filters MUST follow `filter_syntax`. With the default, filters are flat query parameters such as `?state=active&createdFrom=2026-01-01`.
- **R8.** Every filterable and sortable field MUST be declared per resource kind in the API description. An undeclared filter or sort field MUST be rejected with the validation status (`responses-and-errors.md` R10), never silently ignored.
- **R9.** A filterable or sortable field MUST be backed by a supporting index or equivalent; a filter that cannot be served efficiently MUST NOT be offered.
- **R10.** Range filters MUST be `<field>From` and `<field>To`, inclusive at both ends; date values MUST be RFC 3339.
- **R11.** Sorting MUST use `?sort=<field>` with a leading `-` for descending. Every collection MUST have an explicit, stable default sort that includes the unique tiebreaker.

### Conditional requests and caching

- **R12.** A read MUST return an `ETag` (RFC 9110 §8.8) on resource kinds that are revalidated, and MUST honour `If-None-Match` with `304`.
- **R13.** Every resource kind MUST declare its caching behaviour as `caching` allows, and MUST send an explicit `Cache-Control` header; a kind declared `no-store` MUST send `Cache-Control: no-store`.
- **R14.** A response containing credentials, personal data or caller-specific content MUST NOT be shared-cacheable (`Cache-Control: private` at most) (`06-security/sensitive-data.md`).
- **R15.** An update on a resource kind covered by `conditional_writes` MUST require `If-Match`: absent is `428`, mismatched is `412`. This is the HTTP expression of optimistic concurrency (`08-reliability/concurrency-and-idempotency.md`).

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | Static check banning offset/page-number parameters on collection routes (mechanism chosen in `13-technology/`) | ⬜ scheduled |
| R2 | Shared cursor helper emits `Link`; contract test asserts RFC 8288 syntax | ⬜ scheduled |
| R3, R4 | Cursor encoding by construction in the helper | ⬜ scheduled |
| R5, R6 | Helper defaults and cap; contract test that no collection returns a total | ⬜ scheduled |
| R7, R8, R11 | Strict per-endpoint query schema; an undeclared parameter is rejected | ⬜ scheduled |
| R9 | Query-plan review of each declared filter and sort | ❌ review-only |
| R10 | Shared range-filter schema | ⬜ scheduled |
| R12–R14 | Cache-header interceptor; contract tests for `304` and header presence per resource kind | ⬜ scheduled |
| R15 | Contract tests for `412` and `428` | ⬜ scheduled |

## AI guardrails

- Page with `pagination`; with the default that is cursors only, never offsets.
- Put navigation in the `Link` header. Cursors are opaque and include a unique tiebreaker.
- Clamp `limit` to `max_limit`. No total count unless asked for by `total_count`.
- Declare every filter and sort field; reject undeclared ones, never ignore them.
- Set `Cache-Control` explicitly per resource kind. Sensitive responses are never shared-cacheable.
- `ETag` with `If-None-Match` gives `304`; `If-Match` mismatch gives `412`, absent gives `428`.

## References

- [RFC 8288 — Web Linking](https://www.rfc-editor.org/rfc/rfc8288)
- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110) (§8.8 validators, §13 conditional requests), [RFC 9111 — HTTP Caching](https://www.rfc-editor.org/rfc/rfc9111)
- [RFC 3339 — Date and Time on the Internet](https://www.rfc-editor.org/rfc/rfc3339)
- `responses-and-errors.md`, `resources-and-requests.md` (this pack)
- `08-reliability/concurrency-and-idempotency.md`, `06-security/sensitive-data.md`
