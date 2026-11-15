# Roadmap to v1.0.0

Each milestone ends with `node tests/render.mjs` passing and a tagged pre-release.

## M1 — Skeleton ✅ (v0.1.0)

- Copier template: creation-time questions for AI tools, packs (with `requires` validation),
  tracker and CI.
- Standards hierarchy (layers 01–17), status model with `proposed`, document and ADR templates,
  ADR-001, decision queue.
- Stubs for every core document and the seven v1 packs, each with its `## Parameters` table.
- Bootstrap: `bootstrap/questionnaire.md` (phases 0–6, resumable via `.baseline/answers.yaml`)
  and the `bootstrap-project`, `ratify-standard`, `new-adr` skills.
- Agents: `judge`, `researcher`.
- Tool-neutral adapters: Claude Code, Codex, Copilot, Cursor, Gemini — pointers generated and
  verified by `scripts/sync-adapters.mjs`.
- Checks: statuses, unresolved markers in binding documents, links, core-never-links-to-packs,
  glossary-forbidden terms, adapter drift; Conventional Commits hook; GitHub Actions workflow.
- Tests: four render scenarios, eight negative checks, leftover-name scan.

## M2 — Core content (v0.2.0)

Fill every core document with **proposed** default rules, enforcement and AI guardrails,
generalized from a source project per the maintainer's local extraction map
(`maintainers/extraction-map.md`, git-ignored: it describes a private project).

- [ ] 01 business · 02 domain · 03 architecture
- [ ] 05 protocols · 06 security · 07 observability · 08 reliability · 09 errors
- [ ] 10 patterns · 11 style · 12 testing
- [ ] 14 git · 15 delivery · 16 AI (including vendor-neutral model routing) · 17 specs
- [ ] `check.mjs` accepts `proposed` documents and verifies each has Rules + Enforcement

## M3 — Process skills and trackers (v0.3.0)

- [ ] `new-feature-spec`, `new-story`, `approve-spec` (blocks on markers), `triage-specs`,
      `start-story`, `open-pr`
- [ ] `promote-pack` (grow a pack in a project, promote it here)
- [ ] Tracker adapters: `none` (Markdown queue), `github-issues`, `clickup` — one CLI shape, no
      vendor MCP dependency
- [ ] PR template and a `git_host` question if hosting beyond GitHub is needed
- [ ] `docs/workflow.yaml`: the spec chain declared once, read by the skills

## M4 — Pack content (v0.4.0)

- [ ] `http-api`, `events`, `webhooks`, `money`, `ledger`, `multi-tenant`, `audit-trail` filled
      with proposed rules; every product-specific choice a parameter
- [ ] `user-interface` filled: design tokens and semantic roles, accessibility, UI states,
      content and i18n, components, tool-neutral design workflow. Its token rules come from a
      source document that was never ratified, so review them more closely than the others
- [ ] Optional checks for the `user-interface` pack: token-contrast check across themes,
      catalog-parity check (both stack-independent where possible)
- [ ] Feature-spec template sections per pack (already conditional) checked against the packs

## M5 — Enforcement and fixtures (v0.5.0)

- [ ] A fixture per skill and agent under `.agents/tests/<name>/` with an answer key
      (e.g. `approve-spec` refusing a spec with a blocker; `judge` failing incomplete work)
- [ ] Optional tool-hook adapters (e.g. Claude Code `PreToolUse`) that call the same scripts —
      early warning only; git hooks and CI stay the gate
- [ ] Secret scanning in `pre-commit`

## M6 — Dogfood and release (v1.0.0)

- [ ] Generate two contrasting projects (e.g. a SaaS product and an infrastructure tool) and run
      the full bootstrap in each
- [ ] Run the bootstrap and the skill fixtures in **at least two different AI tools**
- [ ] Fix what they expose; tag v1.0.0

## Later

- Packs grown in real projects and promoted: `fx`, `control-plane`,
  `progressive-delivery`, `quotas-and-rate-limits`, `sre`, `client-surfaces`, `metering`.
