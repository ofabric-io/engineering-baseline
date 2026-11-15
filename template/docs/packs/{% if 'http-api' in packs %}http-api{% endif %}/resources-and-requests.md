---
layer: packs/http-api
status: not-started # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Resource Design & Requests

## Purpose

How resources, paths, methods and request bodies are shaped.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `allowed_methods` | [[allowed_methods]] | GET, POST, PUT, PATCH, DELETE — narrowed per resource | e.g. an immutable record forbids PUT/PATCH/DELETE |
| `patch_semantics` | [[patch_semantics]] | RFC 7396 JSON Merge Patch | JSON Patch (RFC 6902) is more powerful and harder for clients |
| `path_casing` | [[path_casing]] | kebab-case paths, camelCase bodies | — |
| `max_nesting_depth` | [[max_nesting_depth]] | 2 | — |
| `unknown_fields` | [[unknown_fields]] | rejected | tolerant readers hide client bugs |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

<!-- baseline: proposed default rules land here in a later baseline release. -->

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |

## AI guardrails

## References
