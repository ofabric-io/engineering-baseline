---
layer: 01-business
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Business & Product Principles

## Purpose

What the product is and is not, and the priority order that settles conflicts between goals. Every lower layer is constrained by it. This document states how the project behaves; the product's own scope and non-goals are bootstrap answers recorded in the parameters below, not rules written here.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `scope` | [[scope]] | none — must be answered | the in-scope capabilities for the first release; too wide a scope delays the first release, too narrow hides the seams the design needs |
| `non_goals` | [[non_goals]] | none — must be answered | capabilities that MUST NOT be built speculatively; an empty list invites scope creep |
| `priority_order` | [[priority_order]] | correctness > security > availability > latency > operability > delivery speed > cost | a system whose availability matters more than strict correctness (e.g. a data plane) reorders this |
| `priority_order_overrides` | [[priority_order_overrides]] | none | a different order for a named component, e.g. control plane vs data plane; each override is one more order to remember |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Which published interfaces (API, CLI flags, file formats, events) does the project promise to keep stable, and from which release?

## Rules

### What this is

- **R1.** The product's `scope` and `non_goals` MUST be recorded as bootstrap answers in the parameters of this document before the first feature spec is approved.
- **R2.** A capability listed in `non_goals` MUST NOT be built, stubbed or prepared for speculatively.
- **R3.** Moving a capability out of `non_goals` into `scope` MUST be recorded in an ADR.
- **R4.** A feature spec MUST name the `scope` item it serves; a feature that serves none MUST NOT be approved until `scope` is amended.

### The trade-off order

- **R5.** When goals conflict, the order in `priority_order` MUST decide the outcome; a higher-ranked goal beats a lower-ranked one.
- **R6.** A component named in `priority_order_overrides` MUST follow its own order; every other component MUST follow `priority_order`.
- **R7.** The order MUST NOT be renegotiated per feature or per deadline. Changing it requires an ADR and an edit to the parameter.
- **R8.** A document that makes a trade-off MUST cite the rank in `priority_order` that justifies it.

### How the project behaves

- **R9.** The project MUST NOT build for hypothetical scale, hypothetical users or hypothetical regulations; it builds for the ones that exist and keeps the seam where the next one would go (`10-patterns/patterns.md`).
- **R10.** A rule is only real if it is enforced. Every rule MUST name its mechanism in the `## Enforcement` table of its document, and a rule with no mechanism and no owner MUST be removed or made review-only on purpose.
- **R11.** Where a published standard covers a problem, the project MUST adopt it rather than invent its own (`05-protocols/rfc-profile.md`).

### Backward compatibility

- **R12.** A published interface MUST NOT be changed incompatibly, or removed, without advance notice to its consumers of at least `interface_deprecation_notice` (`15-delivery/releases-and-distribution.md` R17).
- **R13.** Internal refactoring is unconstrained by R12; the boundary is the published contract, not the code behind it.

### AI agents

- **R14.** AI agents MUST be held to the same standard as humans: the same rules, the same reviews, the same gates — no lower and no higher (`16-ai/autonomy-and-context.md`).

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | Spec-approval checklist requires the parameters to be filled | ⬜ scheduled |
| R2 | Spec review against `non_goals`; PR review | ❌ review-only |
| R3 | ADR required; review | ❌ review-only |
| R4 | Spec template field naming the `scope` item; approval checklist | ⬜ scheduled |
| R5–R7 | Cited by the documents that made each trade-off; this document is the register | ❌ review-only |
| R8 | Review of each document's rationale | ❌ review-only |
| R9 | Review; `10-patterns/patterns.md` | ❌ review-only |
| R10 | Document-structure check that every rule appears in `## Enforcement` | ⬜ scheduled |
| R11 | `05-protocols/rfc-profile.md` is the register; review | ❌ review-only |
| R12 | Interface-compatibility check in the delivery pipeline (tool chosen in `13-technology/`) | ⬜ scheduled |
| R13 | Not enforced; it is a permission, not a constraint | ❌ review-only |
| R14 | `16-ai/` rules; the same hooks and CI gates run for every author | ◐ partial |

## AI guardrails

```text
Scope and non-goals are in the parameters. Never build a non-goal - not even a stub.
Moving a non-goal into scope needs an ADR.
When goals conflict, follow priority_order. Never reorder it for a deadline.
Never build for hypothetical scale, users or regulations. Keep the seam, not the feature.
A rule with no enforcement mechanism is a wish - say so rather than assume it holds.
If a published standard covers it, use the standard.
Never break a published interface without notice. Internal code is yours to refactor.
You are held to the same rules as a human reviewer would hold a human.
```

## References

- `01-business/availability.md` — the numbers behind availability and latency goals
- `01-business/compliance-and-data.md` — the regulatory constraints
- `10-patterns/patterns.md` — the anti-speculation rule in practice
- `05-protocols/rfc-profile.md` — adopting published standards
- `16-ai/autonomy-and-context.md` — how agents are governed
- [Semantic Versioning 2.0.0](https://semver.org/) — signalling compatibility
- [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) — requirement keywords
