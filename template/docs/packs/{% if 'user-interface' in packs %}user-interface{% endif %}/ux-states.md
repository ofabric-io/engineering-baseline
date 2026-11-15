---
layer: packs/user-interface
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Interface States & Error Presentation

## Purpose

Every asynchronous surface handles all of its states explicitly, errors are presented consistently, and irreversible actions are protected. Stated for any platform (web, mobile, desktop).

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `async_states` | [[async_states]] | loading, empty, error, success, partial | a surface missing one shows a blank or a spinner forever |
| `error_presentation` | [[error_presentation]] | keyed off stable error codes; unknown codes show a generic message plus a copyable request id | free-text server messages leak internals and cannot be translated |
| `irreversible_actions` | [[irreversible_actions]] | listed by the bootstrap; never optimistic, never retried by a plain re-click, confirmed when destructive | — |
| `crash_containment` | [[crash_containment]] | a rendering failure is contained to its view, never blanking or closing the application | — |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] How does the interface behave offline or on a stale connection: block, queue or show cached data?
- [ ] Which user-visible failures are reported automatically to the team, and which only through the request id?

## Rules

### States

- **R1.** Every surface that loads or changes data asynchronously MUST define each state in `async_states` and render a distinct view for each.
- **R2.** A loading state MUST NOT shift the surrounding layout when the content arrives.
- **R3.** An empty state MUST distinguish "nothing exists yet" from "nothing matches the current filter" and MUST offer the next action where one exists.
- **R4.** An error state MUST offer a recovery action (retry, go back, contact support) appropriate to the error.
- **R5.** A partial state MUST show what succeeded and what failed; it MUST NOT present a partial result as complete.

### Errors

- **R6.** An error MUST be presented from its stable error code (`09-errors/taxonomy.md`) through the copy catalog. The interface MUST NOT display a server-supplied free-text message.
- **R7.** An unknown code MUST show a generic message and the request identifier.
- **R8.** Every presented error that carries a request identifier MUST show it in a form the user can copy in one action.
- **R9.** A server-side validation error MUST be shown on the field it names and summarised for assistive technology (`accessibility.md` R11, R12).
- **R10.** An error MUST NOT expose a stack trace, internal identifier or query.

### Irreversible actions

- **R11.** An action in `irreversible_actions` MUST NOT be applied optimistically; the interface MUST show it as done only after the server confirms.
- **R12.** While such an action is in flight its control MUST be disabled, and a retry MUST reuse the original attempt's idempotency key (`08-reliability/concurrency-and-idempotency.md`), so a second click cannot repeat it.
- **R13.** A destructive action MUST require explicit confirmation that names the object and the consequence.

### Containment

- **R14.** A rendering failure MUST be contained per `crash_containment`. The fallback view MUST offer a reload or restart of the view and show the request or trace identifier when one exists.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | per-surface test asserting each state renders; PR review | ⬜ scheduled |
| R2 | visual regression or layout-shift measurement in end-to-end tests | ⬜ scheduled |
| R3 | PR review | ❌ review-only |
| R4 | PR review | ❌ review-only |
| R5 | PR review; component tests for partial results | ⬜ scheduled |
| R6 | lint rule rejecting rendering of server message fields; catalog keys exist per code | ⬜ scheduled |
| R7 | component test with an unmapped code | ⬜ scheduled |
| R8 | component test of the error view | ⬜ scheduled |
| R9 | end-to-end test of a failing form | ⬜ scheduled |
| R10 | PR review; end-to-end assertion on error views | ⬜ scheduled |
| R11 | PR review; test that the UI does not change before the response | ⬜ scheduled |
| R12 | end-to-end double-click test | ⬜ scheduled |
| R13 | PR review | ❌ review-only |
| R14 | test forcing a render failure in one view | ⬜ scheduled |

## AI guardrails

- Build every state of an asynchronous surface, not just success.
- Show errors from their code and the catalog; never print the server's message.
- Always show the request id on an error.
- Never update the interface optimistically for an irreversible action.
- Disable the control while an irreversible action is in flight.

## References

- `09-errors/taxonomy.md`
- `08-reliability/concurrency-and-idempotency.md`
- `accessibility.md`, `content-and-i18n.md`
