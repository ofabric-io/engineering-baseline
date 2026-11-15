---
layer: 05-protocols
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Standards Profile

## Purpose

Which published standards the project adopts instead of inventing its own, which it deliberately does not, and every known deviation. Packs add standards for the areas they govern; this document lists only what every project adopts.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `adopt_before_invent` | [[adopt_before_invent]] | yes | a local convention only where no standard applies, and recorded here |
| `core_standards` | [[core_standards]] | RFC 2119, RFC 3339, RFC 9562, ISO 8601, SemVer, Conventional Commits, OpenTelemetry + W3C Trace Context | packs add their own; every addition, including any the project adopts before choosing a pack, needs a reason and a version |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

### Adoption

- **R1.** Where a published standard covers a problem and `adopt_before_invent` is `yes`, the project MUST adopt it rather than invent a convention.
- **R2.** A local convention MUST be permitted only where no standard applies, and the gap MUST be recorded in this document or in an ADR.
- **R3.** Every standard in `core_standards` MUST be cited with its number and, where the standard is versioned, its version.
- **R4.** A standard introduced by a pack or a technology decision MUST be added to this document's list of adopted standards in the same change.

### Core standards

- **R5.** Requirement keywords in standards documents MUST carry the meaning given by the requirement-keyword standard in `core_standards`, and only when written in capitals.
- **R6.** Timestamps crossing a boundary (storage format, wire format, file format, log line) MUST use the timestamp standard in `core_standards`, in UTC.
- **R7.** Durations that must be written as text MUST use the duration syntax of the standards in `core_standards`; calendar dates without a time MUST use the date syntax of the same standards.
- **R8.** Universally unique identifiers MUST follow the standard in `core_standards`, in the version chosen in `02-domain/identifiers.md`.
- **R9.** Released artifacts and published interfaces MUST be versioned with the versioning scheme in `core_standards`.
- **R10.** Commit messages MUST follow the commit convention in `core_standards` (`14-git/git.md`).
- **R11.** Metrics, traces and log correlation MUST use the telemetry semantics in `core_standards`, and trace propagation MUST use the propagation format it names (`07-observability/metrics-and-tracing.md`).

### Drafts

- **R12.** A standard that is a draft (an Internet-Draft or any unratified specification) MAY be adopted, and MUST be labelled as a draft everywhere it is cited.
- **R13.** Every adopted draft MUST be recorded in this document with its draft name and status, and MUST be re-checked when a new revision is published.
- **R14.** A draft MUST NOT be cited as though it were a published standard.

### Not adopted and deviations

- **R15.** A published standard that was considered and rejected MUST be recorded under "Deliberately not adopted" with the reason and the condition for revisiting.
- **R16.** A knowing departure from an adopted standard MUST be recorded in the "Deviations" table with the standard and clause, the reason, and the date decided, before the departure ships.

## Deliberately not adopted

_None yet. The project records here each standard it considered and rejected, with the reason and what would make it revisit._

| Standard | Why not | Revisit when |
| --- | --- | --- |
| | | |

## Deviations

An undocumented deviation is indistinguishable from a bug. Keep this list short on purpose.

| Deviation | Standard and clause | Why | Decided |
| --- | --- | --- | --- |
| | | | |

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | PR review against this document | ❌ review-only |
| R2 | PR review; ADR required for a local convention | ❌ review-only |
| R3 | Document review at ratification | ❌ review-only |
| R4 | PR review of the change that adds the pack or technology | ❌ review-only |
| R5 | Document review | ❌ review-only |
| R6 | Serialization tests at each boundary, chosen in `12-testing/` | ⬜ scheduled |
| R7 | Schema validation of duration and date fields | ⬜ scheduled |
| R8 | Identifier format validation in schemas | ⬜ scheduled |
| R9 | Release pipeline rejects a non-SemVer tag | ⬜ scheduled |
| R10 | Commit-message check in the git hook and CI | ◐ partial (see `14-git/git.md`) |
| R11 | Telemetry configuration review | ❌ review-only |
| R12 | PR review | ❌ review-only |
| R13 | Quarterly review of the adopted-drafts list | ❌ review-only |
| R14 | PR review | ❌ review-only |
| R15 | PR review | ❌ review-only |
| R16 | PR review; a deviation without a table row is a review finding | ❌ review-only |

## AI guardrails

- Look for a published standard before designing a format, header, identifier or protocol.
- Never cite a draft as an RFC. Label it a draft.
- Never add a deviation silently. Add the table row first.
- If a standard seems wrong for the task, stop and ask; do not work around it.

## References

- [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) and [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174) — requirement keywords
- [RFC 3339](https://www.rfc-editor.org/rfc/rfc3339) — date and time on the internet
- [RFC 9562](https://www.rfc-editor.org/rfc/rfc9562) — UUIDs
- [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) — dates, times and durations
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [OpenTelemetry](https://opentelemetry.io/) and [W3C Trace Context](https://www.w3.org/TR/trace-context/)
- `02-domain/identifiers.md`, `07-observability/metrics-and-tracing.md`, `14-git/git.md`
