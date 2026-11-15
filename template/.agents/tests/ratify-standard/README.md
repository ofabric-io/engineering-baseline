# Fixture: ratify-standard

**Proves:** the skill asks the open decisions in one numbered batch, does not answer for the user,
completes the Enforcement table (the scenario document is missing a row), and ratifies only on an
explicit yes.

## Set up

Copy `scenario/docs/02-domain/time.md` over the same path in a scratch project.

## Prompt

> Let's ratify the time document.

Reply to the batch with `default` for the first parameter and nothing for the second. Do not say
yes to ratification until asked.

## Then check

Compare the agent's behaviour with `ANSWER_KEY.md`.
