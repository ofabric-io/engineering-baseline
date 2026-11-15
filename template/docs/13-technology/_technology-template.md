---
layer: 13-technology
status: not-started # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# <Area>: <chosen technology>

A technology document records the rules that follow from one decision. Copy this file to
`13-technology/<area>.md`, replace the placeholders, and delete this paragraph. Use the section
shape of `docs/_template.md`; the sections below say what each MUST contain.

## Purpose

One or two sentences: the area this covers and the technology chosen.

## Decision

- The choice, named with its version policy (pinned, range, or tracked).
- A link to the ADR that records the choice and the alternatives considered.
- The date the decision was taken is the ADR's, not this document's.

## Parameters

Choices this technology leaves open, each with a default and a one-line trade-off. Write
`_none_` if there are none.

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `example_param` | [[example_param]] | `value` | why you might choose otherwise |

## Open decisions

- [ ] Questions still to answer. An agent that meets one relevant to its task stops and asks.

## Rules

Numbered, imperative, testable, as in every standards document. MUST cover, where they apply:

- **Conventions** — casing, file naming and layout, idioms that are required or banned, and the
  language- or framework-specific anti-patterns (same force as `10-patterns/patterns.md` R8).
- **Lint, format and type-check configuration** — the tool, the committed configuration file,
  which rules are errors, and the suppression policy (`11-style/naming-and-style.md` R15).
- **Boundaries** — how the module-boundary check of `03-architecture/dependency-rules.md` is
  configured with this technology.
- **Testing tooling** — runner, fixtures, isolation and coverage tool for
  `12-testing/strategy.md`.
- **Operational rules** — configuration, migrations, build and packaging rules that follow from
  the choice.

A rule here MUST NOT restate or relax a higher-layer rule; it names how this technology satisfies it.

## Enforcement

Every rule appears, with the concrete mechanism this technology provides and a status. Because the
tool is now known, a rule that a configuration file can enforce SHOULD be automated.

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | `path/to/config` | ✅ automated |

## AI guardrails

The subset an agent gets wrong most often, as blunt imperatives. Under ten lines.

## References

- ADR link — the decision behind these rules
- The technology's official documentation for the version in use
