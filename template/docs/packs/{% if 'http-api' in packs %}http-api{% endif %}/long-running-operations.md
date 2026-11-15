---
layer: packs/http-api
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Long-Running Operations

## Purpose

How an operation that cannot finish within a request is exposed: accepted immediately, represented by an operation resource, observed by polling, and cancelled or expired. Retry safety of the initiating request is in `idempotency-and-versioning.md`; the status code for acceptance is in `responses-and-errors.md` R3.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `long_running_threshold` | [[long_running_threshold]] | an operation that may exceed the request timeout (`08-reliability/timeouts-retries.md`) is asynchronous | A lower threshold keeps requests short and multiplies operation resources; a higher one risks client timeouts mid-operation |
| `operation_states` | [[operation_states]] | `pending`, `running`, `succeeded`, `failed`, `cancelled` | More states describe progress better and widen the contract every client must handle |
| `poll_interval_hint` | [[poll_interval_hint]] | a `Retry-After` header on every non-terminal poll response | Fixed client intervals waste load or latency; a server hint lets load shape polling |
| `operation_retention` | [[operation_retention]] | 7 days after reaching a terminal state | Longer retention serves late pollers and costs storage; after expiry the resource answers `410` |
| `cancellation` | [[cancellation]] | supported where the work can stop safely; otherwise not offered | Cancellation needs every step to be interruptible or compensable |
| `completion_notification` | [[completion_notification]] | polling only | A callback or event saves polls and adds a delivery channel to secure and retry |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Which operations are long-running, and what is each one's expected duration? (Recorded in the API description.)
- [ ] What does a succeeded operation link to: the created resource, a result resource, or both?

## Rules

### Starting

- **R1.** An operation meeting `long_running_threshold` MUST be accepted with `202` and a `Location` header naming an operation resource; it MUST NOT hold the request open.
- **R2.** The `202` body MUST be the operation resource in its current state.
- **R3.** The initiating request MUST follow `idempotency-and-versioning.md` R1: a retry with the same key MUST return the same operation, never start a second one.

### The operation resource

- **R4.** An operation MUST be a first-class resource with an identifier (`02-domain/identifiers.md`), a `state` from `operation_states`, creation and last-update timestamps (`resources-and-requests.md` R18), and a link to what it acts on.
- **R5.** The state MUST move only forward to a terminal state (with the default states: `succeeded`, `failed` or `cancelled`); a terminal state MUST NOT change.
- **R6.** A failed operation MUST carry an error in the format of `responses-and-errors.md` R5 and R6, with a stable `code`; the `GET` that reports it MUST still answer `200`, because the request for the operation succeeded (`responses-and-errors.md` R4).
- **R7.** A succeeded operation MUST link to its result; the result MUST be readable through the normal resource endpoints, not only through the operation.

### Polling

- **R8.** The operation MUST be readable with `GET`, and a non-terminal response MUST give a polling hint as `poll_interval_hint` says.
- **R9.** Reading an operation MUST be subject to the same authorization as the request that started it, and `hide_existence` applies (`responses-and-errors.md` R14).
- **R10.** An operation past `operation_retention` MUST answer `410` with a `code` naming expiry, not `404`.

### Cancellation and completion

- **R11.** Where `cancellation` is offered, it MUST be a sub-resource created with `POST` (`resources-and-requests.md` R5), idempotent in effect, and the operation MUST report cancelled only once work has actually stopped.
- **R12.** Where `completion_notification` adds a callback or event, polling MUST remain available and authoritative; a notification is a hint to poll, not the result.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1, R2 | Contract test per long-running endpoint: `202`, `Location`, operation body | ⬜ scheduled |
| R3 | Integration test: a repeated key returns the same operation | ⬜ scheduled |
| R4–R7 | Operation type with a state machine; unit test that terminal states are final; contract test for the failed shape | ⬜ scheduled |
| R8–R10 | Contract tests for the hint header, another caller's operation, and an expired operation | ⬜ scheduled |
| R11 | Cancellation test: the state changes only after work stops; a repeat is harmless | ⬜ scheduled |
| R12 | Review | ❌ review-only |

## AI guardrails

- A slow operation returns `202` with an operation resource; never hold the request.
- The operation's state only moves forward; terminal states are final.
- A failed operation is still `200` on read, carrying the standard error.
- Give a polling hint; authorize reads like the original request; expired means `410`.
- A retried start with the same key returns the same operation.

## References

- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110) (`202`, `Location`, `Retry-After`)
- `responses-and-errors.md`, `resources-and-requests.md`, `idempotency-and-versioning.md` (this pack)
- `08-reliability/timeouts-retries.md`, `02-domain/identifiers.md`
