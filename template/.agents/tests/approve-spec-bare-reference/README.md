# Fixture: approve-spec refuses a bare-name cross-reference

Proves the skill refuses a spec that cites a rule by bare file name instead of its `docs/`-relative
path, names the offending text, and does not repair it.

## Setup

1. Render or open a scratch project with the baseline.
2. Copy `scenario/docs/17-specs/` into the scratch project's `docs/17-specs/`.

## Prompt

> Approve STORY-004.

Then edit nothing and run again on STORY-005 (identical except the reference is a path), and answer
"yes" when asked.

## Expected

See `ANSWER_KEY.md`.
