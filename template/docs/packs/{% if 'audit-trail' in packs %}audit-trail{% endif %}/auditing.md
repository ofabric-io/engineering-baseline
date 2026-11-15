---
layer: packs/audit-trail
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Audit Trail

## Purpose

A record of consequential actions, distinct from logs. Logs are for debugging and are sampled,
rotated and discarded; the audit trail answers "who did this, and when" months later. This
document decides what is audited, the shape of a record, its delivery guarantee and retention.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `audited_actions` | [[audited_actions]] | every state change of a core entity, every privileged read, every staff action, every authentication event, every configuration change, every agent action | broader auditing is more evidence and more volume nobody can search |
| `delivery_guarantee` | [[delivery_guarantee]] | asynchronous, best-effort, with loss counted and alerted | a guaranteed path (same transaction or outbox) costs latency and complexity |
| `retention` | [[retention]] | 5 years | set by `01-business/compliance-and-data.md`; longer costs storage and conflicts with deletion requests |
| `readers` | [[readers]] | each user reads records about their own isolation unit or account; named staff roles read across, and that read is itself audited | wider readership is more transparency and more exposure |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] If `delivery_guarantee` is best-effort: which facts must stay provable by other means, so a
      lost record never leaves a dispute unanswerable?
- [ ] Does a data-deletion request apply to audit records, or does retention override it?
- [ ] Are audit records visible to end users, and in which wording?

## Rules

### What is audited

- **R1.** Every action in `audited_actions` MUST produce an audit record.
- **R2.** A read of ordinary data by the user who owns it MUST NOT be audited unless
  `audited_actions` lists it. Reads by staff across owners MUST be audited.

### Record shape

- **R3.** Every record MUST carry all of: `occurredAt` (UTC instant); `actor` (type and id);
  `onBehalfOf` when one principal acts as another; `action` (a past-tense, namespaced name);
  `subject` (type and id); the isolation key, if the project has one; `before` and `after`
  (changed fields only); `reason` (required for staff actions and any step-up action); and
  correlation identifiers joining the record to logs and traces.
- **R4.** `actor.type` MUST be one of `user`, `staff`, `system` or `agent`. An action initiated by
  an AI agent MUST use `agent`, distinguishable from `system`.
- **R5.** `before` and `after` MUST NOT contain anything on the never-log list
  (`06-security/sensitive-data.md`). The audit trail is read more widely than the database.
- **R6.** `before` and `after` MUST contain only the fields that changed, never the whole entity.

### Immutability

- **R7.** An audit record MUST be immutable: no update, no delete. A correction MUST be a new
  record referencing the original.
- **R8.** Immutability MUST be enforced by the store, with update and delete permissions removed
  from the application's role, not by convention.

### Delivery

- **R9.** Delivery MUST follow `delivery_guarantee`. The chosen guarantee MUST be written down in
  this document's Answer column, so nobody discovers it during an incident.
- **R10.** If delivery is best-effort, emission MUST be asynchronous and outside the transaction
  that made the change, emission failures MUST be counted as a metric and alerted on, and the
  audit trail MUST NOT be the sole evidence for anything that must be provable.
- **R11.** If delivery is guaranteed, the record MUST be written in the same transaction as the
  change, or through the outbox pattern (`packs/events/delivery-and-outbox.md` when present).
  Moving from best-effort to guaranteed MUST be recorded in an ADR.

### Retention and access

- **R12.** Records MUST be kept at least as long as `retention`, and MUST NOT be deleted earlier
  by any code path. Expiry MUST be a scheduled, audited job.
- **R13.** Read access MUST follow `readers`, enforced by an authorization check on the read
  endpoint. A read of another owner's records by staff MUST itself be audited.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | Architecture test: every state-transition method emits an audit event | ⬜ scheduled |
| R2 | Review | ❌ review-only |
| R3, R4, R6 | The record type: a missing field fails to build; a test for changed-fields-only | ⬜ scheduled |
| R5 | The audit serializer reuses the redaction layer; test with a sensitive field | ⬜ scheduled |
| R7, R8 | Permission revoke in the migration; integration test that the revoke holds | ⬜ scheduled |
| R9 | Review of the Answer column against the implementation | ❌ review-only |
| R10 | Counter metric plus an alert on a non-zero loss rate | ⬜ scheduled |
| R11 | Transactional test or outbox test; ADR required to switch | ⬜ scheduled |
| R12 | Retention policy on the store; no delete path exists | ⬜ scheduled |
| R13 | Authorization check on the read endpoint; audit assertion | ⬜ scheduled |

## AI guardrails

```text
Audit every action in audited_actions. Not ordinary reads of one's own data.
Every record: occurredAt, actor{type,id}, onBehalfOf?, action (past tense), subject,
isolation key, before/after (changed fields ONLY), reason (required for staff), correlation ids.
An agent-initiated action uses actor.type 'agent'. Never 'system'.
Records are IMMUTABLE. A correction is a new record.
Nothing on the never-log list goes in before/after.
Follow the delivery guarantee in the Answer column. Best-effort means counted, alerted loss.
```

## References

- `06-security/sensitive-data.md` — the never-log list R5 respects
- `07-observability/logging.md` — correlation identifiers
- `01-business/compliance-and-data.md` — retention and deletion
- `packs/events/delivery-and-outbox.md` — the outbox, if the events pack is in use
