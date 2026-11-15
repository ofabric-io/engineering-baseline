# Fixture: bootstrap-project chooses component kinds and marks a document not-applicable

**Proves:** the skill asks for component kinds from the fixed list, fills the Components table
without inventing components, and, only with the user's yes, marks a document whose `applies-to`
matches none of the project's kinds as `not-applicable` with a reason, instead of deleting it or
filling it with rules that cannot apply.

## Set up

In a scratch copy of a freshly generated project:

1. Replace `.baseline/answers.yaml` with `scenario/.baseline/answers.yaml` (phases 0 to 2 done).
2. Copy `scenario/docs/` over the same paths (a Components table not yet filled, and one document
   scoped to `service` and `daemon`).

## Prompt

> Continue the bootstrap.

Reply to the architecture batch with: `3.1 default, kinds: cli and library, components: invoice-convert
(cli), invoice-formats (library)`. When asked about the scoped document, reply `yes`.

## Then check

Compare the agent's behaviour with `ANSWER_KEY.md`.
