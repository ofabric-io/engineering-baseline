---
pack: events
version: 0.1.0
requires: []
amends:
  - 05-protocols/rfc-profile.md  # adds CloudEvents, RFC 9562 (event ids) and RFC 3339 (event time) to the adopted standards
documents:
  - event-model.md  # Event Model & Naming
  - delivery-and-outbox.md  # Delivery, Outbox & Ordering
  - schema-evolution.md  # Event Schema Evolution
---

# Pack: events

Standards for projects that publish and consume events, inside the system or to others.
Documents in this folder depend on the core layers; no core document links here.

## What it adds to the core

- **Standards profile.** A project with this pack adds CloudEvents 1.0 to `core_standards` in
  `05-protocols/rfc-profile.md`.
- **Reliability.** `delivery-and-outbox.md` applies the idempotency and retry rules of
  `08-reliability/` to messaging; it adds recording-with-the-state-change, dead-lettering and
  ordering.

## Parameters worth deciding first

`event_kinds` (domain only, or integration events too), `integration_event_content` (what may
leave the system), `naming` prefix, and `ordering`.

## Bootstrap

The bootstrap asks this pack's parameters in its own section of `bootstrap/questionnaire.md`.
