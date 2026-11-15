---
layer: packs/user-interface
status: not-started # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Design Tokens & Semantic Roles

## Purpose

How visual decisions are named and layered: primitives hold raw values, semantic tokens name a role, components use only semantic tokens. Covers themes, scales and the mapping from domain states to status roles.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `token_tiers` | [[token_tiers]] | two: primitives → semantic (a third, component tier, only when a component library needs it) | more tiers = more indirection to maintain |
| `token_vocabulary` | [[token_vocabulary]] | adopt an existing published vocabulary unchanged rather than inventing names | own names fit the brand better and match no tool or library |
| `token_format` | [[token_format]] | W3C Design Tokens Community Group format as the source; generated into whatever the stack consumes | a stack-native file is simpler but ties the tokens to one tool |
| `themes` | [[themes]] | light and dark; every semantic token resolves in every theme | a high-contrast theme adds a third set to verify |
| `brand_roles` | [[brand_roles]] | listed by the bootstrap: brand, primary action, focus — never substituted for one another | one accent for everything blurs what is clickable |
| `status_roles` | [[status_roles]] | success, warning, danger, info, neutral; domain states map to a role, never to a colour | mapping states straight to colours breaks on the first rebrand |
| `units` | [[units]] | sizes relative to the user's font size; no fixed pixel type | fixed units ignore user zoom preferences |
| `motion` | [[motion]] | durations and easings from tokens; reduced-motion preference always honoured | — |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

<!-- baseline: proposed default rules land here in a later baseline release. -->

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |

## AI guardrails

## References
