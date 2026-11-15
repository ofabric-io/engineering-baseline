---
layer: 13-technology
status: proposed
owner: TBD
last-reviewed: never
---

# Technology Decisions

The baseline never picks a technology. This layer is where the project does, one document per
decision area, each backed by an ADR.

## How a technology document is made

1. The bootstrap (phase 5) or a later decision names the area.
2. An ADR records the choice and the alternatives (`.agents/skills/new-adr/SKILL.md`).
3. A document `13-technology/<area>.md` is created from `13-technology/_technology-template.md`. It holds the rules
   that follow from the choice — lint and format configuration, framework conventions, schema
   rules — and their enforcement.
4. Rules in higher layers that said "decided in 13-technology/" now point here.

## Areas

| Area | Typical document | Decided? |
| --- | --- | --- |
| Language(s) and runtime | `language.md` | [[decided_language]] |
| Repository layout and build | `repository-layout.md` | [[decided_repository_layout]] |
| Backend framework | `backend.md` | [[decided_backend]] |
| Frontend framework and design system | `frontend.md` | [[decided_frontend]] |
| Data stores | `data-stores.md` | [[decided_data_stores]] |
| Messaging / queues | `messaging.md` | [[decided_messaging]] |
| Hosting and deployment target | `hosting.md` | [[decided_hosting]] |
| Observability backend | `observability.md` | [[decided_observability]] |

An area the project does not have is marked `n/a`. An area not yet decided stays open and is
listed in `docs/DECISION-QUEUE.md`; nothing in the project may assume an answer for it.

## What lives here, and nowhere else

Higher layers state a mechanism and defer the tool. These are the things they defer, so each
decided area's document MUST cover the ones that apply:

- the lint, format and type-check configuration that implements `11-style/naming-and-style.md`
  (casing per kind of identifier, file naming, formatter settings, lint severity)
- anti-patterns specific to the language or framework, with the same force as the named
  anti-patterns in `10-patterns/patterns.md`
- test runners, fixtures, isolation and coverage tooling that implement `12-testing/strategy.md`
- the module-boundary check that implements `03-architecture/dependency-rules.md`
- the migration tool and the CI system that implement `15-delivery/pipeline-and-gates.md` and
  `15-delivery/deployments-and-rollback.md`

A technology document MUST NOT restate or relax a rule from a higher layer; it names the tool that
enforces it. To relax a rule, supersede it with an ADR.
