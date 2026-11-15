---
layer: NN-name
status: not-started # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# <Document title>

## Purpose

One or two sentences: what this document decides, and what it deliberately leaves to others.

## Parameters

Choices this document needs from the project, each with a recommended default and the trade-off
in one line. The bootstrap asks them; the answers are recorded here and in
`.baseline/answers.yaml`.

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `example_param` | [[answer]] | `value` | why you might choose otherwise |

## Open decisions

- [ ] Questions still to be answered. An agent that meets one relevant to its task stops and asks.
      Inline, write `[NEEDS CLARIFICATION: question]` where the gap is.

## Rules

Imperative, numbered, testable. One rule per item. No rationale here — link the ADR.

- **R1.** MUST ...
- **R2.** MUST NOT ...
- **R3.** MAY ...

RFC 2119 keywords. Prefer MUST and MAY; a SHOULD needs a stated escape hatch.

## Enforcement

Every rule appears here. Review-only (`❌`) is allowed, but only deliberately.

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | `scripts/...` | ✅ automated |
| R2 | CI job `...` | ⬜ scheduled |
| R3 | PR review | ❌ review-only |

## AI guardrails

The subset an agent gets wrong most often, as blunt imperatives. Under ten lines. No rule that
is not in `## Rules`.

## References

- ADR-NNN — the decision behind these rules
- External standard or RFC
