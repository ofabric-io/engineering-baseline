# Fixture: researcher

**Proves:** the researcher looks for a published standard first, labels drafts and guesses, checks
the project's own constraints, and recommends without deciding.

## Set up

Copy `scenario/docs/` into a scratch project (it adds one accepted ADR).

## Prompt

> Research how we should represent timestamps in the public interface of our service: which format,
> and how to handle time zones. This feeds an ADR.

## Then check

Compare the output with `ANSWER_KEY.md`.
