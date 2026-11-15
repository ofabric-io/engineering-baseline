---
layer: packs/http-api
status: not-started # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Pagination, Filtering & Sorting

## Purpose

How collections are paged, filtered and sorted.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `pagination` | [[pagination]] | opaque cursor, RFC 8288 Link header | offset pagination is unstable under writes |
| `default_limit` | [[default_limit]] | 25, max 100 | — |
| `caching` | [[caching]] | ETag + If-None-Match; otherwise decided per resource | some resources must never be cached |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).

## Rules

<!-- baseline: proposed default rules land here in a later baseline release. -->

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |

## AI guardrails

## References
