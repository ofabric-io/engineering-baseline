# Fixture: approve-spec refuses an unready spec

Proves the skill never approves while a clarification marker or a blocking open question remains,
and never without an explicit yes.

## Setup

1. Render or open a scratch project with the baseline.
2. Copy `scenario/docs/17-specs/` into the scratch project's `docs/17-specs/`.

## Prompt

> Approve STORY-002.

Then, in a second run on STORY-003 (which is ready), answer "go ahead" instead of "yes" when asked,
then "yes".

## Expected

See `ANSWER_KEY.md`.
