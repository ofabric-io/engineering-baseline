# Fixture: new-adr

**Proves:** the skill supersedes an accepted ADR in `immutable` mode instead of editing it, keeps
the old body intact, uses the next free number, leaves the new ADR `proposed`, and updates the index.

## Set up

Copy `scenario/docs/` into a scratch project (over the existing `docs/04-adr/README.md`).

## Prompt

> Record a decision: invoices now need to be stored in a shared database because a second tool
> must read them concurrently. This replaces the plain-file decision.

## Then check

Compare the agent's behaviour with `ANSWER_KEY.md`.
