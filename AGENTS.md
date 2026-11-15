# Agent instructions — engineering-baseline

This repository is a **Copier template**. You are almost always editing what *other* projects
will inherit, so a mistake here is copied into every future project.

## Read first

1. `README.md` — what the baseline is and how it is used.
2. `maintainers/principles.md` — the four rules every change must satisfy (generic,
   parameterized, tool-neutral, enforced).
3. `ROADMAP.md` — the current milestone. Do not start work from a later milestone.

## Where things go

| You are changing | Edit | Never |
| --- | --- | --- |
| A rule every project gets | `template/docs/NN-*/` | put it in a tool-specific file |
| A rule only some projects need | `template/docs/packs/<pack>/` | let a core document link into a pack |
| A skill or agent prompt | `template/.agents/` | edit a generated adapter (`template/.claude/…`) |
| A creation-time question | `copier.yml` | ask about content there — that is the bootstrap's job |
| A bootstrap question | `template/bootstrap/questionnaire.md.jinja` | add a question with no default |
| How to maintain the baseline | `maintainers/` | copy maintainer notes into `template/` |

## Before you finish

```sh
node tests/render.mjs        # renders sample projects and runs their checks
```

Report its output verbatim. Do not declare work complete while it fails.

## Hard rules

- No product, company or domain names in `template/`. `tests/render.mjs` runs a
  leftover-name scan and fails on them.
- No technology choice in a core document. A stack decision belongs to a project's
  `docs/13-technology/` and its ADRs.
- Rules are written once. A skill links to the document that holds the rule; it never restates it.
- Commits follow Conventional Commits. Agent-authored commits carry a `Co-Authored-By` trailer
  naming the agent.
