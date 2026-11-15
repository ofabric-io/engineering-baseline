# engineering-baseline

A reusable, versioned **engineering baseline** for new projects: a standards hierarchy, a
decision record, a spec workflow, AI-agent operating rules and the checks that enforce them.

It is deliberately:

- **Business-agnostic.** No rule assumes what the product does. Where a rule cannot be generic,
  it is a **parameter** answered at bootstrap, or it lives in an optional **pack**.
- **Technology-agnostic.** The stack is a slot (`docs/13-technology/`) filled by each project's
  own decisions and ADRs. The baseline never picks a language, framework or database.
- **AI-tool-agnostic.** Every rule, skill and agent lives in a vendor-neutral file
  (`AGENTS.md`, `.agents/`). Tool-specific files are generated one-line pointers, shipped for
  every supported tool so a project works in any of them without setup. The real gates are git
  hooks and CI, which every tool — and every human — passes through.

## Use it

Requires [Copier](https://copier.readthedocs.io) (Python) and Node 20+ for the bundled checks.

```sh
uv tool install copier            # or: pipx install copier
copier copy gh:ofabric-io/engineering-baseline my-project
cd my-project
git init && git config core.hooksPath .githooks
```

Then open the project with any AI coding tool and ask it to run the **bootstrap-project**
skill, or work through `bootstrap/questionnaire.md` by hand. The bootstrap turns your answers
into ratified standards and ADRs.

Later, pull improvements from newer baseline versions:

```sh
copier update
```

## Two kinds of questions

| Asked by | When | Decides |
| --- | --- | --- |
| **Copier** (`copier.yml`) | Once, at creation | Which files exist: packs, tracker, CI |
| **Bootstrap skill** (`bootstrap/questionnaire.md`) | After creation, resumable | What the documents say: scope, priorities, domain, architecture, defaults |

## Repository layout

```text
copier.yml            creation-time questions
template/             everything rendered into a new project
maintainers/          how to work on the baseline itself (not copied)
tests/                renders sample projects and runs their checks
ROADMAP.md            milestones toward v1.0.0
CHANGELOG.md          released versions
```

## Versioning

SemVer, as git tags (`v0.1.0`). A project records the version it adopted in
`.copier-answers.yml` and in its ADR-001.
