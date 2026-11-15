# Fixture: bootstrap-project

**Proves:** the skill resumes from recorded progress instead of starting over, asks a whole phase
as one numbered plain-text message with defaults, never answers for the user, and records answers
before writing documents.

## Set up

In a scratch copy of a freshly generated project, replace `.baseline/answers.yaml` with
`scenario/.baseline/answers.yaml` (phase 1 is done; phase 2 is not started).

## Prompt

> Continue the bootstrap.

## Then check

Compare the agent's behaviour with `ANSWER_KEY.md`.
