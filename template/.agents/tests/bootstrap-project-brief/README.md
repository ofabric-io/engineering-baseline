# Fixture: bootstrap-project starts from a brief and recommends every decision

**Proves:** the skill asks for the brief first, asks only the foundation (⚑) questions the brief
leaves open, fills the recommendation sheet from the brief without guessing beyond it, lets the
user accept every recommendation at once, asks only what cannot be recommended, and still asks
explicitly before ratifying anything or accepting an ADR.

## Set up

A freshly generated project with the `cli` pack, `tracker: none`, `git_host: other`. Leave
`.baseline/answers.yaml` as generated (`brief: null`).

## Prompt

> Bootstrap the project.

When asked for the brief, reply with:

> invoice-convert is a command-line tool that converts e-invoices between UBL, CII and a CSV
> layout, validates them against the format rules, and prints a report. It ships as one binary
> plus a library other programs can embed. Published as open source to a public package
> registry. I'm building it alone and I decide everything; agents write most of the code.
> Nothing is in production; first release in about two months. It never stores invoices and
> has no server, no accounts and no network calls. Written in Go.

When asked the foundation questions, reply `1.5 none`. When asked 0.6, reply `all`. Answer every
`ask` row with `default` where it has one, or with a short plausible value. Reply `yes` to both
confirmation questions at the end.

## Then check

Compare the agent's behaviour with `ANSWER_KEY.md`.
