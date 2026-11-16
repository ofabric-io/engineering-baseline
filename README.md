# engineering-baseline

**Start every project with its engineering standards already written, decided and enforced.**

Most teams begin a project with a repository and a promise to "write the standards later". Later
never comes, each decision gets made again in every pull request, and an AI coding agent fills the
gaps with guesses. `engineering-baseline` is a [Copier](https://copier.readthedocs.io) template that
gives a new project a complete, versioned engineering system on day one: standards that cover
business intent through delivery, a decision record, a spec workflow, operating rules for AI
agents, and the checks that hold all of it in place.

Tell an AI tool about your project in a few paragraphs. It recommends an answer for every decision,
you accept or change them, and the project ends up with ratified standards and recorded decisions
instead of a blank `docs/` folder.

## Why it exists

- **Decisions get made once.** Naming, error handling, timeouts, retries, branching, test levels
  and what an agent may touch without asking are written down with a default and the trade-off in
  one line. Nobody re-argues them in review.
- **AI agents need written rules to be reliable.** An agent with no standards guesses, and its
  guesses differ from one session to the next. Here every agent reads the same rules, and a rule
  that is not yet adopted is marked as unratified, so the agent says so instead of presenting it as
  binding.
- **A rule nobody checks is a wish.** Every rule in the baseline appears in an enforcement table,
  marked automated, partial, scheduled or deliberately review-only. The real gates are git hooks
  and CI, which every human and every AI tool passes through.
- **Starting from scratch is slow, and copying an old project copies its mistakes.** The baseline
  holds no product, company or technology choices, so nothing has to be stripped out.

## What it gives you

| You get | What it is |
| --- | --- |
| **A standards hierarchy** | 17 layers, read top-down: business, domain, architecture, decisions, protocols, security, observability, reliability, errors, patterns, style, testing, technology, git, delivery, AI operations and specs. Each layer constrains the ones below it. More than 1,000 numbered, testable rules. |
| **Optional packs** | Standards for capabilities only some projects have: `http-api`, `events`, `webhooks`, `money`, `ledger`, `multi-tenant`, `audit-trail`, `user-interface`, `web-ui`, `cli`, `data-store`, `domain-model`. A project without a pack has no trace of it. |
| **A bootstrap that does the deciding** | Starts from a free-text brief, recommends an answer to every decision, and asks only what the brief cannot settle. It resumes where it stopped and works on a branch that ends in a pull request. |
| **A decision record** | ADR templates and a `new-adr` skill, with ADR-001 recording which baseline version the project adopted. A ratified document changes only through an ADR. |
| **A spec workflow** | Feature specs, stories, approval that refuses a spec with unresolved questions, triage, and a pull-request skill, with the work tracked in the repository, GitHub Issues or ClickUp. |
| **Rules for AI agents** | One vendor-neutral `AGENTS.md`, ten skills, a `judge` and a `researcher` agent, and a model-routing and autonomy policy. Pointer files for Claude Code, Codex, Copilot, Cursor and Gemini are generated, never hand-edited. |
| **Enforcement** | Git hooks (Conventional Commits, secret scanning), a checker for document structure, status, links, unresolved markers and rule-to-enforcement coverage, and an optional GitHub Actions workflow. |

## Why it is efficient

- **Defaults first.** Every parameter ships with a recommended default and a one-line trade-off.
  The bootstrap recommends all of them from your brief and lets you accept them at once. You spend
  your time on the few decisions that are really yours.
- **Rules are written once.** A skill or agent links to the document that holds a rule and never
  restates it, so there is one place to change and nothing to keep in sync.
- **Small context for agents.** Each document ends with fewer than ten blunt guardrail lines, and
  tool-specific files are one-line pointers. An agent reads what it needs instead of a pile of
  duplicated instructions.
- **Status-gated trust.** `not-started`, `proposed`, `in-progress` and `ratified` tell an agent how
  far to rely on a document, so it is never confidently wrong about a rule nobody agreed to.
- **Cheap to stay current.** `copier update` proposes improvements from newer baseline versions,
  and the changelog names the documents a project may already have ratified.
- **Tested.** `node tests/render.mjs` renders sample projects for every pack, runs their checks,
  and proves that each check fails on a deliberate violation.

## Getting started

### Before you begin

- [Copier](https://copier.readthedocs.io) 9.4 or later, which needs Python: `uv tool install copier`
  or `pipx install copier`.
- Node 20 or later, for the bundled checks. This holds whatever your project's own stack is.
- Git.

### Create a project

```sh
copier copy gh:ofabric-io/engineering-baseline my-project
cd my-project
git init && git config core.hooksPath .githooks
node scripts/sync-adapters.mjs
node scripts/check.mjs
```

Copier asks a few questions about which files should exist: the project name, which packs you
need, where work is tracked, the git host and the CI provider. You can add a pack later.

### Bootstrap it

Open the project in any AI coding tool and ask it to run the `bootstrap-project` skill
(`.agents/skills/bootstrap-project/SKILL.md`). No AI tool? Work through
`bootstrap/questionnaire.md` by hand; a human can do everything an agent can.

1. You describe the project in a free-text brief. "Don't know" is a fine answer to any item.
2. The skill asks the few foundation questions the brief leaves open.
3. It writes a recommendation sheet (`.baseline/recommendations.md`) with an answer for every
   decision.
4. You accept the whole sheet, or only some of it, and answer the rest.
5. It writes the documents, ratifies them on your explicit yes, records the ADRs and opens a pull
   request.

### Ask your AI tool to do it

You can skip the commands above and hand the repository to an agent:

> Hey Claude, let's start a new project called `ledger-api` with
> https://github.com/ofabric-io/engineering-baseline

With the brief in the same message:

> Hey Claude, start a new project from https://github.com/ofabric-io/engineering-baseline. It's a
> B2B invoicing API for small accounting firms, with a REST API, background jobs and a
> single-page admin app. Include the http-api, money and multi-tenant packs, track work in GitHub
> Issues, then run the bootstrap.

To pick up where you left off:

> Continue the bootstrap for this project.

To decide one document at a time:

> Let's ratify the testing standard.

To add a capability later:

> Add the events pack to this project from the engineering baseline.

The agent needs Copier and Node installed, and permission to run commands in your terminal. The
tool does not have to be Claude: the rules, skills and agents are the same in every tool.

### Pull in improvements later

```sh
copier update
```

## Two kinds of questions

| Asked by | When | Decides |
| --- | --- | --- |
| **Copier** (`copier.yml`) | Once, at creation | Which files exist: packs, tracker, CI |
| **Bootstrap skill** (`bootstrap/questionnaire.md`) | After creation, resumable; starts from a brief and recommends every answer | What the documents say: scope, priorities, domain, architecture, defaults |

## Design principles

The baseline is deliberately:

- **Business-agnostic.** No rule assumes what the product does. Where a rule cannot be generic,
  it is a **parameter** answered at bootstrap, or it lives in an optional **pack**.
- **Technology-agnostic.** The stack is a slot (`docs/13-technology/`) filled by each project's
  own decisions and ADRs. The baseline never picks a language, framework or database.
- **AI-tool-agnostic.** Every rule, skill and agent lives in a vendor-neutral file
  (`AGENTS.md`, `.agents/`). Tool-specific files are generated one-line pointers, shipped for
  every supported tool so a project works in any of them without setup.
- **Enforced.** A rule with no enforcement mechanism is a wish. See `maintainers/principles.md`.

## Status

Pre-1.0. Every milestone up to the dogfood stage is done. Still open before `v1.0.0`: another
bootstrap run on a project with packs, running the bootstrap and skill fixtures in at least two
different AI tools, and live tests of the GitHub Issues and ClickUp adapters. See
[ROADMAP.md](ROADMAP.md). Standards ship as `proposed` defaults: your project ratifies them, and
only a ratified document is binding.

## Repository layout

```text
copier.yml            creation-time questions
template/             everything rendered into a new project
maintainers/          how to work on the baseline itself (not copied)
tests/                renders sample projects and runs their checks
ROADMAP.md            milestones toward v1.0.0
CHANGELOG.md          released versions
```

## Contributing

Read `AGENTS.md` and `maintainers/principles.md` first: every change to `template/` is copied into
every future project. Run `node tests/render.mjs` before you finish.

## Versioning

SemVer, as git tags (`v0.1.0`). A project records the version it adopted in
`.copier-answers.yml` and in its ADR-001.
