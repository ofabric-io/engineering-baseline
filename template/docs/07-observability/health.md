---
layer: 07-observability
status: proposed # not-started | proposed | in-progress | ratified
applies-to: [service, daemon]
owner: TBD
last-reviewed: never
---

# Health & Readiness

## Purpose

Liveness, readiness and start-up signals for any long-running process, what each may and may not check, and how a process shuts down. It applies to `service` and `daemon` components; a command-line program, a library or a batch job has no health signals.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `drain_timeout` | [[drain_timeout]] | 30 seconds | long drains slow deploys; short ones drop work |
| `critical_dependencies` | [[critical_dependencies]] | the single store without which no request can be served correctly | a longer list makes readiness flap during partial outages |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] How are the signals exposed and consumed (endpoint, file, command)? Decided in `13-technology/`.

## Rules

### Signals

- **R1.** A long-running process MUST expose three distinct signals, and they MUST NOT be conflated: _(applies to: service, daemon)_

  | Signal | Answers | Failing means |
  | --- | --- | --- |
  | liveness | is the process alive? | restart it |
  | readiness | can it serve work? | stop sending work, do not restart |
  | start-up | has it finished starting? | wait, do not restart yet |

- **R2.** Liveness MUST NOT check any dependency.
- **R3.** Readiness MUST check only `critical_dependencies`.
- **R4.** A failure of a non-critical dependency MUST NOT fail readiness; it MUST raise an alert instead.
- **R5.** Health signals that are reachable by untrusted parties MUST NOT disclose version, dependency detail, hostnames or error text; at most a pass or fail and per-check booleans.
- **R6.** Build and version information MUST be exposed separately and MUST require authentication.
- **R7.** Each check MUST have its own timeout shorter than the caller's probe timeout (`08-reliability/timeouts-retries.md` R1).

### Shutdown

- **R8.** On a termination signal the process MUST: fail readiness immediately, stop accepting new work, finish in-flight work within `drain_timeout`, then exit.
- **R9.** Consumers and job workers MUST stop before the component that accepts requests.
- **R10.** Work unfinished at the end of the drain MUST be logged at `warn` with enough context to reconcile it.
- **R11.** Readiness MUST fail at the start of shutdown, not the end.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | Integration test of the three signals | ⬜ scheduled |
| R2 | Test with every dependency down: liveness still passes | ⬜ scheduled |
| R3 | Test with a non-critical dependency down | ⬜ scheduled |
| R4 | Alert rule review | ❌ review-only |
| R5 | Response-content test | ⬜ scheduled |
| R6 | Access test | ⬜ scheduled |
| R7 | Configuration review | ❌ review-only |
| R8 | Shutdown integration test | ⬜ scheduled |
| R9 | Shutdown-order test | ⬜ scheduled |
| R10 | Log assertion in the shutdown test | ⬜ scheduled |
| R11 | Shutdown integration test | ⬜ scheduled |

## AI guardrails

- Liveness checks nothing external. Ever.
- Readiness checks only the critical dependencies.
- Never put version or error text in an unauthenticated health response.
- On shutdown: fail readiness first, drain, then stop.

## References

- `08-reliability/timeouts-retries.md`, `07-observability/logging.md`
