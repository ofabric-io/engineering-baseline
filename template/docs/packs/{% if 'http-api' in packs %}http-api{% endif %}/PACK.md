---
pack: http-api
version: 0.1.0
requires: []
amends:
  - 05-protocols/rfc-profile.md  # adds RFC 9110, 9457, 8288, 9745, 8594, 9111, 7396 and the idempotency-key draft to the adopted standards
  - 09-errors/taxonomy.md  # supplies the HTTP transport mapping from error category to status code (responses-and-errors.md R16)
documents:
  - resources-and-requests.md  # Resource Design & Requests
  - responses-and-errors.md  # Responses & Errors
  - idempotency-and-versioning.md  # Idempotency, Versioning & Deprecation
  - pagination-filtering.md  # Pagination, Filtering & Sorting
  - long-running-operations.md  # Long-Running Operations
---

# Pack: http-api

Standards for projects that expose an HTTP API, public or internal. Documents in this folder
depend on the core layers; no core document links here.

## What it adds to the core

- **Standards profile.** A project with this pack adds to `core_standards` in
  `05-protocols/rfc-profile.md`: RFC 9110 (semantics, conditional requests), RFC 9457 (problem
  details), RFC 8288 (links), RFC 9745 and RFC 8594 (deprecation and sunset), RFC 9111
  (caching), RFC 7396 or RFC 6902 (patch, if allowed), RFC 6901 (JSON Pointer), and the IETF
  idempotency-key draft, labelled as a draft.
- **Error transport mapping.** `09-errors/taxonomy.md` defines categories and stable codes;
  `responses-and-errors.md` R16 maps each category to a status code.

## Parameters worth deciding first

`allowed_methods` per resource kind, `patch_semantics`, `caching`, `versioning_scheme`,
`hide_existence` and `scope_selection` (how a principal belonging to several accounts or isolation
units chooses one). The defaults suit a general-purpose JSON API; an API for an append-only or
high-assurance domain typically narrows methods and forbids caching on specific kinds.

## Bootstrap

The bootstrap asks this pack's parameters in its own section of `bootstrap/questionnaire.md`.
