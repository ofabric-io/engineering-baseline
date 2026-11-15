---
layer: packs/events
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Event Model & Naming

## Purpose

What an event is, its envelope, its name, and what it may carry. Reliable delivery is in `delivery-and-outbox.md`; changing a schema is in `schema-evolution.md`.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `event_kinds` | [[event_kinds]] | two kinds: domain (internal) and integration (published outward) | Publishing domain events directly is less work and couples every consumer to internal concepts; a project with no external consumers may declare domain events only |
| `envelope` | [[envelope]] | CloudEvents 1.0, JSON format | A bespoke envelope removes a dependency and loses tooling and a shared vocabulary |
| `naming` | [[naming]] | `<org>.<context>.<entity>.<past-tense-verb>.v<n>` | A shorter name is easier to type; the full form avoids collisions across contexts and organisations |
| `event_id_format` | [[event_id_format]] | a time-ordered UUID (RFC 9562 version 7) | Random UUIDs avoid leaking time; ordered ones index better |
| `context_attributes` | [[context_attributes]] | isolation key (if the project has an isolation unit), `correlationid`, `causationid` | Fewer attributes are cheaper; without them a cross-service causal chain cannot be reconstructed |
| `integration_event_content` | [[integration_event_content]] | identifiers plus the changed fields only; no personal data, no secrets, and no field class the project lists as withheld | Richer payloads save consumers a fetch and widen what leaks if a consumer is compromised; a project whose consumers are all trusted may allow more |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Which field classes are withheld from integration events (`integration_event_content`)? Name them; "sensitive" is not testable.
- [ ] What is the `source` attribute's format, and who owns the registry of sources?
- [ ] Does any consumer outside the project's control receive events? If yes, `integration_event_content` applies to everything they receive.

## Rules

### Kinds

- **R1.** A domain event MUST stay inside the project; it MAY reference internal identifiers and is not a contract with anyone outside.
- **R2.** An integration event is a published contract: it MUST be versioned and MUST NOT be changed in place (`schema-evolution.md`).
- **R3.** A domain event MUST NOT be published outward directly. An integration event MUST be produced from a domain event by an explicit mapping, so renaming an internal concept does not break a consumer.
- **R4.** The project MUST declare which of the kinds in `event_kinds` it uses; a project that declares domain events only is exempt from R2, R3 and R14.

### Envelope

- **R5.** Every event MUST use `envelope`; with the default, the CloudEvents attributes `id`, `source`, `type`, `specversion` and `time` are required, plus `subject` naming the entity acted on.
- **R6.** `id` MUST follow `event_id_format` and MUST be unique per event; it is the consumers' deduplication key (`delivery-and-outbox.md` R8).
- **R7.** `time` MUST be RFC 3339 in UTC (`02-domain/time.md`).
- **R8.** Every event MUST carry the attributes in `context_attributes`. `correlationid` MUST remain unchanged across the whole causal chain and `causationid` MUST name the immediate cause; both are required when listed.

### Naming

- **R9.** An event `type` MUST match `naming`, including the version segment.
- **R10.** The verb in a `type` MUST be past tense: an event records something that happened. A present-tense name is a command.
- **R11.** Names MUST use the project's vocabulary (`02-domain/glossary.md`).

### Payload

- **R12.** An event MUST be thin: identifiers plus the fields that changed, plus enough context to decide whether to act. A full state snapshot MUST NOT be published.
- **R13.** A consumer needing more MUST fetch the resource; that read is authoritative and the event is a notification.
- **R14.** An integration event MUST NOT carry anything outside `integration_event_content`, and MUST NOT carry personal data or a secret (`06-security/sensitive-data.md`) whatever that parameter says.
- **R15.** A domain event MAY carry any internal value its consumers need, subject to `06-security/sensitive-data.md`.

### Emission

- **R16.** An event MUST be emitted by the component that owns the state change, and recorded in the same transaction as that change (`delivery-and-outbox.md` R1).
- **R17.** An event MUST NOT be emitted for a state change that did not happen: no speculative or "about to" events.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1–R4 | Module-boundary rule plus an architecture test: no domain event type appears in an outward payload builder (tool chosen in `13-technology/`) | ⬜ scheduled |
| R5–R8 | Envelope defined as a schema; a missing attribute fails validation at emission | ⬜ scheduled |
| R9, R10 | Event-name lint against `naming` and a past-tense word list | ⬜ scheduled |
| R11 | Glossary-term check (`scripts/check.mjs` forbidden-terms) over event names | ◐ partial |
| R12, R13 | Review; schema size review | ❌ review-only |
| R14 | Contract test: every integration-event schema is asserted free of the withheld field classes and of fields on the sensitive-data list | ⬜ scheduled |
| R15 | Review | ❌ review-only |
| R16 | Integration test: a rolled-back transaction leaves no recorded event | ⬜ scheduled |
| R17 | Review | ❌ review-only |

## AI guardrails

- Domain events are internal. Integration events are a contract; build one from a domain event, never publish the domain event.
- Use `envelope`, `event_id_format` and every attribute in `context_attributes`. Correlation and causation are different.
- Names match `naming`, past tense, with a version.
- Events are thin: ids plus what changed. No snapshots.
- Nothing outside `integration_event_content` in an integration event; never personal data or secrets.
- Record the event in the same transaction as the change. Never emit for a change that did not happen.

## References

- [CloudEvents 1.0 specification](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md)
- [RFC 9562 — UUIDs](https://www.rfc-editor.org/rfc/rfc9562), [RFC 3339 — Date and Time on the Internet](https://www.rfc-editor.org/rfc/rfc3339)
- `delivery-and-outbox.md`, `schema-evolution.md` (this pack)
- `02-domain/glossary.md`, `02-domain/identifiers.md`, `02-domain/time.md`, `06-security/sensitive-data.md`, `03-architecture/system.md`
