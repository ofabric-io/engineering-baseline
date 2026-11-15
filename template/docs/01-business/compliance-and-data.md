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
| `data_residency` | [[data_residency]] | a single region until a regime or contract requires otherwise | each added region multiplies operations and legal surface |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] If two obligations conflict (for example an erasure right against a retention duty), who decides, and where is the decision recorded? Until decided, [NEEDS CLARIFICATION: conflict between obligations] stays open and nothing is built around it.

## Rules

### Regimes

- **R1.** Every regime in `regulatory_regimes` MUST be recorded with its scope (which data and which users) and the project's position (the compliance level or scheme it targets).
- **R2.** A change that moves the project to a different compliance level or adds a regime MUST be an ADR plus a compliance review.
- **R3.** An agent MUST NOT infer what a regulation requires, nor design around an obligation that is undecided; it MUST stop and ask.

### Data classification

- **R4.** Every field that holds data MUST belong to exactly one data class, decided when the field is added. The classes are the `data_classes` parameter of `06-security/sensitive-data.md`, defined there and only there.
- **R5.** A field in the most sensitive class MUST be added to the redaction list (`06-security/sensitive-data.md`) in the same change that introduces it.
- **R6.** Classification MUST follow the data, not the table: derived or copied data inherits the highest class of its sources.

### Auditability

- **R7.** Every consequential action MUST produce an audit record naming the actor, the action, the target and the time.
- **R8.** The project MUST state whether its audit trail is authoritative evidence; if it is best-effort, that is a known exposure recorded in this document or an ADR, not in a code comment.

### Retention and residency

- **R9.** Every data class or record kind MUST declare a retention period in `record_retention`, with the obligation that sets it.
- **R10.** A retention period MUST NOT be shortened without checking it against the obligation that set it; retention is a duty, not a storage-cost decision.
- **R11.** Retention MUST be enforced by an automated job per store, not by manual cleanup.
- **R12.** Production data MUST NOT be copied to another environment; non-production environments use synthetic data.
- **R13.** Data MUST NOT be stored or processed outside the regions in `data_residency`. Adding a region MUST be an ADR.

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
| R5 | Redaction-list check on changes that add a restricted field | ⬜ scheduled |
| R7 | Audit-emission check on state-changing operations (`07-observability/`) | ⬜ scheduled |
| R8 | Review; recorded here or in an ADR | ❌ review-only |
| R9 | Retention table reviewed per store | ⬜ scheduled |
| R10 | PR review against the retention table | ❌ review-only |
| R11 | Scheduled retention jobs with recorded runs | ⬜ scheduled |
| R12 | No export path for production data; environment access controls | ⬜ scheduled |
| R13 | Infrastructure configuration restricted to approved regions | ⬜ scheduled |
| R14 | `15-delivery/production-readiness.md` is a blocking checklist | ❌ review-only |
| R15 | Release gate on the readiness checklist | ⬜ scheduled |

## AI guardrails

```text
Never infer what a regulation requires. Never design around an undecided obligation. ASK.
Classify every field when you add it; put the most sensitive class on the redaction list in
the SAME change.
Never shorten a retention period for storage cost.
Production data never leaves production. Use synthetic data elsewhere.
Never ship code that depends on an undecided obligation to production.
```

## References

- `06-security/sensitive-data.md` — handling of each data class
- `07-observability/` — audit and logging rules
- `15-delivery/production-readiness.md` — where deferred obligations are tracked
- [ISO/IEC 27001](https://www.iso.org/standard/27001) — information security management
- [Regulation (EU) 2016/679 (GDPR)](https://eur-lex.europa.eu/eli/reg/2016/679/oj) — an example regime
