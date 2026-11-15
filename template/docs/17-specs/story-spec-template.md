---
story: STORY-NNN
parent: FEAT-NNN # required
status: draft # draft | approved | implemented | superseded | abandoned
tier: TBD # 1 | 2 | 3 | 4 (docs/16-ai/autonomy-and-context.md)
tracker: null
pr: null # required to move to `implemented`
depends-on: [] # STORY-NNN / FEAT-NNN this cannot start before; [] = none
owner: TBD
created: YYYY-MM-DD
---

# [[Story name]]

> One implementable slice: small enough to review in one sitting, complete enough to ship on
> its own. An agent implementing it reads **only** this file, its parent, and the documents in
> `## Standards to read`. Everything it needs must be here or named here.

## Parent context

<!-- One paragraph: how this fits the parent feature. Link it. -->

## Scope of this change

**Parts touched:**

**Explicitly out of scope:**

## Autonomy tier

- [ ] Tier 1 — docs, comments, specs
- [ ] Tier 2 — tests only
- [ ] Tier 3 — feature code, refactor, bug fix
- [ ] Tier 4 — security, data migrations, CI, infrastructure, dependencies

## Acceptance criteria

<!-- Numbered, independently verifiable, each mapping to a test. The implementer ticks them one
     by one, having verified each. -->

1.

## Standards to read

<!-- If any is `not-started`, or `in-progress` with the relevant decision open, STOP: the standard
     is settled first. -->

- `docs/`

## Implementation notes

<!-- Known constraints, the decided approach, anything deliberately deferred. -->

## Verification

<!-- The literal commands that must pass. "Tests pass" is not verification; the command is. -->

```sh
node scripts/check.mjs
```

**Manual checks, if any:**

## Deviations

<!-- Filled in by the implementer: anything done differently, and every assumption made where a
     standard was silent. "None." is valid; silence is not. -->

None.
