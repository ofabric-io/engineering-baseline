---
story: STORY-004
parent: FEAT-001
status: draft
tier: 3
tracker: null
branch: null
pr: null
depends-on: []
owner: Dana Reyes
created: 2026-01-10
---

# Export download 4

## Parent context

Part of FEAT-001.

## Scope of this change

**Components touched:** report-cli (cli)

## Acceptance criteria

1. The export returns every row the filter matches.
2. An empty filter returns an empty file, not an error.

## Standards to read

- `docs/17-specs/spec-lifecycle.md`

## Implementation notes

The download call honours the timeout rule in `timeouts-retries.md` (rule 3).

## Open questions

| # | Question | Blocks? | Answer or where it is decided |
| --- | --- | --- | --- |

## Deviations

None.
