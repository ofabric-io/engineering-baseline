---
layer: 07-observability
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Metrics & Tracing

## Purpose

Which signals are emitted, how they are named, how label cardinality is kept bounded, and how traces propagate.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `telemetry_standard` | [[telemetry_standard]] | OpenTelemetry; W3C Trace Context for propagation | vendor SDKs lock in the backend |
| `metric_name_pattern` | [[metric_name_pattern]] | `<project>_<area>_<thing>_<unit>`, lower snake case | a rigid pattern aids discovery and costs renames |
| `trace_sampling` | [[trace_sampling]] | per component kind: keep every trace containing an error; sample the rest, heavily for high-volume `service` and `daemon` paths, fully for `batch` and `cli` runs | full capture is costly; heavy sampling loses rare cases |
| `label_cardinality_limit` | [[label_cardinality_limit]] | 100 distinct values per label | a higher limit gives finer breakdowns and raises storage and query cost |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Which backend receives the signals? (A deployment choice, decided in `13-technology/`.)
- [ ] Service-level objectives, burn-rate alerts and who is paged.
- [ ] Retention per signal.

## Rules

### Instrumentation

- **R1.** Metrics and traces MUST be produced through the `telemetry_standard` API. A vendor-specific SDK MUST NOT be called from application code; the vendor is an exporter configured at the edge.
- **R2.** Instrumentation MUST NOT live in domain logic; it belongs in the layers that talk to the outside world (`03-architecture/dependency-rules.md`).

### Metrics

- **R3.** Metric names MUST follow `metric_name_pattern` and MUST include the unit.
- **R4.** Metric labels MUST be bounded and enumerable within `label_cardinality_limit`. A label whose values come from user input, or that identifies an individual (a user, a request, a resource), MUST NOT be used. A label for where the work ran (node, region, zone) MAY be used when its value set is bounded and documented.
- **R5.** Per-entity breakdowns MUST go on logs and trace attributes, not metric labels.
- **R6.** Every long-running component MUST emit the request-level golden signals (rate, errors, duration) per unit-of-work name, and the saturation of each bounded resource it owns (queue depth, pool usage). _(applies to: service, daemon)_
- **R7.** Every outbound dependency MUST have call duration and error-rate metrics, labelled by dependency name.
- **R8.** A metric that measures a quantity with a unit MUST carry the unit in its name or metadata; a value MUST NOT be summed across incompatible units.

### Tracing

- **R9.** Trace context MUST be propagated in the W3C Trace Context format, in both directions across every process boundary.
- **R10.** A trace context received from an untrusted caller MUST NOT be continued as-is; a new trace MUST be started and the incoming identifier recorded as an attribute.
- **R11.** Each of these MUST be a span: an outbound call, a data-store query, a background job execution, a message handler.
- **R12.** Span attributes MUST NOT carry personal data or secrets (`06-security/sensitive-data.md` R12).
- **R13.** Sampling MUST follow `trace_sampling` and MUST NOT drop a trace that contains an error.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | Dependency check banning vendor telemetry packages outside the exporter configuration | ⬜ scheduled |
| R2 | Module-boundary check (tool chosen in `13-technology/`) | ⬜ scheduled |
| R3 | Metric-name lint in CI | ⬜ scheduled |
| R4 | Label allowlist check; PR review | ◐ partial |
| R5 | PR review | ❌ review-only |
| R6 | Dashboard and alert review at production readiness | ❌ review-only |
| R7 | Shared client wrapper emitting metrics; review | ◐ partial |
| R8 | PR review | ❌ review-only |
| R9 | Propagation integration test | ⬜ scheduled |
| R10 | Integration test with a forged inbound header | ⬜ scheduled |
| R11 | Trace inspection in a staging smoke test | ⬜ scheduled |
| R12 | See `06-security/sensitive-data.md` | ⬜ scheduled |
| R13 | Sampler configuration review | ❌ review-only |

## AI guardrails

- Instrument through the standard API; never call a vendor SDK.
- Never put an identifier or user input in a metric label. Node or region labels are fine when bounded.
- Put units in metric names.
- Never continue a trace id from an untrusted caller.
- Never put personal data in a span attribute.

## References

- [OpenTelemetry specification](https://opentelemetry.io/docs/specs/otel/)
- [W3C Trace Context](https://www.w3.org/TR/trace-context/)
- `05-protocols/rfc-profile.md`, `06-security/sensitive-data.md`, `07-observability/logging.md`
