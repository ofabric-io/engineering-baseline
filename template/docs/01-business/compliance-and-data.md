---
layer: 01-business
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Compliance, Auditability & Data Retention

## Purpose

Which regulatory regimes apply, what records must be kept and for how long, and what must be deletable. The regimes themselves are parameters; this document fixes how a project records and honours them.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `regulatory_regimes` | [[regulatory_regimes]] | none declared | e.g. GDPR, LGPD, PCI DSS, SOC 2, HIPAA — each adds rules here |
| `record_retention` | [[record_retention]] | decided per data class in `06-security/sensitive-data.md` | a single global period is simpler but rarely correct |
| `data_residency` | [[data_residency]] | as required by regimes and contracts: where none applies, any region the project chooses and records | each added region multiplies operations and legal surface |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] If two obligations conflict (for example an erasure right against a retention duty), who decides, and where is the decision recorded? Until decided, nothing is built around the conflict (R14, R15). → DECISION-QUEUE

## Rules

### Regimes

- **R1.** Every regime in `regulatory_regimes` MUST be recorded with its scope (which data and which users) and the project's position (the compliance level or scheme it targets).
- **R2.** A change that moves the project to a different compliance level or adds a regime MUST be an ADR plus a compliance review.
- **R3.** An agent MUST NOT infer what a regulation requires, nor design around an obligation that is undecided; it MUST stop and ask.

### Data classification

- **R4.** Data classification MUST follow `06-security/sensitive-data.md` R1–R2; the classes and the field-to-class table are defined there and only there.
- **R5.** A regime's obligations MUST be mapped to the classes it covers, so that each class's handling meets the strictest regime that applies to it.
- **R6.** Classification MUST follow the data, not the table: derived or copied data inherits the highest class of its sources.

### Auditability

- **R7.** Every consequential action MUST be recorded with the actor, the action, the target and the time. Where an audit-trail capability is installed, its documents govern how.
- **R8.** The project MUST state whether these records are authoritative evidence; if they are best-effort, that is a known exposure recorded in this document or an ADR, not in a code comment.

### Retention and residency

- **R9.** Every record kind MUST have a retention period in `record_retention`, stated in the retention-by-class table of `06-security/sensitive-data.md`, with the obligation that sets it.
- **R10.** A retention period MUST NOT be shortened without checking it against the obligation that set it; retention is a duty, not a storage-cost decision.
- **R11.** Retention MUST be enforced by an automated job per store, not by manual cleanup.
- **R12.** Copies of production data MUST follow `06-security/sensitive-data.md` R14–R16.
- **R13.** Data MUST NOT be stored or processed outside the places `data_residency` permits. Adding a region MUST be an ADR.

### Deferred obligations

- **R14.** An obligation that is known to apply but is not yet decided MUST be listed as an open decision here and as a blocking item on the production-readiness checklist (`15-delivery/production-readiness.md`).
- **R15.** No code path that depends on an undecided obligation MAY be shipped to production until the decision is recorded; building and testing it in a non-production environment is permitted.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | Review; this document is the register | ❌ review-only |
| R2 | ADR required; compliance review checklist | ❌ review-only |
| R3 | Agent prohibition (`16-ai/prohibitions.md`) | ◐ partial |
| R4, R6 | Schema review; a data-class annotation required on every field (mechanism chosen in `13-technology/`) | ⬜ scheduled |
| R5 | Review of the regime-to-class mapping | ❌ review-only |
| R7 | Check that state-changing operations emit a record (mechanism chosen in `13-technology/`) | ⬜ scheduled |
| R8 | Review; recorded here or in an ADR | ❌ review-only |
| R9 | Retention table reviewed per store | ⬜ scheduled |
| R10 | PR review against the retention table | ❌ review-only |
| R11 | Scheduled retention jobs with recorded runs | ⬜ scheduled |
| R12 | Enforced where `06-security/sensitive-data.md` enforces it | ⬜ scheduled |
| R13 | Infrastructure configuration restricted to approved regions | ⬜ scheduled |
| R14 | `15-delivery/production-readiness.md` is a blocking checklist | ❌ review-only |
| R15 | Release gate on the readiness checklist | ⬜ scheduled |

## AI guardrails

```text
Never infer what a regulation requires. Never design around an undecided obligation. ASK.
Classify every field when you add it, per 06-security/sensitive-data.md.
Never shorten a retention period for storage cost.
Production data never leaves production unless 06-security/sensitive-data.md allows it.
Never ship code that depends on an undecided obligation to production.
```

## References

- `06-security/sensitive-data.md` — handling of each data class
- `07-observability/` — audit and logging rules
- `15-delivery/production-readiness.md` — where deferred obligations are tracked
- [ISO/IEC 27001](https://www.iso.org/standard/27001) — information security management
- [Regulation (EU) 2016/679 (GDPR)](https://eur-lex.europa.eu/eli/reg/2016/679/oj) — an example regime
