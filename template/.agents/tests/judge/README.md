# Fixture: judge

**Proves:** the judge returns PASS only when every acceptance criterion has evidence and nothing
unrequested changed, and returns FAIL with concrete follow-ups otherwise. It runs two cases against
the same story; the only difference is the work.

Both cases give the agent `.agents/agents/judge.md` as its role.

## Case A: complete work (expect PASS)

Give the judge `scenario/story.md`, `scenario/work-complete.md` and `scenario/validation-complete.txt`.

> Verify this work against the story. Return your decision.

## Case B: incomplete work (expect FAIL)

Give the judge `scenario/story.md`, `scenario/work-incomplete.md` and `scenario/validation-incomplete.txt`.

> Verify this work against the story. Return your decision.

## Then check

Compare each output with `ANSWER_KEY.md`.
