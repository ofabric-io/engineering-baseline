---
layer: packs/events
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Delivery, Outbox & Ordering

## Purpose

How events are recorded and published reliably, what delivery guarantee holds, and what consumers must tolerate. Delivery to external HTTP endpoints adds obligations beyond these; they are not restated here.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `publish_mechanism` | [[publish_mechanism]] | transactional outbox: the event row commits with the state change and a separate drain dispatches it | Publishing directly to a broker is simpler and loses or duplicates events when the state change and the publish disagree |
| `event_delivery_guarantee` | [[event_delivery_guarantee]] | at-least-once; consumers deduplicate on event `id` | At-most-once loses events; exactly-once does not exist across a network boundary |
| `ordering` | [[ordering]] | per entity (`subject`) only | Global ordering serialises everything and does not scale |
| `dedupe_store` | [[dedupe_store]] | the same durable store as the consumer's state, written atomically with its effect | A cache is faster and forgets, which turns a duplicate into a repeated effect |
| `dead_letter_alert` | [[dead_letter_alert]] | alert when any dead-lettered event has waited longer than 24 hours, around the clock | A tighter threshold wakes people for transient faults; a looser one hides stuck consumers |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] How long are processed outbox rows retained before archival? (They are the delivery audit trail; see R5.)
- [ ] Which consumers are in-process and which are remote, and does each remote consumer have its own retry schedule?

## Rules

### Recording and draining

- **R1.** Every event publish tied to a state change MUST follow `publish_mechanism`; with the default, the outbox row MUST be inserted in the same transaction as the state change, so both commit or neither does.
- **R2.** An event MUST NOT be published directly from a request handler, use case or repository when `publish_mechanism` is the outbox; publishing outside the transaction reintroduces the dual-write problem.
- **R3.** A drain process MUST dispatch recorded events to consumers, and MUST be deployable and scalable independently of the request path.
- **R4.** Concurrent drains MUST claim work so that no row is dispatched twice concurrently (a row-level claim or lease; mechanism chosen in `13-technology/`).
- **R5.** A dispatched row MUST be marked with its outcome and MUST NOT be deleted by the drain. The recorded events are the delivery audit trail, retained per the open decision above.

### Guarantees

- **R6.** The project MUST state its delivery guarantee as `event_delivery_guarantee`; under the default, any component MUST assume an event can arrive more than once.
- **R7.** Every consumer MUST be idempotent (`08-reliability/concurrency-and-idempotency.md`).
- **R8.** Every consumer MUST deduplicate on the event `id` using `dedupe_store`, writing the dedupe record atomically with the effect it guards.
- **R9.** Ordering MUST be guaranteed as `ordering` says; with the default, rows for the same `subject` are dispatched in recording order. A consumer MUST NOT assume any ordering the parameter does not give.
- **R10.** A consumer MUST tolerate arrival out of order across entities, and MUST tolerate an event about a state it has already advanced past: it checks current state, it does not assume sequence.

### Retries and failure

- **R11.** Redelivery MUST follow `08-reliability/timeouts-retries.md`: capped attempts, exponential backoff with full jitter.
- **R12.** An event that exhausts its attempts MUST be moved to a dead-letter store, not dropped and not retried forever.
- **R13.** Every dead-lettered event MUST be visible to operators, replayable by a human, and counted by a metric with an alert as `dead_letter_alert` says (`07-observability/metrics-and-tracing.md`).
- **R14.** A failing delivery MUST NOT block later events for other entities or other consumers; one broken consumer MUST NOT cause head-of-line blocking.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1, R2 | Architecture test: the publisher is reachable only from the recording component; integration test that a rollback leaves no row | ⬜ scheduled |
| R3, R4 | Drain implementation; integration test with two concurrent drains | ⬜ scheduled |
| R5 | No delete path for processed rows outside the archival job | ⬜ scheduled |
| R6–R8 | Shared consumer base that deduplicates on `id`; a replay test per consumer | ⬜ scheduled |
| R9, R10 | Drain ordering test; test delivering events out of order | ⬜ scheduled |
| R11, R12 | Test asserting the attempt cap, backoff shape and dead-letter transition | ⬜ scheduled |
| R13 | Dead-letter store, replay tool, depth metric and alert rule | ⬜ scheduled |
| R14 | Test with one permanently failing consumer; other deliveries continue | ⬜ scheduled |

## AI guardrails

- Record the event in the same transaction as the state change; never publish from a handler.
- Never delete a dispatched row; mark its outcome.
- Assume at-least-once: consumers are idempotent and deduplicate on `id` in `dedupe_store`.
- Order is per `subject` only. Never assume global order; check current state.
- Retry with capped backoff and jitter, then dead-letter. Dead letters are visible, replayable and alerted.
- One failing consumer never blocks the others.

## References

- [CloudEvents 1.0 specification](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md)
- `event-model.md`, `schema-evolution.md` (this pack)
- `08-reliability/timeouts-retries.md`, `08-reliability/concurrency-and-idempotency.md`, `07-observability/metrics-and-tracing.md`, `03-architecture/system.md`
