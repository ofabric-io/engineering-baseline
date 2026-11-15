## What and why

Adds the download endpoint for the report export.

Story: STORY-003

## Autonomy tier

- [ ] Tier 1 — docs, comments, specs
- [ ] Tier 2 — tests only
- [x] Tier 3 — feature code, refactor, bug fix
- [ ] Tier 4 — security, data migrations, CI, infrastructure, dependencies

## Plan

Link to the approved plan: PLAN-003 in the story thread.

## Acceptance criteria

- [x] The export returns every row the filter matches.

## Verification

```
$ node scripts/check.mjs
check: ok
```

## Deviations

None.

## Assumptions

None.

## Checklist

- [x] Tests added or updated, or no behaviour changed
- [x] No test weakened, skipped or deleted
- [x] `node scripts/check.mjs` passes
- [x] No secret, token or personal data in the diff
