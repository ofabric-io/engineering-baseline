---
layer: 08-reliability
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Timeouts, Retries & Degradation

## Purpose

Every outbound call has a timeout, per-request retries are bounded with backoff and jitter, supervisory reconnect loops are bounded in pace and observable, failing dependencies are isolated, and degradation is designed rather than accidental.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `default_timeout` | [[default_timeout]] | set explicitly per call, by dependency class (data store, cache, internal service, third-party service), recorded in this document; none unbounded | a missing timeout turns a slow dependency into an outage |
| `retry_policy` | [[retry_policy]] | capped attempts, exponential backoff with jitter, only for idempotent operations | retry storms |
| `jitter_strategy` | [[jitter_strategy]] | full jitter: each wait is drawn uniformly between zero and the backoff ceiling | decorrelated or equal jitter keep a minimum wait and spread load less evenly |
| `reconnect_backoff_ceiling` | [[reconnect_backoff_ceiling]] | the longest wait between reconnect attempts is 60 seconds | a low ceiling recovers fast and hammers a dependency that is down; a high one recovers slowly |
| `max_attempts` | [[max_attempts]] | 3, including the first attempt | more attempts raise success and load on a struggling dependency |
| `circuit_breaker_scope` | [[circuit_breaker_scope]] | by dependency kind: every request-path dependency outside the process's own trust zone; none for a connection kept by a supervisory loop (R17) or for a batch run, which fails the run instead | more breakers add state to tune; none lets one dependency exhaust every caller |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] For each operation, the behaviour when its dependency is down (R15).

## Rules

### Timeouts

- **R1.** Every outbound call MUST set an explicit timeout; a default inherited from a library MUST NOT be relied on.
- **R2.** The timeout for each dependency class MUST be recorded in this document under `default_timeout`, and MAY be overridden per call with a stated reason.
- **R3.** A deadline MUST propagate: time already spent MUST be subtracted from every downstream budget.
- **R4.** Background jobs and message handlers MUST carry and honour a deadline too.

### Retries

- **R5.** Every per-request retry loop MUST have a maximum attempt count, `max_attempts` by default. A supervisory reconnect loop is governed by R17 to R19 instead.
- **R6.** Retries MUST use exponential backoff with the jitter in `jitter_strategy`.
- **R7.** Only an idempotent operation MAY be retried automatically. A non-idempotent operation MUST NOT be retried unless the receiver honours an idempotency key that is sent (`08-reliability/concurrency-and-idempotency.md` R7).
- **R8.** A failure that will not change on retry (invalid input, authorization failure, permanent not-found) MUST NOT be retried; the `isRetryable` property of the error decides (`09-errors/taxonomy.md` R3).
- **R9.** When a dependency states how long to wait before retrying, the caller MUST honour it instead of applying its own backoff.

### Circuit breakers

- **R10.** Every dependency within `circuit_breaker_scope` MUST sit behind a circuit breaker, chosen per dependency kind.
- **R11.** An open circuit MUST fail fast with a typed error, never a timeout.
- **R12.** An open circuit MUST NOT be reported to a user or caller as a business outcome. "Dependency unreachable" and "request rejected on its merits" are different facts.
- **R13.** Breaker state changes MUST be logged at `warn` and exposed as a metric.

### Degradation

- **R14.** A queue-and-retry path MUST have a dead-letter destination and an alert on its depth.
- **R15.** Behaviour when a dependency is down MUST be decided per operation, recorded, and one of: fail fast, serve a stale or reduced result, or queue and retry.
- **R16.** An operation that is queued for retry MUST be idempotent, and the caller MUST be told the operation is pending, not that it succeeded.

### Supervisory reconnect loops

- **R17.** A long-running component that must keep a connection to a dependency alive (a stream, a control channel, a subscription) MAY retry without a maximum attempt count, provided each wait uses exponential backoff with `jitter_strategy` up to `reconnect_backoff_ceiling` and the backoff resets after a successful connection. _(applies to: service, daemon)_
- **R18.** A supervisory reconnect loop MUST expose a health signal and a metric for time since last success and consecutive failures, and MUST log state changes (lost, restored), not each attempt. _(applies to: service, daemon)_
- **R19.** A supervisory reconnect loop MUST NOT block other work, and the component MUST define what it does while disconnected (R15). _(applies to: service, daemon)_

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | Shared client wrapper that requires a timeout; lint for raw clients, chosen in `13-technology/` | ⬜ scheduled |
| R2 | Document completeness at ratification | ❌ review-only |
| R3 | Integration test of deadline propagation | ⬜ scheduled |
| R4 | Job framework configuration test | ⬜ scheduled |
| R5 | Shared retry helper; lint for hand-written loops | ⬜ scheduled |
| R6 | Unit test of the retry helper | ⬜ scheduled |
| R7 | PR review; retry helper requires an idempotency declaration | ◐ partial |
| R8 | Unit test per error category | ⬜ scheduled |
| R9 | Unit test of the retry helper | ⬜ scheduled |
| R10 | Shared client wrapper | ⬜ scheduled |
| R11 | Fault-injection test | ⬜ scheduled |
| R12 | PR review | ❌ review-only |
| R13 | Log and metric assertion in the breaker test | ⬜ scheduled |
| R14 | Queue configuration review; alert rule review | ❌ review-only |
| R15 | Production-readiness review (`15-delivery/production-readiness.md`) | ❌ review-only |
| R16 | PR review | ❌ review-only |
| R17 | Unit test of the reconnect helper | ⬜ scheduled |
| R18 | Metric and log assertion in the reconnect test | ⬜ scheduled |
| R19 | Fault-injection test with the dependency down | ⬜ scheduled |

## AI guardrails

- Never make an outbound call without an explicit timeout.
- Never write a retry loop by hand; use the shared helper.
- Never retry a non-idempotent operation without an idempotency key.
- Never retry a rejection that will not change.
- A reconnect loop may be unbounded but never unpaced: backoff, jitter, and a visible failure signal.
- Never present "dependency down" as a business decline.

## References

- [AWS Architecture Blog: Exponential Backoff and Jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)
- `08-reliability/concurrency-and-idempotency.md`, `09-errors/taxonomy.md`, `15-delivery/production-readiness.md`
