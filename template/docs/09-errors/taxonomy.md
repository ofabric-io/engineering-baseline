---
layer: 09-errors
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Error Handling & Taxonomy

## Purpose

Error categories, stable error codes, when to raise and when to return a result, and where errors are translated and logged. How a category maps to a transport's status or exit code is the transport adapter's job; a transport pack supplies the concrete mapping.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `error_categories` | [[error_categories]] | domain, application, infrastructure, transport | each maps to a handling strategy |
| `result_type_usage` | [[result_type_usage]] | only for expected domain failures | mixing styles for one failure mode confuses callers |
| `error_code_style` | [[error_code_style]] | SCREAMING_SNAKE, namespaced, append-only | codes are a contract once published |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Where does the single error-code catalogue live, and who may append to it?
- [ ] Which expected outcomes are modelled as results rather than raised errors?

## Rules

### Taxonomy

- **R1.** Every error MUST belong to exactly one category in `error_categories`. With the default categories:
  - domain: an invariant or state rule was violated
  - application: a use case cannot proceed (not found, not permitted)
  - infrastructure: an external dependency failed
  - transport: an input was malformed before reaching any use case
- **R2.** Domain and application code MUST NOT raise a generic, unclassified error; every raised value MUST be an instance of the project's base error type.
- **R3.** The base error type MUST carry: category, code, a `retryable` flag (may the caller retry unchanged?), an `exposable` flag (may the message reach an external party?), a context map and the original cause.
- **R4.** An error's context MUST NOT contain a secret or data in a restricted class (`06-security/sensitive-data.md` R3).

### Exceptions and results

- **R5.** Raised errors are the default failure mechanism. A result type MUST be used only for an operation whose failure is a normal, expected outcome, according to `result_type_usage`.
- **R6.** A function that returns a result MUST NOT also raise for the same failure mode.
- **R7.** Infrastructure and transport failures MUST be raised, never returned as results.

### Codes

- **R8.** An error code MUST follow `error_code_style`: by default SCREAMING_SNAKE, namespaced by area.
- **R9.** A code MUST be unique, MUST NOT be reused for another meaning, and MUST NOT be renamed or removed once published.
- **R10.** All codes MUST be declared once, in a single catalogue importable by every consumer of the errors.
- **R11.** A new condition MUST receive a new code; changing the meaning of an existing code MUST be treated as a breaking change.

### Propagation

- **R12.** A catch block MUST do exactly one of: rethrow, wrap in a project error with the original as its cause, or handle the error and record why. An empty catch, or one that only swallows, MUST NOT exist.
- **R13.** An error crossing a layer boundary MUST be wrapped with the original preserved as its cause; within a layer it MUST be rethrown unchanged.
- **R14.** Each entry point (a request, a job, a message handler, a command) MUST have exactly one place where uncaught errors are handled and translated.
- **R15.** An error MUST be logged exactly once, at the boundary that handles it, and MUST NOT be logged and rethrown (`07-observability/logging.md` R8).

### Translation and exposure

- **R16.** The transport adapter MUST map each error's category and code to the transport's status or exit code, in one mapping. No other component MAY set a transport status.
- **R17.** An error whose `exposable` flag is false MUST be replaced at the boundary with a generic message plus a correlation identifier.
- **R18.** Stack traces, queries, upstream payloads and internal host names MUST NOT reach an external party.
- **R19.** Retry logic MUST consult the `retryable` flag (`08-reliability/timeouts-retries.md` R8).

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | Base-type design; unit test that every concrete error declares a category | ⬜ scheduled |
| R2 | Lint rule banning generic raises in domain and application code, chosen in `13-technology/` | ⬜ scheduled |
| R3 | Compile-time or unit-test check on the base type | ⬜ scheduled |
| R4 | See `06-security/sensitive-data.md`; PR review | ◐ partial |
| R5 | PR review | ❌ review-only |
| R6 | PR review | ❌ review-only |
| R7 | PR review | ❌ review-only |
| R8 | Catalogue lint | ⬜ scheduled |
| R9 | Catalogue test comparing against the previous release | ⬜ scheduled |
| R10 | Lint for code literals outside the catalogue | ⬜ scheduled |
| R11 | PR review | ❌ review-only |
| R12 | Lint rule for empty or swallowing catch blocks | ⬜ scheduled |
| R13 | PR review | ❌ review-only |
| R14 | Architecture test: one error handler per entry-point type | ⬜ scheduled |
| R15 | Lint or review for log-and-rethrow | ◐ partial |
| R16 | Unit test: every code has a mapping; lint for status-setting outside the adapter | ⬜ scheduled |
| R17 | Integration test with a non-exposable error | ⬜ scheduled |
| R18 | Integration test asserting response bodies | ⬜ scheduled |
| R19 | Unit test of the retry helper | ⬜ scheduled |

## AI guardrails

- Raise project errors, never a generic one.
- A catch block rethrows, wraps with the cause, or handles and logs. Never swallow.
- Log an error once, where it is handled.
- Never reuse, rename or repurpose an error code. Append a new one.
- Never let internals reach an external caller.
- Never set a transport status outside the adapter.

## References

- `07-observability/logging.md`, `08-reliability/timeouts-retries.md`, `06-security/sensitive-data.md`
