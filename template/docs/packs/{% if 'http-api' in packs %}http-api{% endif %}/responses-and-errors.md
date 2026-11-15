---
layer: packs/http-api
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Responses & Errors

## Purpose

One response shape and one error format for the whole API, and the mapping from the error categories of `09-errors/taxonomy.md` (domain, validation, authentication, authorization, not_found, conflict, rate_limited, unavailable, internal) to HTTP status codes. This is the document the core taxonomy defers the wire format to.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `error_format` | [[error_format]] | RFC 9457 Problem Details, `application/problem+json` | A bespoke format is cheaper to start and expensive to document, tool and keep consistent |
| `single_resource_shape` | [[single_resource_shape]] | bare (no envelope) | An envelope allows adding metadata later without a breaking change, at the cost of one level of nesting for every client |
| `collection_envelope` | [[collection_envelope]] | `{ "data": [ ... ] }`, navigation in the `Link` header | Putting paging fields in the body is easier to read in a browser and duplicates what the protocol already carries |
| `error_type_base` | [[error_type_base]] | a URI under a domain the project controls, one page per error code | A `type` that does not resolve is worse than none; if no documentation site exists yet, use `about:blank` and rely on `code` |
| `validation_status` | [[validation_status]] | `422` | `400` for every client error is simpler but loses the retry-can-never-help signal |
| `hide_existence` | [[hide_existence]] | yes: an unauthorized resource answers exactly like a missing one | Distinct `403` and `404` help legitimate clients debug; they also turn the API into an existence oracle |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Which error codes override their category's default status? (Recorded in the error-code catalog; R15 governs the process.)
- [ ] Which members, beyond those required by R6, are part of the error contract (for example a documentation link or a retry hint)?

## Rules

### Success responses

- **R1.** A single resource MUST follow `single_resource_shape` on every endpoint, with no per-endpoint exceptions.
- **R2.** A collection MUST follow `collection_envelope`. Navigation MUST be carried by the `Link` header (RFC 8288), not by body members (`pagination-filtering.md` R2).
- **R3.** A response MUST use the status code in the table below for its situation. The status describes the request; the resource body describes the outcome.

  | Situation | Status |
  | --- | --- |
  | read succeeded | `200` |
  | resource created | `201` with `Location` |
  | accepted, completing asynchronously | `202` with a pollable status resource |
  | succeeded, nothing to return | `204` |
  | conditional read, unchanged | `304` |
  | replay of an earlier request | the original status (`idempotency-and-versioning.md` R4) |

- **R4.** A `2xx` response MUST NOT carry an error in its body. A business outcome of "declined" or "failed" is a successful request whose resource has a failed state.

### Error format

- **R5.** An error response MUST follow `error_format`; with the default format, it is RFC 9457 Problem Details with `Content-Type: application/problem+json`.
- **R6.** Every error MUST carry, with the default format, `type`, `title`, `status`, `detail`, a stable machine-readable `code`, and `requestId` (the members are named by `error_format` otherwise):

  ```json
  {
    "type": "https://errors.example.com/widget-already-activated",
    "title": "Widget already activated",
    "status": 409,
    "detail": "This widget was activated at 2026-01-15T10:00:00Z.",
    "code": "WIDGET_ALREADY_ACTIVATED",
    "requestId": "req_01J..."
  }
  ```

- **R7.** `code` MUST follow `09-errors/taxonomy.md` (stable, append-only, never renamed). Clients MUST key behaviour off `code`, never off `title` or `detail`, which are prose and may be reworded.
- **R8.** `type` MUST follow `error_type_base`; where it is a URI, it MUST resolve to documentation for that error.
- **R9.** `requestId` MUST be present on every error and MUST equal the identifier in the server's logs for that request (`07-observability/logging.md`).
- **R10.** A validation failure MUST use `validation_status` and an `errors` array whose entries name the offending member by RFC 6901 JSON Pointer and carry a per-member `code`:

  ```json
  {
    "code": "VALIDATION_FAILED",
    "status": 422,
    "errors": [{ "pointer": "/size/unit", "code": "UNSUPPORTED_UNIT" }]
  }
  ```

- **R11.** `400` MUST be reserved for a request that could not be parsed; a well-formed but semantically invalid request MUST use `validation_status`. Retrying a `400` or a validation error unchanged MUST NOT be expected to succeed.

### What must not leak

- **R12.** An error body MUST NOT contain a stack trace, a query fragment, an internal host name, an upstream provider's raw response, or an internal identifier (`06-security/appsec.md`).
- **R13.** An error whose `isExposable` flag is false (`09-errors/taxonomy.md`) MUST be replaced with a generic message plus `requestId`; the detail goes to the logs.
- **R14.** When `hide_existence` is yes, a request for a resource the caller may not access MUST return exactly the response (status, body shape and timing class) of a request for a resource that does not exist.

### Mapping

- **R15.** Exactly one translation point MUST map the taxonomy's errors to this format; no handler, service or middleware sets an error status itself.
- **R16.** The status MUST be derived from the error's category (`09-errors/taxonomy.md`) by the table below, and a specific `code` MAY override it in the error-code catalog. An override MUST be documented next to the code.

  | Category | Situation | Status |
  | --- | --- | --- |
  | `validation` | unparseable body | `400` |
  | `validation` | well-formed but invalid | `validation_status` |
  | `validation` | unsupported media type | `415` |
  | `validation` | representation not acceptable | `406` |
  | `validation` | body too large | `413` |
  | `authentication` | not authenticated | `401` with `WWW-Authenticate` |
  | `authorization` | forbidden | `403` (or `404` per R14) |
  | `not_found` | resource absent | `404` |
  | `not_found` | method not allowed on the resource | `405` with `Allow` |
  | `conflict` | state or concurrency conflict | `409` |
  | `conflict` | precondition failed (`If-Match`) | `412` |
  | `conflict` | precondition required | `428` |
  | `conflict` | removed permanently (a retired version) | `410` |
  | `domain` | a business rule refused the operation | `409`, or `422` when no state conflict is involved, set per code in the catalog |
  | `rate_limited` | limit exceeded | `429` with `Retry-After` |
  | `unavailable` | dependency failed | `502` |
  | `unavailable` | overloaded or shedding load | `503` with `Retry-After` |
  | `unavailable` | dependency timed out | `504` |
  | `internal` | defect in this service | `500`, generic body (R13) |

- **R17.** An error whose `isRetryable` flag is true MUST say so on the wire (an `isRetryable` member or a `Retry-After` header); a client MUST NOT infer retry safety from the status alone (`08-reliability/timeouts-retries.md`).

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1–R4 | Contract test per endpoint against the API description | ⬜ scheduled |
| R5–R9 | The translation point is the only error path; contract suite asserts required members, media type and `requestId` equality with the log | ⬜ scheduled |
| R7 | Error-code catalog checked append-only in CI (`09-errors/taxonomy.md`) | ⬜ scheduled |
| R8 | Link check over the `type` URIs | ⬜ scheduled |
| R10, R11 | Contract tests for an unknown field, an empty value and an unparseable body | ⬜ scheduled |
| R12, R13 | Test helper scanning every error body for stack frames, query text, internal paths and host names | ⬜ scheduled |
| R14 | Integration test: another caller's resource returns exactly the not-found response | ⬜ scheduled |
| R15 | Architecture test: no handler sets an error status | ⬜ scheduled |
| R16, R17 | Status-mapping table kept as data and unit-tested; catalog review | ⬜ scheduled |

## AI guardrails

- Follow `single_resource_shape` and `collection_envelope` everywhere. Navigation goes in `Link`.
- A `2xx` never carries an error.
- Errors are `error_format` with `type`, `title`, `status`, `detail`, `code`, `requestId`.
- `code` is the contract: stable, append-only. Clients never key off `title` or `detail`.
- `400` means unparseable; validation uses `validation_status` with JSON Pointers.
- Never leak stack traces, queries, host names or upstream payloads.
- One translation point maps errors to statuses; handlers never set an error status.

## References

- [RFC 9457 — Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457)
- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110) (status codes)
- [RFC 8288 — Web Linking](https://www.rfc-editor.org/rfc/rfc8288), [RFC 6901 — JSON Pointer](https://www.rfc-editor.org/rfc/rfc6901)
- `resources-and-requests.md`, `idempotency-and-versioning.md`, `pagination-filtering.md` (this pack)
- `09-errors/taxonomy.md`, `05-protocols/rfc-profile.md`, `07-observability/logging.md`, `06-security/appsec.md`, `08-reliability/timeouts-retries.md`
