---
layer: packs/multi-tenant
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Isolation

## Purpose

One isolation unit must never see another's data. This document makes that structural rather
than a matter of remembering a filter: the unit's name, where its key comes from, how isolation
is enforced and tested. It does not choose the storage or query technology — that is
`13-technology/`.

In this document, **isolation unit** means whatever `isolation_unit_name` says it is, and
**isolation key** is its identifier.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `isolation_unit_name` | [[isolation_unit_name]] | tenant | use the domain's own word (account, workspace, organization…); the glossary forbids the others |
| `isolation_axes` | [[isolation_axes]] | 1 | a second axis (for example an end customer who spans units) doubles the policies and adds its own leak tests |
| `enforcement` | [[enforcement]] | two independent layers: a storage-level policy plus a query filter, mechanisms chosen in `13-technology/` | one layer is one bug away from a leak |
| `staff_cross_access_roles` | [[staff_cross_access_roles]] | none until named | every role that can cross units is a role to audit |
| `fairness` | [[fairness]] | per-unit quotas on shared resources | without quotas one unit starves the rest |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Which tables, if any, legitimately belong to no isolation unit (identity, credentials)? Each
      needs a named justification.
- [ ] If `isolation_axes` is 2: what is the second axis, and which tables carry one key, the
      other, or both?
- [ ] Anonymous routes: which public identifiers resolve to an isolation unit?

## Rules

### Vocabulary

- **R1.** The isolation unit MUST be called exactly `isolation_unit_name`, and its key MUST be
  named after it in code, schema, payloads, logs and metrics. Once chosen, the glossary
  (`02-domain/glossary.md`) forbids every other word for it.

### Where the isolation key comes from

- **R2.** The isolation key MUST be derived server-side from the authenticated context only. It
  MUST NOT be read from a request body, query parameter, path segment or client-supplied header.
- **R3.** The key MUST travel in request-scoped context, not as a hand-threaded parameter.
- **R4.** A background job, event consumer and scheduled task MUST each carry the key explicitly
  in its payload and MUST fail fast when it is absent. A job MUST NOT default to "no unit".
- **R5.** An anonymous route MAY resolve an opaque public identifier server-side and take the key
  from the row that lookup returns. The client MUST NOT assert the key itself; this is R2 applied
  without a session, not an exception to it.

### Enforcement

- **R6.** Every table holding unit-scoped data MUST have a non-null isolation-key column, indexed
  with the key leading.
- **R7.** Isolation MUST be enforced by two independent layers, as in `enforcement`: a
  storage-level policy that applies even to raw queries, and a filter in the data-access code.
  Neither may be removed because the other exists.
- **R8.** The storage-level policy MUST be active for the application's own database role, not
  bypassable by that role, and MUST read the key from a per-transaction setting that cannot
  outlive the transaction on a pooled connection.
- **R9.** The application MUST set that per-transaction key at the start of every transaction
  touching unit-scoped data.
- **R10.** Every table MUST belong to exactly one category: unit-scoped, a second axis (if
  `isolation_axes` is 2), both with one policy each, or none. A table in none MUST be named and
  justified in a reviewed allow-list and MUST be reached only through a scoped table.
- **R11.** A table carrying two keys MUST have a policy per axis, and effective access is the
  intersection.

### Escalation

- **R12.** Cross-unit access MUST be limited to the roles in `staff_cross_access_roles`, MUST go
  through an explicitly named data-access method, and every call MUST be audited with the real
  actor.
- **R13.** A cross-unit method MUST NOT be reachable from any user-facing surface for ordinary
  users, under any role.
- **R14.** Bypassing the storage-level policy (an elevated function, a privileged connection, a
  wildcard setting) MUST require an ADR, and each bypass MUST be one narrow, named function.

### Verification

- **R15.** Every change touching unit-scoped data MUST include a test asserting that a query run
  as unit A returns none of unit B's rows.
- **R16.** The test harness MUST provide a leak-test helper so R15 costs one line.
- **R17.** A new unit-scoped table without a storage-level policy MUST fail CI.
- **R18.** If `isolation_axes` is 2, an explicit test MUST show that a principal on one axis
  cannot enumerate another axis's data through the other (for example, a unit cannot list an
  end customer's records at other units).

### Fairness

- **R19.** Shared resources MUST be limited as in `fairness`, so one unit's load cannot starve
  another's.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | Forbidden-terms list generated from the glossary, run by `scripts/check.mjs` | ◐ partial |
| R2 | Architecture test: the key is never read from request input | ⬜ scheduled |
| R3, R4 | Request-context module; a job base type that throws without the key | ⬜ scheduled |
| R5, R13 | Review; route-level role check | ❌ review-only |
| R6, R17 | Migration lint: a table with the key column and no policy fails CI | ⬜ scheduled |
| R7, R8, R9 | Transaction helper sets the key; integration test asserts it is set and that the application role cannot bypass the policy | ⬜ scheduled |
| R10, R11 | Reviewed allow-list of unscoped tables, checked by the migration lint | ⬜ scheduled |
| R12 | Naming convention for cross-unit methods; audit assertion; role check | ⬜ scheduled |
| R14 | ADR required | ❌ review-only |
| R15, R16 | Leak-test helper, plus review that data-access changes use it | ⬜ scheduled |
| R18 | Leak test for the second axis | ⬜ scheduled |
| R19 | Quota configuration and a load test | ⬜ scheduled |

## AI guardrails

```text
Use the project's isolation unit name exactly. Never a synonym.
The isolation key comes from the authenticated context, server-side. NEVER from a request field.
It travels in request context. Jobs and consumers carry it in the payload and FAIL FAST without it.
Every scoped table: non-null key, storage-level policy, plus a query filter. Both. Never one.
Cross-unit reads: named staff roles only, an explicit method, always audited.
Every data-access change ships a test proving unit A cannot see unit B's rows.
```

## References

- `02-domain/glossary.md` — forbids synonyms of the unit's name
- `06-security/authn-authz.md` — authenticated context and roles
- `13-technology/README.md` — where the enforcement mechanisms are chosen
- `07-observability/logging.md` — the key's presence in logs
