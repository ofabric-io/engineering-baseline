---
layer: 09-errors
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Error Handling & Taxonomy

## Purpose

Error categories, stable error codes, how failures are signalled in the project's language, and where errors are translated and logged. How a category maps to a transport's status or exit code is the transport adapter's job; a transport pack supplies the concrete mapping.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `error_categories` | [[error_categories]] | `domain`, `validation`, `authentication`, `authorization`, `not_found`, `conflict`, `rate_limited`, `unavailable`, `internal` (meanings below) | each maps to a handling strategy and a transport status |
| `error_mechanism` | [[error_mechanism]] | exceptions | `error values` or `result types` fit languages without exceptions; mixing mechanisms for one failure mode confuses callers |
| `result_type_usage` | [[result_type_usage]] | only for expected domain failures | applies where `error_mechanism` is exceptions; mixing styles for one failure mode confuses callers |
| `error_code_style` | [[error_code_style]] | SCREAMING_SNAKE, namespaced, append-only | codes are a contract once published |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Where does the single error-code catalogue live, and who may append to it?

## Rules

### Taxonomy

- **R1.** Every error MUST belong to exactly one category in `error_categories`. The meanings of the default categories are in the table after the rules.
- **R2.** Application code MUST NOT raise or return a generic, unclassified error; every error value MUST be an instance of the project's base error type.
- **R3.** The base error type MUST carry: category, code, an `isRetryable` flag (may the caller retry unchanged?), an `isExposable` flag (may the message reach an external party?), a context map and the original cause.
- **R4.** An error's context MUST NOT contain a secret or data in a restricted class (`06-security/sensitive-data.md` R3).

### Failure mechanism

- **R5.** Failures MUST be signalled with `error_mechanism`. Where it is exceptions, a result type MUST be used only for an operation whose failure is a normal, expected outcome, according to `result_type_usage`.
- **R6.** A function MUST NOT signal the same failure mode by two mechanisms (for example both returning a result and raising).
- **R7.** Failures in the `unavailable` and `internal` categories MUST be signalled by the project's failure mechanism, never encoded as a successful result.

### Codes

- **R8.** An error code MUST follow `error_code_style`.
- **R9.** A code MUST be unique, MUST NOT be reused for another meaning, and MUST NOT be renamed or removed once published.
- **R10.** All codes MUST be declared once, in a single catalogue importable by every consumer of the errors.
- **R11.** A new condition MUST receive a new code; changing the meaning of an existing code MUST be treated as a breaking change.

### Propagation

- **R12.** Code that receives an error MUST do exactly one of: propagate it, wrap it in a project error with the original as its cause, or handle it and record why. Ignoring an error, or catching one only to discard it, MUST NOT exist.
- **R13.** An error crossing a layer boundary MUST be wrapped with the original preserved as its cause; within a layer it MUST be propagated unchanged.
- **R14.** Each entry point (a request, a job, a message handler, a command) MUST have exactly one place where uncaught errors are handled and translated.
- **R15.** An error MUST be logged exactly once, at the boundary that handles it, and MUST NOT be logged and propagated (`07-observability/logging.md` R8).

### Translation and exposure

- **R16.** The transport adapter MUST map each error's category and code to the transport's status or exit code, in one mapping. No other component MAY set a transport status.
- **R17.** An error whose `isExposable` flag is false MUST be replaced at the boundary with a generic message plus a correlation identifier.
- **R18.** Stack traces, queries, upstream payloads and internal host names MUST NOT reach an external party.
- **R19.** Retry logic MUST consult the `isRetryable` flag (`08-reliability/timeouts-retries.md` R8).

## Default categories

These apply while `error_categories` is left at its default. A transport document maps each to its own status or exit code.

| Category | Meaning | Usually `isRetryable` | Usually `isExposable` |
| --- | --- | --- | --- |
| `domain` | a business rule refused the operation | no | yes |
| `validation` | the input is invalid | no | yes |
| `authentication` | the actor could not be identified | no | yes, generic |
| `authorization` | the actor may not do this | no | yes, generic |
| `not_found` | the target does not exist for this actor | no | yes |
| `conflict` | state or concurrency prevents the operation | after re-reading | yes |
| `rate_limited` | the caller exceeded a limit | after the stated wait | yes |
| `unavailable` | a dependency is down or the system is overloaded | yes | generic |
| `internal` | a defect or an infrastructure failure | no | no, correlation id only |

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | Base-type design; unit test that every concrete error declares a category | ⬜ scheduled |
| R2 | Lint rule banning generic errors in application code, chosen in `13-technology/` | ⬜ scheduled |
| R3 | Compile-time or unit-test check on the base type | ⬜ scheduled |
| R4 | See `06-security/sensitive-data.md`; PR review | ◐ partial |
| R5 | PR review | ❌ review-only |
| R6 | PR review | ❌ review-only |
| R7 | PR review | ❌ review-only |
| R8 | Catalogue lint | ⬜ scheduled |
| R9 | Catalogue test comparing against the previous release | ⬜ scheduled |
| R10 | Lint for code literals outside the catalogue | ⬜ scheduled |
| R11 | PR review | ❌ review-only |
| R12 | Lint rule for ignored or swallowed errors | ⬜ scheduled |
| R13 | PR review | ❌ review-only |
| R14 | Architecture test: one error handler per entry-point type | ⬜ scheduled |
| R15 | Lint or review for log-and-rethrow | ◐ partial |
| R16 | Unit test: every code has a mapping; lint for status-setting outside the adapter | ⬜ scheduled |
| R17 | Integration test with a non-exposable error | ⬜ scheduled |
| R18 | Integration test asserting response bodies | ⬜ scheduled |
| R19 | Unit test of the retry helper | ⬜ scheduled |

## AI guardrails

- Signal failures with the project's base error type and `error_mechanism`, never a generic one.
- Handling an error means propagating it, wrapping it with the cause, or handling and logging it. Never swallow.
- Log an error once, where it is handled.
- Never reuse, rename or repurpose an error code. Append a new one.
- Never let internals reach an external caller.
- Never set a transport status outside the adapter.

## References

- `07-observability/logging.md`, `08-reliability/timeouts-retries.md`, `06-security/sensitive-data.md`
