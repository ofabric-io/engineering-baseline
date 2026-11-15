<!-- docs/14-git/git.md: the pull request body is this template, every section answered. -->

## What and why

<!-- One paragraph: what changed and the reason. Link the story spec. -->

Story: <!-- STORY-NNN, or "none — chore" -->

## Autonomy tier

<!-- docs/16-ai/autonomy-and-context.md: state the tier and why. -->

- [ ] Tier 1 — docs, comments, specs
- [ ] Tier 2 — tests only
- [ ] Tier 3 — feature code, refactor, bug fix
- [ ] Tier 4 — security, data migrations, CI, infrastructure, dependencies

## Plan

<!-- Tier 3-4: link the plan that was approved before the work started. Tier 1-2: write
     "Not applicable — tier 1-2". -->

## Acceptance criteria

<!-- Copy from the story spec. Tick each one only after verifying it individually. -->

- [ ]

## Verification

<!-- The commands you actually ran and their verbatim result. "Tests pass" is not verification. -->

```
$
```

## Deviations

<!-- Anything done differently from the spec or a standard. "None." is a valid answer; silence
     is not. -->

None.

## Assumptions

<!-- Every assumption made where the spec or a standard was silent. "None." is valid. -->

None.

## Checklist

- [ ] Tests added or updated, or no behaviour changed
- [ ] No test weakened, skipped or deleted
- [ ] `node scripts/check.mjs` passes
- [ ] No secret, token or personal data in the diff
