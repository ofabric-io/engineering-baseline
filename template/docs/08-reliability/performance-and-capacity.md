---
layer: 08-reliability
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Performance & Capacity

## Purpose

How fast each kind of component must be, how that is measured and defended against regression, how much headroom it needs, and how its cost is tracked. Availability targets are in `01-business/availability.md`; timeouts and degradation in `08-reliability/timeouts-retries.md`.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `performance_regression_tolerance` | [[performance_regression_tolerance]] | a change that worsens a budgeted measure by more than 10% fails its check | a tight tolerance flags noise; a loose one lets budgets erode |
| `load_test_triggers` | [[load_test_triggers]] | before first launch, before a change that alters a hot path, and before an expected traffic increase | more triggers cost environment time; fewer find limits in production |
| `capacity_headroom` | [[capacity_headroom]] | peak demand uses at most 60% of capacity | more headroom costs money; less leaves no room for failure or spikes |
| `capacity_review_cadence` | [[capacity_review_cadence]] | quarterly | frequent reviews cost time; rare ones miss growth |
| `cost_tracking` | [[cost_tracking]] | infrastructure cost attributed per component and reviewed monthly | finer attribution needs tagging effort |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Which components are performance-critical enough for a load test before launch?
- [ ] Which budgets does a customer or contract fix?

## Rules

### Budgets

- **R1.** Every component MUST have a performance budget for the measure that matters to its kind, recorded in the budgets table below.

  | Component | Measure | Budget |
  | --- | --- | --- |
  | [[budget_component]] | [[budget_measure]] | [[budget_target]] |

- **R2.** The measure MUST fit the component kind: start-up and run time for a `cli`, latency percentiles and error rate for a `service`, throughput and lag for a `daemon` or `batch`, call overhead and memory for a `library`, interaction latency for a `ui`.
- **R3.** A budget MUST state the percentile or statistic, the load it holds under and the environment it is measured in.

### Measuring

- **R4.** A budget MUST be checked by an automated benchmark or measurement in CI or on a schedule, not by opinion.
- **R5.** A change that worsens a budgeted measure by more than `performance_regression_tolerance` MUST fail its check or be accepted by an explicit, recorded decision.
- **R6.** An optimisation MUST be preceded by a measurement showing the problem and followed by one showing the improvement.
- **R7.** A budget MUST NOT be relaxed to make a check pass; relaxing one needs its own reviewed change.

### Load and capacity

- **R8.** A `service`, `daemon` or `batch` component MUST be load tested at the points in `load_test_triggers`, in an environment shaped like production and with realistic data volumes. _(applies to: service, daemon, batch)_
- **R9.** A load test MUST find and record the point at which the component degrades, and what degrades first.
- **R10.** Production capacity MUST keep peak demand within `capacity_headroom`, and each bounded resource MUST have a saturation signal (`07-observability/metrics-and-tracing.md` R6). _(applies to: service, daemon, batch)_
- **R11.** Capacity MUST be reviewed on `capacity_review_cadence` against demand growth and the load-test results, with the outcome recorded.

### Cost

- **R12.** Cost MUST be tracked per `cost_tracking`, and a sustained rise not explained by demand MUST be investigated.
- **R13.** A change that raises a component's steady-state cost materially MUST state the increase in its change description.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | Document completeness at ratification | ❌ review-only |
| R2 | Review of the budgets table | ❌ review-only |
| R3 | Review of the budgets table | ❌ review-only |
| R4 | Benchmark job in CI or on a schedule, chosen in `13-technology/` | ⬜ scheduled |
| R5 | Benchmark comparison against the base branch | ⬜ scheduled |
| R6 | PR review | ❌ review-only |
| R7 | PR review of any budget change | ❌ review-only |
| R8 | Load-test job and its record | ⬜ scheduled |
| R9 | Load-test report review | ❌ review-only |
| R10 | Saturation alerts; capacity review | ◐ partial |
| R11 | Review record | ❌ review-only |
| R12 | Cost report review | ❌ review-only |
| R13 | PR review | ❌ review-only |

## AI guardrails

- Measure before you optimise; show the number after.
- Never relax a budget or raise a tolerance to make a check pass.
- State the performance and cost effect of a change that touches a hot path.
- Do not add caching or concurrency for speed without a measurement.

## References

- [Google SRE Book: Handling Overload](https://sre.google/sre-book/handling-overload/)
- `01-business/availability.md`, `08-reliability/timeouts-retries.md`, `07-observability/metrics-and-tracing.md`
