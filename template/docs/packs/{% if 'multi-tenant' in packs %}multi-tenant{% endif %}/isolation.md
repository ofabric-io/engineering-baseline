---
layer: packs/multi-tenant
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Isolation

## Purpose

One isolation unit must never see another's data. This document makes that structural rather
than a matter of remembering a filter: the unit's name, where its key comes from, which outcomes
the enforcement must guarantee and how they are tested. It does not choose the storage or query
technology — that is `13-technology/` (or the data-store pack's isolation mechanics, if that pack
is installed).

In this document, **isolation unit** means whatever `isolation_unit_name` says it is, and
**isolation key** is its identifier. An **axis** is one independent way data is partitioned;
axes may be **independent** (an end customer who spans units) or **nested** (an account that
contains zones).

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `isolation_unit_name` | [[isolation_unit_name]] | tenant | use the domain's own word (account, workspace, organization…); the glossary forbids the others |
| `isolation_axes` | [[isolation_axes]] | 1 axis. Alternatives: 2 independent axes, or `nested` levels (outer → inner, for example account → zone) | each extra axis or level multiplies policies and adds its own leak tests; nested levels share one hierarchy, independent axes do not; with more than one, name each axis or level and which record kinds carry which keys |
| `enforcement` | [[enforcement]] | two independent layers: one enforced below the application, one in data-access code; mechanisms chosen in `13-technology/` | one layer is one bug away from a leak |
| `operator_cross_access_roles` | [[operator_cross_access_roles]] | none until named | every role that can cross units is a role to audit |
| `platform_workload_roles` | [[platform_workload_roles]] | none until named | a workload that runs without a unit key (sweeps, fan-out) is powerful; each one named is one to audit |
| `fairness` | [[fairness]] | per-unit quotas on shared resources | without quotas one unit starves the rest |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Which stores or record kinds, if any, legitimately belong to no isolation unit (identity,
      credentials)? Each needs a named justification.
- [ ] Anonymous routes: which public identifiers resolve to an isolation unit?
- [ ] Which platform-scoped workloads exist, and does each need unit data or only a list of units?

## Rules

### Vocabulary

- **R1.** The isolation unit MUST be called exactly `isolation_unit_name`, and its key MUST be
  named after it in code, schema and payloads. Once chosen, the glossary
  (`02-domain/glossary.md`) forbids every other word for it.

### Where the isolation key comes from

- **R2.** The isolation key MUST be derived server-side from the authenticated context. A
  request MAY carry a selector that chooses among the units the principal belongs to, but the
  key MUST NOT be taken from a request body, query parameter, path segment or header without an
  authorization check that the principal is a member of the selected unit; a client assertion
  alone is never the key.
- **R3.** The key MUST travel in request-scoped context, not as a hand-threaded parameter.
- **R4.** A background job, event consumer and scheduled task MUST each carry the key explicitly
  in its payload and MUST fail fast when it is absent. Only a platform-scoped workload (R12)
  MAY run without a key.
- **R5.** An anonymous route MAY resolve an opaque public identifier server-side and take the key _(applies to: service)_
  from the record that lookup returns. The client MUST NOT assert the key itself; this is R2
  applied without a session, not an exception to it.
- **R6.** The key MUST accompany every log line and trace for work done on behalf of a unit
  (`07-observability/logging.md`). A metric MUST NOT carry the key as a label unless the number
  of units is bounded and small.

### Axes

- **R7.** A principal MUST carry the key of at least one axis. A policy for an axis applies to a
  principal only if the principal carries that axis's key; where it carries several, every
  applicable policy applies and effective access is their intersection.
- **R8.** With `nested` levels, every record MUST carry the keys of its whole path (outer and
  inner). A principal holding an outer key sees everything beneath it; a principal holding only an
  inner key sees only that level; neither sees a sibling.
- **R9.** Every record kind MUST belong to exactly one category: scoped by the unit, scoped by
  another axis or level (if `isolation_axes` provides one), scoped by several with one policy
  each, or none. A kind in none MUST be named and justified in a reviewed allow-list and MUST be
  reached only through a scoped record.

### Enforcement outcomes

- **R10.** Every record of unit-scoped data MUST carry a non-null isolation key, and lookups by
  that key MUST be efficient.
- **R11.** A query against unit-scoped data that does not supply the key MUST return nothing, and
  that guarantee MUST be enforced below the application, so that even a raw or hand-written query
  obeys it. A second layer in the data-access code MUST filter by the key too; neither layer MAY
  be removed because the other exists (`enforcement`). The mechanism is chosen in
  `13-technology/` (or the data-store pack, if installed).
- **R12.** The below-application layer MUST apply to the application's own identity and MUST NOT
  be bypassable by it. The key it uses MUST be bound to one unit of work and MUST NOT outlive it
  or leak into the next unit of work that reuses the same resource.
- **R13.** The application MUST establish the key at the start of every unit of work that touches
  unit-scoped data.
- **R14.** Any copy of unit-scoped data held outside the primary store (an in-process cache, an
  edge or replicated snapshot, a search index, an export) MUST be partitioned by the key and MUST
  return nothing for a lookup without it. A cache keyed without the isolation key is a defect.

### Escalation

- **R15.** Cross-unit access MUST be limited to the roles in `operator_cross_access_roles`, MUST
  go through an explicitly named data-access method, and every call MUST be audited with the real
  actor.
- **R16.** A cross-unit method MUST NOT be reachable from any user-facing surface for ordinary
  users, under any role.
- **R17.** A platform-scoped workload (a sweep, a fan-out, scheduled maintenance) MAY run without
  a unit key only under a role in `platform_workload_roles`. It MUST work from an explicit list of
  units and process each in that unit's context with the key established (R13), MUST NOT read or
  write unit data otherwise, and every run MUST be audited.
- **R18.** Bypassing the below-application enforcement (an elevated function, a privileged
  connection, a wildcard setting) MUST require an ADR, and each bypass MUST be one narrow, named
  function.

### Verification

- **R19.** Every change touching unit-scoped data MUST include a test asserting that a query run
  as unit A returns none of unit B's rows.
- **R20.** The test harness MUST provide a leak-test helper so R19 costs one line.
- **R21.** A new unit-scoped record kind without below-application enforcement MUST fail CI.
- **R22.** If `isolation_axes` provides more than one axis or level, an explicit test MUST show
  that a principal on one axis cannot enumerate another's data through it (for example, a unit
  cannot list an end customer's records at other units), and that an inner-level principal cannot
  see a sibling level.

### Fairness

- **R23.** Shared resources MUST be limited as in `fairness`, so one unit's load cannot starve
  another's.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | Forbidden-terms list generated from the glossary, run by `scripts/check.mjs` | ◐ partial |
| R2 | Architecture test: the key is never read from request input without the membership check | ⬜ scheduled |
| R3, R4 | Request-context module; a job base type that throws without the key | ⬜ scheduled |
| R5, R16 | Review; route-level role check | ❌ review-only |
| R6 | Log-field assertion in the logging test; metric-label review | ◐ partial |
| R7, R8 | Authorization tests per axis or level, including a principal carrying one key only | ⬜ scheduled |
| R9 | Reviewed allow-list of unscoped record kinds, checked by the schema lint | ⬜ scheduled |
| R10, R21 | Schema lint: a scoped kind without the key or without below-application enforcement fails CI | ⬜ scheduled |
| R11, R12, R13 | Unit-of-work helper establishes the key; integration test that a keyless query returns nothing, that the application identity cannot bypass it, and that the key does not leak to the next unit of work | ⬜ scheduled |
| R14 | Cache and snapshot tests: a keyless lookup returns nothing | ⬜ scheduled |
| R15 | Naming convention for cross-unit methods; audit assertion; role check | ⬜ scheduled |
| R17 | Workload base type that enumerates units and sets the key per unit; audit assertion | ⬜ scheduled |
| R18 | ADR required | ❌ review-only |
| R19, R20 | Leak-test helper, plus review that data-access changes use it | ⬜ scheduled |
| R22 | Leak test per additional axis or level | ⬜ scheduled |
| R23 | Quota configuration and a load test | ⬜ scheduled |

## AI guardrails

```text
Use the project's isolation unit name exactly. Never a synonym.
The isolation key comes from the authenticated context. A client-chosen unit is authorized
against membership first; NEVER trust a request field as the key.
It travels in request context. Jobs and consumers carry it and FAIL FAST without it.
Only a named platform workload runs without a key; it works per unit and is audited.
A query without the key returns nothing, enforced below the application AND filtered in code.
Caches, snapshots and indexes are partitioned by the key too.
Cross-unit reads: named operator roles only, an explicit method, always audited.
Every data-access change ships a test proving unit A cannot see unit B's rows.
```

## References

- `02-domain/glossary.md` — forbids synonyms of the unit's name
- `06-security/authn-authz.md` — authenticated context and roles
- `13-technology/README.md` — where the enforcement mechanisms are chosen
- `07-observability/logging.md` — the key's presence in logs
