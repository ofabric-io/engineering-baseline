---
layer: 12-testing
status: proposed
owner: TBD
last-reviewed: never
---

# Testing Strategy

## Purpose

Test levels, what each verifies, coverage gates, test hygiene, and what must always be tested.
This is the main guardrail against weakening a test to make a build pass. Runners, assertion
libraries and fixtures are technology choices and live in `13-technology/`.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `test_levels` | [[test_levels]] | derived per component kind from the table after the rules (a library has no end-to-end level) | fewer levels are cheaper to run; each dropped level leaves a class of defect to production |
| `extra_test_levels` | [[extra_test_levels]] | none; performance and fault-injection levels MAY be added | each added level needs an environment and upkeep, and finds a class unit tests cannot |
| `coverage_gate` | [[coverage_gate]] | per changed file; `none` is allowed | a project-wide number is satisfiable by testing the wrong things; no gate relies on review alone |
| `coverage_minimum` | [[coverage_minimum]] | 80% of changed lines, the only granularity used | higher minimums slow delivery; lower ones let logic ship untested |
| `bug_fix_rule` | [[bug_fix_rule]] | a failing test first | none significant; without it a fix cannot be verified |
| `property_based_testing_for` | [[property_based_testing_for]] | arithmetic and state machines | broader use finds more defects and costs more to write |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Which user flows are critical enough to require an end-to-end test before launch?
- [ ] Which external systems need a provider-owned test environment, and in which scheduled job
      does it run (R19)?

## Rules

### Levels

- **R1.** Every level that `test_levels` assigns to a component's kind, and every level in `extra_test_levels`, MUST exist for that component and MUST be a blocking CI gate
  (`15-delivery/pipeline-and-gates.md`).
- **R2.** The level MUST be chosen by what is verified, not by convenience:

  | What changed | Required test |
  | --- | --- |
  | Business logic, a calculation, a state transition | unit |
  | Storage behaviour, a query, a schema change | integration, against a real store |
  | A request or response shape, a published message | contract |
  | A dependency direction or layer boundary | architecture |
  | A critical user flow | end-to-end |
  | A defect | a failing regression test first (R3) |

- **R3.** A bug fix MUST be preceded by a test that fails for the reported reason, per `bug_fix_rule`.
- **R4.** An architecture test MUST be an executable suite, not a review convention, and MUST at
  least assert the dependency direction in `03-architecture/dependency-rules.md`.

### Coverage

- **R5.** Where `coverage_gate` is not `none`, the gate MUST follow `coverage_gate` and `coverage_minimum`, at the one granularity they name, and MUST block merge.
- **R6.** Where `coverage_gate` is not a project-wide percentage, no project-wide percentage threshold MUST be configured as a gate.
- **R7.** Where a coverage gate exists, its thresholds MUST NOT be lowered to make a build pass; lowering one needs its own
  change, reviewed separately.

### Mandatory tests

- **R8.** Code covered by `property_based_testing_for` MUST have property-based tests; for state
  machines the property is that no sequence of legal transitions reaches an illegal state.
- **R9.** Every lifecycle transition (`02-domain/lifecycles.md`) MUST have a test that the legal
  transition is permitted and a test that each illegal one is rejected.
- **R10.** A change that alters behaviour MUST include a test; a change that alters none MUST say
  so in its pull request.
- **R11.** A test requirement MAY be waived only by the reviewer, explicitly, in the pull request;
  the author MUST NOT waive it.
- **R12.** A test MUST NOT be skipped, deleted or have its assertions weakened to make a build pass.

### Isolation and mocking

- **R13.** An integration test MUST NOT mock the store it is testing.
- **R14.** A mock, stub or fake MUST be used only at a port boundary (storage, clock, outbound
  client, queue); the unit under test MUST NOT be mocked or spied on.
- **R15.** A test MUST NOT depend on execution order or on data left behind by another test; each
  test creates what it needs from builders with sensible defaults.

### Determinism

- **R16.** Time MUST be frozen in tests through an injected clock; the system clock MUST NOT be read.
- **R17.** A test MUST be deterministic: randomness is seeded, no real network access, and no sleep
  as a synchronisation mechanism.
- **R18.** A flaky test MUST be quarantined under `15-delivery/pipeline-and-gates.md` and MUST NOT
  be retried until it passes.

### External systems

- **R19.** An external system's own hosted test environment MUST be exercised only in a scheduled
  job, never in the pull-request path.
- **R20.** A fake of an external system MUST be able to produce every failure the real one can:
  rejection, timeout, duplicate, partial success and a malformed response.
- **R21.** A test suite that matches zero tests MUST fail.

## Default levels per component kind

When `test_levels` is left at its default, a component of each kind (`03-architecture/system.md`) has these levels. `extra_test_levels` adds to them.

| Kind | Levels |
| --- | --- |
| `service` | unit, integration, contract, architecture, end-to-end |
| `daemon` | unit, integration, architecture |
| `cli` | unit, integration (running the command), architecture where it has layers |
| `library` | unit, contract (the public interface), architecture |
| `ui` | unit, integration, end-to-end |
| `batch` | unit, integration |

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | CI jobs, one per level (`15-delivery/pipeline-and-gates.md`) | ⬜ scheduled |
| R2, R3 | PR review; the regression test appears in the same change as the fix | ❌ review-only |
| R4 | Architecture suite in CI (tool chosen in `13-technology/`) | ⬜ scheduled |
| R5 | Coverage thresholds plus a changed-code coverage step | ⬜ scheduled |
| R6 | No project-wide threshold is configured unless `coverage_gate` names one | ❌ review-only |
| R7, R12 | Test-count and skip-count comparison against the base branch in CI; PR review | ⬜ scheduled |
| R8 | Property-based tests in the relevant suites | ⬜ scheduled |
| R9 | Lifecycle test helper enumerating the transition table; PR review | ⬜ scheduled |
| R10, R11 | PR template checkbox; the waiver is visible in the review thread | ❌ review-only |
| R13, R14 | Lint on mocking of internal modules; PR review | ◐ partial |
| R15 | Randomised test order in CI; PR review | ⬜ scheduled |
| R16 | Lint banning direct clock reads in test files | ⬜ scheduled |
| R17 | Network blocked in the test environment; seeded randomness | ⬜ scheduled |
| R18 | Quarantine list with expiry dates, checked in CI | ⬜ scheduled |
| R19 | Credentials for external test environments exist only in the scheduled job | ⬜ scheduled |
| R20 | PR review; the fake and the port share one interface | ◐ partial |
| R21 | Runner configured to fail on an empty match | ⬜ scheduled |

## AI guardrails

- Never weaken, skip or delete a test to make a build pass.
- Never lower a coverage threshold where a gate exists.
- For a bug, write the failing regression test first, then fix it.
- The level follows what changed: logic, unit; storage, integration; shape, contract.
- Every lifecycle transition gets a legal and an illegal test.
- Arithmetic and state machines get property-based tests.
- Freeze the clock. Mock only at a port. Never retry a test until it passes.
- Only a reviewer waives a test requirement, never you.

## References

- `03-architecture/dependency-rules.md` — what the architecture suite asserts
- `02-domain/lifecycles.md` — transitions that need legal and illegal tests
- `15-delivery/pipeline-and-gates.md` — the gates these levels map onto
- `13-technology/README.md` — runners and tooling
