---
layer: 07-observability
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Structured Logging

## Purpose

Log format, levels, correlation, content and volume. What must never be logged is decided in `06-security/sensitive-data.md`. A program's product output (what a command-line program prints as its result) is not logging; R14 says where the line falls.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `log_format` | [[log_format]] | structured JSON, one event per line | human-readable formats do not query well |
| `correlation` | [[correlation]] | request id and trace id on every line | without it, logs from one request cannot be joined |
| `required_log_fields` | [[required_log_fields]] | per component kind. Every kind: timestamp, level, message, component, version, environment. `service` and `daemon` add trace id and span id; a `service` adds request id; a `batch` adds job id and run id; a `cli` adds command name. Actor id is added wherever an actor exists. A `library` logs through its host and adds nothing | more fields cost storage; fewer cost diagnosability |
| `log_retention` | [[log_retention]] | 30 days in production, 7 in other environments | longer helps investigations and widens exposure; durable records belong in a purpose-built store |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Where do logs go, and who may query them?

## Rules

### Format

- **R1.** Logs MUST be emitted in `log_format` in every environment, including local development; a local pretty-printer MAY render it but the emitted format MUST NOT change.
- **R2.** Application code MUST log through the shared logger and MUST NOT write to standard output or error directly, because that bypasses redaction (`06-security/sensitive-data.md` R6).
- **R3.** Every log line MUST carry the `required_log_fields` for its component kind, populated from context automatically and not by the call site. A field whose subject does not exist for that line (an actor id on work no actor started) MUST be omitted, not filled with a placeholder.
- **R4.** Timestamps MUST follow RFC 3339 in UTC (`05-protocols/rfc-profile.md` R6).

### Levels

- **R5.** The levels MUST mean the following and MUST NOT be used otherwise:

  | Level | Means |
  | --- | --- |
  | `error` | an unexpected failure or a broken invariant; someone should look |
  | `warn` | degraded but handled: a retry succeeded, a fallback ran |
  | `info` | deliberate events, including one summary line per unit of work |
  | `debug` | off in production; enabled by configuration for a narrow scope |

- **R6.** A failure caused by invalid input from a caller MUST NOT be logged at `error`.
- **R7.** An expected outcome (a documented business result such as a rejected request) MUST NOT be logged at `error`.
- **R8.** An error MUST NOT be logged and rethrown; it MUST be logged once, where it is handled (`09-errors/taxonomy.md` R15).

### Content

- **R9.** Each unit of work (a request, a job, a message handled) MUST emit one summary line at completion with its kind, name, outcome, duration and the correlation fields, except where R12 allows a high-volume path to sample or aggregate. The name MUST be a template, never a resolved value containing identifiers.
- **R10.** A log message MUST be a static string; variable parts MUST go in structured fields.
- **R11.** Every rule in `06-security/sensitive-data.md` applies to logs; redaction is global and automatic.

### Volume and retention

- **R12.** `error` and `warn` lines MUST NOT be sampled. High-volume `info` paths, including the per-unit summary line of a high-volume data path, MAY be sampled or replaced by an aggregated summary per interval, with the sampling rate or interval recorded on the line.
- **R13.** Logs MUST be retained for `log_retention`; anything needed longer MUST be stored in a purpose-built durable store, not in logs.

### Scope

- **R14.** Output that is a program's product (a result written to standard output for a user or another program) is not logging and MUST NOT go through the logger; diagnostics MUST go through the logger or to standard error, never mixed into product output. Product output remains subject to `06-security/sensitive-data.md`.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | Logger configuration test | ⬜ scheduled |
| R2 | Lint rule banning direct output calls, chosen in `13-technology/` | ⬜ scheduled |
| R3 | Test asserting required fields on a sample line | ⬜ scheduled |
| R4 | Test asserting timestamp format | ⬜ scheduled |
| R5 | PR review | ❌ review-only |
| R6 | PR review; test per error category | ◐ partial |
| R7 | PR review | ❌ review-only |
| R8 | Lint or review (`09-errors/taxonomy.md`) | ◐ partial |
| R9 | Test of the summary-line middleware | ⬜ scheduled |
| R10 | Lint rule against interpolated messages | ⬜ scheduled |
| R11 | See `06-security/sensitive-data.md` | ⬜ scheduled |
| R12 | Logger configuration review | ❌ review-only |
| R13 | Log-store retention configuration | ⬜ scheduled |
| R14 | Integration test comparing stdout with log output | ⬜ scheduled |

## AI guardrails

- Use the shared logger. Never print directly.
- Log messages are static strings; put variables in fields.
- Log an error once, where it is handled. Never log and rethrow.
- Invalid input is not an `error`.
- Never log secrets or personal data.
- Product output on stdout is not a log line; keep diagnostics out of it.

## References

- [OpenTelemetry Logs](https://opentelemetry.io/docs/specs/otel/logs/)
- [RFC 3339](https://www.rfc-editor.org/rfc/rfc3339)
- `05-protocols/rfc-profile.md`, `06-security/sensitive-data.md`, `09-errors/taxonomy.md`
