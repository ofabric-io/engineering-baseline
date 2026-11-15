---
layer: 07-observability
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Structured Logging

## Purpose

Log format, levels, correlation, content and volume. What must never be logged is decided in `06-security/sensitive-data.md`.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `log_format` | [[log_format]] | structured JSON, one event per line | human-readable formats do not query well |
| `correlation` | [[correlation]] | request id and trace id on every line | without it, logs from one request cannot be joined |
| `required_log_fields` | [[required_log_fields]] | timestamp, level, message, service, version, environment, trace id, span id, request id, actor id | more fields cost storage; fewer cost diagnosability |
| `log_retention` | [[log_retention]] | 30 days in production, 7 in other environments | longer helps investigations and widens exposure; durable records belong in a purpose-built store |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Where do logs go, and who may query them?

## Rules

### Format

- **R1.** Logs MUST be emitted in `log_format` in every environment, including local development; a local pretty-printer MAY render it but the emitted format MUST NOT change.
- **R2.** Application code MUST log through the shared logger and MUST NOT write to standard output or error directly, because that bypasses redaction (`06-security/sensitive-data.md` R6).
- **R3.** Every log line MUST carry `required_log_fields`, populated from context automatically and not by the call site.
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

- **R9.** Each unit of work (a request, a job, a message handled) MUST emit one summary line at completion with its kind, name, outcome, duration and the correlation fields. The name MUST be a template, never a resolved value containing identifiers.
- **R10.** A log message MUST be a static string; variable parts MUST go in structured fields.
- **R11.** Every rule in `06-security/sensitive-data.md` applies to logs; redaction is global and automatic.

### Volume and retention

- **R12.** `error` and `warn` lines MUST NOT be sampled. High-volume `info` paths MAY be sampled, with the sampling rate recorded on the line.
- **R13.** Logs MUST be retained for `log_retention`; anything needed longer MUST be stored in a purpose-built durable store, not in logs.

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

## AI guardrails

- Use the shared logger. Never print directly.
- Log messages are static strings; put variables in fields.
- Log an error once, where it is handled. Never log and rethrow.
- Invalid input is not an `error`.
- Never log secrets or personal data.

## References

- [OpenTelemetry Logs](https://opentelemetry.io/docs/specs/otel/logs/)
- [RFC 3339](https://www.rfc-editor.org/rfc/rfc3339)
- `05-protocols/rfc-profile.md`, `06-security/sensitive-data.md`, `09-errors/taxonomy.md`
