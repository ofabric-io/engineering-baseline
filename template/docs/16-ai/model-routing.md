---
layer: 16-ai
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Model Routing

## Purpose

Which capability tier of model to use for which kind of delegated work, independent of vendor.
Rules name tiers; only the mapping table below names a vendor's models, so changing vendor
changes one table and no rule.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `tiers` | [[tiers]] | `strong` · `standard` · `fast`, mapped per vendor in the table below | naming vendor models in rules locks the rules to a vendor |
| `model_mapping_review_cadence` | [[model_mapping_review_cadence]] | every quarter, and whenever a vendor retires a model in the table | rarer review leaves the table naming retired models; more frequent review is churn |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Fill the mapping table: one row per AI vendor the project uses, with the model for each tier.

## Rules

### Tiers and mapping

- **R1.** Work MUST be routed by capability tier, never by a vendor's model name. The tiers are
  those in `tiers`; the defaults mean:

  | Tier | Capability | Typical use |
  | --- | --- | --- |
  | `strong` | Most capable, slowest, most expensive | Architecture, ambiguous requirements, security, irreversible changes, review, final judgement |
  | `standard` | Balanced | Implementation of a specified change, research, drafting |
  | `fast` | Cheapest, quickest, least capable | Narrow mechanical work with an easily checked result |

- **R2.** The project MUST keep a mapping table in this document with one row per vendor it uses
  and one column per tier, and MUST review it per `model_mapping_review_cadence`. Model names appear
  only there.

  | Vendor | `strong` | `standard` | `fast` |
  | --- | --- | --- | --- |
  | [[vendor_1]] | [[model_for_strong]] | [[model_for_standard]] | [[model_for_fast]] |

- **R3.** An agent definition (`.agents/agents/*.md`) MUST declare a tier, not a model name.
- **R4.** When a vendor offers no model at a tier, the row MUST say which tier substitutes, and
  the substitute MUST be the next more capable tier, never a less capable one.

### Choosing a tier

- **R5.** Delegated work MUST use the least capable tier likely to succeed, when the work is
  narrow, well specified and easy to verify.
- **R6.** Architecture decisions, ambiguity resolution, security-relevant work, irreversible
  changes, review and the final judgement that work is done MUST use `strong`.
- **R7.** `fast` MUST NOT be used for implementation, review, security work or any judgement.
  It MAY be used for lookups, listing, summarising a known file, and mechanical transformations
  whose output is checked.
- **R8.** A change's autonomy tier (`16-ai/autonomy-and-context.md` R2) does not lower the model
  tier required by R6.

### Delegating

- **R9.** The delegating agent MUST validate every delegated result before using it. A
  delegated result is input to judgement, not a verdict.
- **R10.** Each delegation MUST have one bounded objective, explicit constraints (files it may
  read, whether it may write, what it must not do) and a stated output format.
- **R11.** A delegate MUST NOT be given a secret or personal data it does not need
  (`16-ai/prohibitions.md` P14).
- **R12.** When a delegate fails or returns an unusable result, the delegating agent MUST
  escalate to a more capable tier or narrow the task. It MUST NOT repeat an unchanged prompt at
  the same tier.
- **R13.** Delegation MUST NOT lower the standard of the work: the delegate follows the same
  procedure and prohibitions as the delegating agent (`16-ai/operating-procedure.md`,
  `16-ai/prohibitions.md`).

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | Review; rules in `docs/` name tiers only | ❌ review-only |
| R2 | The mapping table is part of this document; `scripts/check.mjs` fails a ratified document with an unfilled `[[...]]` marker | ◐ partial |
| R3 | Agent definitions carry a `model-tier` field; review | ◐ partial |
| R4 | Review of the mapping table | ❌ review-only |
| R5, R6, R7, R8 | Review of the agent definition's declared tier and of delegation prompts | ❌ review-only |
| R9, R12 | Instruction only; the validation is visible in the pull request | ❌ review-only |
| R10, R11, R13 | Review of delegation prompts | ❌ review-only |

## AI guardrails

- Pick the tier, not the model name.
- Least capable tier that will do, for narrow, specified, checkable work.
- `strong` for architecture, ambiguity, security, irreversible changes, review, final judgement.
- Never `fast` for implementation, review, security or judgement.
- One objective, explicit constraints, stated output format per delegation.
- Validate what a delegate returns. Failed? Escalate the tier; never resend the same prompt.

## References

- `16-ai/autonomy-and-context.md`, `16-ai/operating-procedure.md`, `16-ai/prohibitions.md`
- `.agents/agents/` — role prompts that declare a tier
