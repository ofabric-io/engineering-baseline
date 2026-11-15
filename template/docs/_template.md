---
layer: NN-name
status: not-started # not-started | proposed | in-progress | ratified | not-applicable
owner: TBD
last-reviewed: never
# applies-to: [service, daemon]   # optional: component kinds this document concerns
# reason: <one line>              # required only when status is not-applicable
---

# <Document title>

## Purpose

One or two sentences: what this document decides, and what it deliberately leaves to others.

## Parameters

Choices this document needs from the project, each with a recommended default and the trade-off
in one line. The bootstrap asks them; the answers are recorded here and in
`.baseline/answers.yaml`. A rule never repeats the value its own parameter offers: it says
"per `example_param`". Parameter names are unique across all documents. A table the project
must fill ships with `[[...]]` in its first data row.

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `example_param` | [[answer]] | `value` | why you might choose otherwise |

## Open decisions

- [ ] Questions still to be answered. An agent that meets one relevant to its task stops and asks.

A `ratified` document may keep an unchecked bullet only if the bullet ends `→ DECISION-QUEUE`
(and the queue has the row). A `[NEEDS CLARIFICATION: question]` marker never survives
ratification; it is for drafts and specs only.

## Rules

Imperative, numbered, testable. One rule per item. No rationale here — link the ADR.

- **R1.** MUST ...
- **R2.** MUST NOT ... _(applies to: service, daemon)_
- **R3.** MAY ...

RFC 2119 keywords. Prefer MUST and MAY; a SHOULD needs a stated escape hatch.

**Scope tag.** A rule that applies only to some component kinds ends its **first line** with
` _(applies to: service, daemon)_` — kinds comma-separated, from `service`, `daemon`, `cli`,
`library`, `ui`, `batch`. A rule without a tag applies to every kind. Cite other documents by
their `docs/`-relative path and rule number (`08-reliability/timeouts-retries.md` R3).

**Document scope.** Optional `applies-to:` frontmatter limits the document to some kinds. When
the project's components (`03-architecture/system.md`) include none of them, set
`status: not-applicable` and `reason:`; the checks skip its rules.

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
