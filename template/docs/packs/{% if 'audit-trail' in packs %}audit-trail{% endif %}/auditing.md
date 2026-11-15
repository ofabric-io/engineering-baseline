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
| `audited_actions` | [[audited_actions]] | every state change of a core entity, every privileged read, every operator action, every authentication event, every configuration change, every agent action | broader auditing is more evidence and more volume nobody can search |
| `audit_delivery_guarantee` | [[audit_delivery_guarantee]] | asynchronous, best-effort, with loss counted and alerted | a guaranteed path (same transaction or outbox) costs latency and complexity |
| `audit_retention` | [[audit_retention]] | 5 years | set by `01-business/compliance-and-data.md` and the retention-by-class table in `06-security/sensitive-data.md`; longer costs storage and conflicts with deletion requests |
| `audit_personal_data` | [[audit_personal_data]] | records hold pseudonymous tokens in place of personal identifiers; the token-to-person mapping lives outside the trail and can be destroyed | Storing identifiers directly is simpler to read and makes every erasure request collide with immutability |
| `readers` | [[readers]] | each user reads records about their own isolation unit or account; named operator roles read across, and that read is itself audited | wider readership is more transparency and more exposure |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] If `audit_delivery_guarantee` is best-effort: which facts must stay provable by other means, so a
      lost record never leaves a dispute unanswerable?
- [ ] Who may resolve a token back to a person (`audit_personal_data`), under which approval, and how is that resolution audited?
- [ ] Are audit records visible to end users, and in which wording?

## Rules

### What is audited

- **R1.** Every action in `audited_actions` MUST produce an audit record.
- **R2.** A read of ordinary data by the user who owns it MUST NOT be audited unless
  `audited_actions` lists it. Reads by operators across owners MUST be audited.

### Record shape

- **R3.** Every record MUST carry all of: `occurredAt` (UTC instant); `actor` (type and id);
  `onBehalfOf` when one principal acts as another; `action` (a past-tense, namespaced name);
  `subject` (type and id); the isolation key, if the project has one; `before` and `after`
  (changed fields only); `reason` (required for operator actions and any step-up action); and
  correlation identifiers joining the record to logs and traces.
- **R4.** `actor.type` MUST be one of the values in `actor_types` of
  `06-security/authn-authz.md` (by default `user`, `operator`, `service`, `system`, `agent`). An
  action initiated by an AI agent MUST use the agent type, distinguishable from `system`.
- **R5.** `before` and `after` MUST NOT contain anything on the never-log list
  (`06-security/sensitive-data.md`). The audit trail is read more widely than the database.
- **R6.** `before` and `after` MUST contain only the fields that changed, never the whole entity.

### Immutability

- **R7.** An audit record MUST be immutable: no update, no delete. A correction MUST be a new
  record referencing the original.
- **R8.** Immutability MUST be enforced by the store, with update and delete permissions removed
  from the application's role, not by convention.

### Delivery

- **R9.** Delivery MUST follow `audit_delivery_guarantee`. The chosen guarantee MUST be written down in
  this document's Answer column, so nobody discovers it during an incident.
- **R10.** If `audit_delivery_guarantee` is best-effort, emission MUST be asynchronous and outside the transaction
  that made the change, emission failures MUST be counted as a metric and alerted on, and the
  audit trail MUST NOT be the sole evidence for anything that must be provable.
- **R11.** If `audit_delivery_guarantee` is guaranteed, the record MUST be written in the same transaction as the
  change, or through an outbox (optional: if the events pack is installed, its outbox is the natural mechanism).
  Moving from best-effort to guaranteed MUST be recorded in an ADR.

### Retention and access

- **R12.** Records MUST be kept at least as long as `audit_retention`, and MUST NOT be deleted earlier
  by any code path. Expiry MUST be a scheduled, audited job.
- **R13.** Read access MUST follow `readers`, enforced by an authorization check on the read
  endpoint. A read of another owner's records by an operator MUST itself be audited.

### Erasure

- **R14.** A personal identifier (a person's name, contact detail or account identifier that
  identifies them) in any field of a record, including `actor`, `onBehalfOf`, `subject`, `before`
  and `after`, MUST be stored as a pseudonymous token as `audit_personal_data` says; the mapping
  from token to person MUST live outside the trail. Erasing a person is then the destruction of the
  mapping, and MUST NOT require editing or deleting an audit record (R7).

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | Architecture test: every state-transition method emits an audit event | ⬜ scheduled |
| R2 | Review | ❌ review-only |
| R3, R4, R6 | The record type: a missing field fails to build; `actor.type` validated against `actor_types`; a test for changed-fields-only | ⬜ scheduled |
| R14 | Serializer replaces identifiers with tokens; test that no raw identifier reaches the store; erasure test that destroys the mapping and leaves records untouched | ⬜ scheduled |
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
isolation key, before/after (changed fields ONLY), reason (required for operators), correlation ids.
actor.type comes from actor_types. An agent-initiated action uses the agent type. Never 'system'.
Personal identifiers are pseudonymous tokens; erasure destroys the mapping, never a record.
Records are IMMUTABLE. A correction is a new record.
Nothing on the never-log list goes in before/after.
Follow audit_delivery_guarantee in the Answer column. Best-effort means counted, alerted loss.
```

## References

- `06-security/sensitive-data.md` — the never-log list R5 respects
- `07-observability/logging.md` — correlation identifiers
- `01-business/compliance-and-data.md` — retention and deletion
- `06-security/authn-authz.md` — `actor_types`
- `06-security/sensitive-data.md` — data classes and retention by class
