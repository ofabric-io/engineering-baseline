---
layer: 06-security
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Sensitive Data Handling

## Purpose

How personal and secret data are classified, redacted, kept out of logs and URLs, and kept out of non-production environments.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `data_classes` | [[data_classes]] | public, internal, personal, secret | more classes = finer control, more to get wrong |
| `never_log` | [[never_log]] | secrets, credentials, full personal data | logs are the most common leak |
| `masking_rules` | [[masking_rules]] | show at most the last 4 characters of an identifier, or a hash prefix of a token | more visible characters help support and weaken the mask |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Which fields are in each of `data_classes`? The project keeps that list in this document once ratified.
- [ ] Which regimes constrain the data (`01-business/compliance-and-data.md`)?

## Rules

### Classification

- **R1.** Every stored or transmitted field MUST belong to one class in `data_classes`, and the classification MUST be recorded where the field is defined.
- **R2.** A field without a classification MUST be treated as personal data until classified.

### Never log

- **R3.** Values in `never_log` MUST NOT be written to a log, a metric, a trace attribute, an error message, an error-tracker payload or an analytics event.
- **R4.** Where a value in a restricted class must appear at all, it MUST be masked according to `masking_rules`.
- **R5.** Logging an entire object received from an external system MUST NOT happen; log only the fields intended.

### One redaction layer

- **R6.** Redaction MUST be implemented once, as a serializer applied to logs and another applied to errors, and MUST be applied globally. Per-call-site redaction MUST NOT be relied on.
- **R7.** The redaction list MUST be keyed on field name, MUST be deny-by-default for a curated set of names, and MUST apply recursively to nested structures.
- **R8.** A new field carrying data in a restricted class MUST be added to the redaction list in the same change that introduces it.
- **R9.** Redaction is a backstop: code MUST NOT pass a secret to a logger on the expectation that redaction will mask it.

### Where data must not appear

- **R10.** Identifiers, credentials and personal data MUST NOT appear in a URL, path segment or query string.
- **R11.** Error trackers and telemetry SDKs MUST NOT capture request bodies or free-text payloads.
- **R12.** Trace and span attributes MUST NOT carry personal data.
- **R13.** Tools that capture screen or input content (session replay, heatmaps) MUST NOT be enabled on any surface that handles data in a restricted class.

### Environments

- **R14.** Production data MUST NOT be copied to any other environment, including a developer machine or a test fixture.
- **R15.** Test and demo data MUST be synthetic.
- **R16.** Investigating a production data problem MUST happen through an audited query, not through a copy.

### Retention and deletion

- **R17.** Every class in `data_classes` above `internal` MUST have a documented retention period, and data MUST be deleted or irreversibly anonymized when it expires.
- **R18.** A request to delete personal data MUST reach every store that holds a copy, including backups within their retention, caches and search indexes.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | Schema annotation check | ⬜ scheduled |
| R2 | Schema annotation check treats an unclassified field as personal data | ⬜ scheduled |
| R3 | Log-capture test with canary values | ⬜ scheduled |
| R4 | Unit tests of the masking functions | ⬜ scheduled |
| R5 | PR review; static check for whole-object logging | ⬜ scheduled |
| R6 | Architecture test: only the shared serializers configure logging | ⬜ scheduled |
| R7 | Unit tests with nested canary values | ⬜ scheduled |
| R8 | PR review checklist | ❌ review-only |
| R9 | PR review | ❌ review-only |
| R10 | Entry-point route lint; access-log canary test | ⬜ scheduled |
| R11 | SDK configuration review | ❌ review-only |
| R12 | Tracing-configuration test | ⬜ scheduled |
| R13 | Dependency and configuration review | ❌ review-only |
| R14 | Access controls on production backups; policy | ❌ review-only |
| R15 | Fixture review | ❌ review-only |
| R16 | Audit of production query access | ❌ review-only |
| R17 | Scheduled retention job and its test | ⬜ scheduled |
| R18 | Deletion-flow integration test | ⬜ scheduled |

## AI guardrails

- Never log a credential, token or personal field, even to debug.
- Never log a whole external payload.
- Never put an identifier or token in a URL.
- Never use production data in a test, fixture or example.
- Add a new sensitive field to the redaction list in the same commit.

## References

- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- `01-business/compliance-and-data.md`, `07-observability/logging.md`, `06-security/secrets-and-crypto.md`
