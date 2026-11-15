---
layer: packs/events
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Event Schema Evolution

## Purpose

How event schemas change without breaking consumers, including consumers whose code the project cannot deploy. The schema language and generation tooling are a technology choice recorded in `13-technology/`, not here.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `schema_source_of_truth` | [[schema_source_of_truth]] | one machine-readable schema per event type, in a dedicated contracts location; published artefacts are generated from it | Hand-maintained duplicates drift; generation needs tooling chosen in `13-technology/` |
| `parallel_publish_period` | [[parallel_publish_period]] | 90 days | Longer eases slow consumers and doubles producer output; first-party-only events can use less |
| `compatibility_check` | [[compatibility_check]] | CI compares each schema with the last released one and fails on a change outside R4 | A manual review is cheaper to set up and misses subtle breaks |
| `closed_set_policy` | [[closed_set_policy]] | a new value in a closed set requires a new version, unless the set was published with a documented "unknown" branch | Open sets from day one avoid versions and push defensive code onto every consumer |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Where are published schemas served to external consumers, and who owns that page?
- [ ] Which event types are integration events (the ones R2 and R9 bind) and which are internal?

## Rules

### Where schemas live

- **R1.** Every event type MUST have a schema that follows `schema_source_of_truth`.
- **R2.** An integration event MUST NOT be sent unless its schema is published to its consumers.
- **R3.** A published schema MUST NOT be hand-written alongside its source; it MUST be generated from it.

### What may change

- **R4.** Within a version, only backward-compatible additions are permitted:

  | Change | Allowed in place? |
  | --- | --- |
  | add an optional field | yes |
  | add a new event type | yes |
  | make a required field optional | no |
  | remove or rename a field | no |
  | change a field's type or format | no |
  | add a value to a closed set | no, see R5 |
  | tighten a validation rule | no |

- **R5.** Adding a value to a closed set is breaking for consumers and MUST follow `closed_set_policy`: an exhaustive consumer falls through on the new value.
- **R6.** Any change not allowed by R4 MUST mint a new version. There is no "small breaking change".

### Versioning

- **R7.** The version MUST be part of the event `type` (`event-model.md` R9), so a consumer of one version is unaffected by the existence of the next.
- **R8.** When a new version is introduced, producers MUST publish both versions in parallel for `parallel_publish_period`; consumers migrate on their own schedule.
- **R9.** Retiring a version MUST be announced with the deprecation mechanism the project uses for its other published interfaces, and the sunset date MUST NOT be earlier than `parallel_publish_period` after the announcement.
- **R10.** A version MUST NOT be retired while a consumer still receives it; per-version delivery telemetry decides, not assumption.

### Consumers

- **R11.** A consumer MUST declare the event types and versions it handles. An unrecognised type MUST be ignored and counted, never treated as an error.
- **R12.** A consumer MUST ignore unknown fields within a version it recognises; this is what makes the additions in R4 safe.

### Verification

- **R13.** CI MUST fail on an incompatible schema change, using `compatibility_check`, unless the event type's version was incremented.
- **R14.** Every event type MUST have at least one contract test asserting that a serialized example validates against its published schema.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1–R3 | Generation step with a CI check that generated output is current (tooling chosen in `13-technology/`) | ⬜ scheduled |
| R4–R6, R13 | Schema-diff check against the last release, run in CI | ⬜ scheduled |
| R7 | Event-name lint includes the version segment (`event-model.md` R9) | ⬜ scheduled |
| R8–R10 | Dual-publish window in the producer; delivery telemetry per version | ⬜ scheduled |
| R11, R12 | Shared consumer base ignoring unknown types and fields; unit tests for both | ⬜ scheduled |
| R14 | Contract test per event type | ⬜ scheduled |

## AI guardrails

- One schema per event type; generate published artefacts, never hand-write both.
- Within a version only add optional fields. Removing, renaming, retyping, making required optional or tightening validation mints a new version.
- A new value in a closed set is breaking unless `closed_set_policy` says otherwise.
- The version lives in the event `type`. Publish both versions for `parallel_publish_period`.
- Never retire a version a consumer still receives; check telemetry.
- Consumers ignore unknown types (counted) and unknown fields.

## References

- [CloudEvents 1.0 specification](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md)
- [Semantic Versioning 2.0.0](https://semver.org/)
- `event-model.md`, `delivery-and-outbox.md` (this pack)
- `13-technology/README.md`
