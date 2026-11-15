---
layer: packs/http-api
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Resource Design & Requests

## Purpose

How resources, paths, methods and request bodies are shaped. Response shapes and errors are in `responses-and-errors.md`; retries and versions are in `idempotency-and-versioning.md`; collections are in `pagination-filtering.md`.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `allowed_methods` | [[allowed_methods]] | GET, POST, PUT, PATCH, DELETE, narrowed per resource kind in the API description | A resource that must never be replaced or removed (an append-only record) forbids PUT, PATCH and DELETE; every method you allow is a behaviour to specify and test |
| `patch_semantics` | [[patch_semantics]] | RFC 7396 JSON Merge Patch (`application/merge-patch+json`) | RFC 6902 JSON Patch can express array edits and `null` values but is harder for clients; "no PATCH" is valid if every change is a sub-resource action |
| `path_casing` | [[path_casing]] | kebab-case paths, camelCase JSON members | One casing everywhere is simpler to learn; matching the host language's convention may be cheaper to implement |
| `scope_selection` | [[scope_selection]] | none: the scope comes from the credential alone. Alternatives: a request header, or a path segment, naming which isolation unit or account the call acts on | A principal that belongs to several units needs a way to choose; every selector is client input that must be authorized |
| `max_nesting_depth` | [[max_nesting_depth]] | 2 levels below the collection | Deeper paths encode joins into URLs; flatter paths need more query parameters |
| `unknown_fields` | [[unknown_fields]] | rejected | A tolerant reader hides client bugs but survives client-ahead-of-server skew |
| `max_request_body` | [[max_request_body]] | 1 MB, with an explicit bound on every string and array | Larger bodies need streaming or upload endpoints, not a higher cap |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Which resource kinds exist, and which methods does each allow? (Recorded per kind in the API description, constrained by `allowed_methods`.)
- [ ] Does the API have several audiences (public, internal, administrative)? If so, does the path carry an audience segment?
- [ ] Which request headers beyond `Idempotency-Key`, `X-Request-Id` and the `scope_selection` selector are part of the contract?
- [ ] If `scope_selection` is not none: the selector's name, and what a principal with one unit may omit.

## Rules

### URLs

- **R1.** Resource collections MUST be named with plural nouns: `/v1/widgets`, `/v1/widgets/{id}`.
- **R2.** Path segments and JSON members MUST follow `path_casing`; with the default, kebab-case paths and camelCase members.
- **R3.** Nesting MUST NOT exceed `max_nesting_depth`, counted from the first resource segment (a version or audience prefix is not a level).
- **R4.** The scope a call acts on (an isolation unit or account) MUST be selected as `scope_selection` says; with the default, it comes from the credential and no path segment, query parameter or header selects it. A caller's own user identity MUST NOT be a client-selectable segment.
- **R5.** A non-CRUD action MUST be modelled as a sub-resource of the thing acted on, created with `POST`: `POST /v1/widgets/{id}/activations`, not `POST /v1/widgets/{id}/activate`. The sub-resource has its own identifier, timestamp and outcome.
- **R6.** A path or query string MUST NOT carry personal data, a credential or a secret (`06-security/sensitive-data.md`).

### Methods

- **R7.** Every resource kind MUST declare its allowed methods in the API description, and the set MUST be a subset of `allowed_methods`.
- **R8.** A request using a method the resource does not allow MUST be answered `405` with an `Allow` header listing the methods it does.
- **R9.** `GET` and `HEAD` MUST be safe: they MUST NOT change state, including as a side effect (a crawler, a prefetch or a retry will call them).
- **R10.** `PUT`, where allowed, MUST replace the whole representation and MUST be idempotent in effect; it MUST NOT be used for a partial update.
- **R11.** `PATCH`, where allowed, MUST use `patch_semantics`, MUST require the matching media type (a mismatch is `415`), and MUST document how `null`, absent and empty values are interpreted.
- **R12.** `DELETE`, where allowed, MUST be idempotent in effect: repeating it MUST leave the same final state, and the API description MUST say which status a repeat returns.
- **R13.** `POST` MUST be used for creation and for actions that are not idempotent by nature; its retry safety comes from `idempotency-and-versioning.md`, not from the method.

### Requests

- **R14.** A request body MUST use the content type the API declares; with the default, `Content-Type: application/json` (or the media type required by R11). Any other type MUST be rejected with `415`, and an unparseable body with `400`.
- **R15.** A request containing a field the schema does not declare MUST be handled as `unknown_fields` says; when the answer is "rejected", the response is `422` naming the field.
- **R16.** A request body larger than `max_request_body` MUST be rejected with `413`, and every string and array in a schema MUST declare an explicit bound (`06-security/appsec.md`).
- **R17.** With the default header name, the server MUST accept an `X-Request-Id` header if supplied (bounded in length and character set), generate one when absent, echo it on every response, and include it in every log line and error body (`07-observability/logging.md`).
- **R18.** A timestamp on the wire MUST be RFC 3339 in UTC with a `Z` suffix; a local time MUST NOT appear (`02-domain/time.md`).
- **R19.** An identifier on the wire MUST follow `02-domain/identifiers.md` and MUST be treated by clients as opaque.
- **R20.** When `scope_selection` uses a header or path segment, the server MUST verify before any processing that the authenticated principal is authorized for the selected scope (`06-security/authn-authz.md`); the isolation key is never trusted from the client without that check. A failed check MUST be answered as `hide_existence` says (`responses-and-errors.md` R14), and a principal belonging to several scopes that omits the selector MUST be rejected, not defaulted.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1–R3, R5 | API-description linter with a project ruleset (tool chosen in `13-technology/`) | ⬜ scheduled |
| R4, R20 | Review of every new route against `06-security/authn-authz.md`; negative test that an unselected or unauthorized scope is rejected as `hide_existence` says | ⬜ scheduled |
| R6 | Contract test: no declared path or query parameter is on the sensitive-field list | ⬜ scheduled |
| R7, R8 | Route-registration audit comparing registered methods with the API description; contract test for `405` and `Allow` | ⬜ scheduled |
| R9 | Architecture test: no `GET`/`HEAD` handler reaches a write path | ⬜ scheduled |
| R10–R13 | Contract tests per method actually allowed | ⬜ scheduled |
| R14–R16 | Transport-layer contract tests for `415`, `400`, `422`, `413` | ⬜ scheduled |
| R17 | Contract test: generation, echo, and equality with the error body and the log field | ⬜ scheduled |
| R18, R19 | Shared serializers; contract test per endpoint | ⬜ scheduled |

## AI guardrails

- Plural nouns, `path_casing`, at most `max_nesting_depth` levels.
- Select the scope only as `scope_selection` says, and authorize the selected scope every time. Never trust a client-supplied isolation key unchecked.
- A non-CRUD action is a sub-resource created with `POST`, never a verb endpoint.
- Use only the methods the resource kind allows; anything else is `405` with `Allow`.
- `GET` never changes state. `PATCH` only with the project's `patch_semantics` media type.
- Unknown fields, oversize bodies and wrong content types are rejected, not tolerated.
- Timestamps are RFC 3339 UTC with `Z`. No personal data or secrets in URLs.

## References

- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110) (methods, safe and idempotent, `405`, `Allow`)
- [RFC 7396 — JSON Merge Patch](https://www.rfc-editor.org/rfc/rfc7396), [RFC 6902 — JSON Patch](https://www.rfc-editor.org/rfc/rfc6902)
- [RFC 3339 — Date and Time on the Internet](https://www.rfc-editor.org/rfc/rfc3339)
- `responses-and-errors.md`, `idempotency-and-versioning.md`, `pagination-filtering.md` (this pack)
- `05-protocols/rfc-profile.md`, `06-security/appsec.md`, `06-security/sensitive-data.md`, `07-observability/logging.md`, `02-domain/identifiers.md`, `02-domain/time.md`
