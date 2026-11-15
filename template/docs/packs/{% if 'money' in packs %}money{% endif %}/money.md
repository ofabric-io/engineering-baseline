---
layer: packs/money
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Monetary Amounts

## Purpose

How money is represented, computed, rounded, serialized and stored. Money reaches every entity,
message payload and column, so this is the most expensive representation decision to change
later. This document does not decide which currencies the product supports, its rounding
boundaries, or how exchange rates are sourced — those are parameters or project decisions.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `representation` | [[representation]] | integer amount at a fixed internal scale, plus ISO 4217 currency | floating point is forbidden |
| `internal_scale` | [[internal_scale]] | 6 decimal places | more than any currency needs, so fees and rates do not lose precision; a larger scale shrinks the representable range |
| `rounding_mode` | [[rounding_mode]] | half-up (half away from zero), passed explicitly | banker's rounding is common in accounting and removes upward bias |
| `rounding_boundaries` | [[rounding_boundaries]] | settlement, invoicing, ledger posting, and any external system that accepts only standard minor units | each extra boundary is a place precision is lost; fewer boundaries means more pending fractions |
| `currency_allowlist` | [[currency_allowlist]] | the closed set of currencies the product transacts in | an open list means unvetted currencies reach settlement |
| `multi_currency` | [[multi_currency]] | single: one currency for the whole product. Alternatives: single per isolation unit (if the project has isolation units: each has one currency, units may differ), or multiple within a unit | single needs no conversion at all; single per isolation unit keeps every calculation single-currency but needs a currency fixed at unit creation; multiple adds conversion rules and rate sourcing |
| `wire_format` | [[wire_format]] | amount as an integer string + currency code | JSON numbers lose precision in many clients |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Storage width: is a 64-bit integer enough at `internal_scale`, or do aggregate and
      long-lived balances need a wider exact type? Decide per column and record it.
- [ ] If `multi_currency` is on: where do exchange rates come from, how long is a snapshot valid,
      and who absorbs the movement between quote and settlement?
- [ ] Which currencies have a settlement precision other than two decimal places?

## Rules

### Representation

- **R1.** A monetary value MUST use `representation`; with the default, an integer amount at the
  scale in `internal_scale` plus a currency. Binary floating-point values MUST NOT be used to
  calculate, persist or transmit money.
- **R2.** A monetary value MUST be one `Money` type carrying exactly two fields: an `amount` in
  the form `representation` gives (with the default, an integer in internal units) and a
  `currency` code.
- **R3.** A loose numeric monetary amount MUST NOT exist. Every amount of money — in a domain
  object, request, event payload, parameter or return value — is a `Money`. Any other number that
  carries a unit MUST name its unit (`11-style/`).
- **R4.** The internal scale MUST be defined once, as one named constant, and MUST be
  independent of the currency. A currency-scale literal (`100`, `1000000`) MUST NOT appear
  anywhere outside the money module.
- **R5.** Internal precision MUST be kept distinct from a currency's settlement precision.
  Calculations MAY retain precision beyond the currency's smallest unit; only a settlement
  boundary (R12) reduces it.
- **R6.** `currency` MUST be an ISO 4217 alphabetic code: three uppercase letters.

### Access and arithmetic

- **R7.** Every operation on `Money` MUST go through the one shared money module: at least
  add, subtract, multiply by a scalar, divide, allocate, compare, negate and reduce to settlement
  precision, plus convert when conversion exists (R11).
- **R8.** Direct access to the raw `amount` MUST NOT occur outside the money module and its own
  tests.
- **R9.** Arithmetic or comparison between amounts of different currencies MUST NOT occur. The
  money module MUST fail on a currency mismatch.
- **R10.** `Money` multiplied by `Money` MUST NOT be defined. Only `Money` ± `Money` and `Money`
  × scalar exist.
- **R11.** Where conversion exists (`multi_currency` allows more than one currency in a place
  that must combine them), it MUST be an explicit operation that requires an exchange rate, the
  rate's source, its applicable timestamp and a rounding policy, with no default for any of them,
  and the `convert` operation is then required in the money module. Where no conversion exists
  (`multi_currency` is single, or single per isolation unit with no cross-unit amounts combined),
  the module MUST NOT offer one.

### Rounding

- **R12.** Rounding MUST occur only at the boundaries listed in `rounding_boundaries`. Adding a
  boundary requires an ADR (`04-adr/README.md`).
- **R13.** Rounding behaviour MUST be explicit. The mode MUST be a required parameter with no
  default value, so every call site states it; a language, library or storage default MUST NOT
  decide it. The mode MUST be the one in `rounding_mode`.
- **R14.** Splitting an amount MUST use largest-remainder allocation so the parts re-sum exactly
  to the original. Splitting by repeated division MUST NOT be used.

### Transport and persistence

- **R15.** `amount` MUST be serialized in every text interchange format as `wire_format` says,
  paired with its currency code; with the default, as an integer string.
- **R16.** Inbound `amount` MUST be parsed and validated at the boundary against `wire_format`
  (with the default, as an integer string) and MUST NOT be accepted as a JSON number or any native
  floating-point type.
- **R17.** Storage MUST hold an amount in the exact type `representation` requires (with the
  default, an integer column) and the currency as a three-character column, written and read as a
  pair. A floating-point column, or a decimal column whose scale is not `internal_scale`, MUST NOT
  hold an amount.
- **R18.** `currency` MUST be validated against `currency_allowlist` at every system edge. An
  unlisted currency MUST be rejected, never silently converted.

### Verification

- **R19.** Allocation (R14) MUST have a property test: for arbitrary weights, the parts re-sum to
  the original exactly. Currency mismatch (R9) MUST have a unit test.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | Indirect: raw amount unreachable outside the module (R8); float arithmetic is review-only | ◐ partial |
| R2, R6 | Money type plus a validating currency parser (type system, tool chosen in `13-technology/`) | ⬜ scheduled |
| R3 | Lint rule banning amount-like identifiers outside the `Money` type | ⬜ scheduled |
| R4 | Lint rule on scale literals; the money module is the one exemption | ⬜ scheduled |
| R5 | A separate settlement-precision operation; review | ❌ review-only |
| R7, R8 | Module-boundary check restricting raw amount access (tool chosen in `13-technology/`) | ⬜ scheduled |
| R9, R10 | Every binary operation fails on mismatch; multiply accepts a scalar only; unit tests | ⬜ scheduled |
| R11 | Conversion signature requires a rate snapshot argument; no default; no conversion exported when none exists | ⬜ scheduled |
| R12 | Rounding exported only from the money module; architecture test on callers | ⬜ scheduled |
| R13 | Required parameter, so omitting the mode fails to build | ⬜ scheduled |
| R14, R19 | Property test over arbitrary weights | ⬜ scheduled |
| R15, R16 | One serializer and one parser; contract test rejecting a non-integer string | ⬜ scheduled |
| R17 | Migration review against the storage standard in `13-technology/` | ❌ review-only |
| R18 | Edge validation against the allowlist; test that an unlisted code is rejected | ⬜ scheduled |

## AI guardrails

```text
Money is an integer amount at one fixed scale plus an ISO 4217 code. NEVER a float.
NEVER a bare numeric amount - always Money.
Use the money module for every operation. Do not touch the raw amount outside it.
NEVER add, subtract or compare two currencies. Convert explicitly, with a rate.
NEVER write a scale literal. Round only at the named boundaries, mode passed explicitly.
Split with largest-remainder allocation. Never divide repeatedly.
Serialize per wire_format (default: strings); reject JSON numbers. Store the exact type + 3-char code.
```

## References

- [ISO 4217 — Currency codes](https://www.iso.org/iso-4217-currency-codes.html)
- `05-protocols/rfc-profile.md` — amended by this pack's adoption of ISO 4217
- `11-style/` — units in names
- `04-adr/README.md` — adding a rounding boundary
