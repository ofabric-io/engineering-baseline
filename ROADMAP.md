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

## M2 — Core content (v0.2.0) ✅

Fill every core document with **proposed** default rules, enforcement and AI guardrails,
generalized from a source project per the maintainer's local extraction map
(`maintainers/extraction-map.md`, git-ignored: it describes a private project).

- [x] 01 business · 02 domain · 03 architecture
- [x] 05 protocols · 06 security · 07 observability · 08 reliability · 09 errors
- [x] 10 patterns · 11 style · 12 testing
- [x] 14 git · 15 delivery · 16 AI (including vendor-neutral model routing) · 17 specs
- [x] `check.mjs` accepts `proposed` documents and verifies each has Rules + Enforcement

## M3 — Process skills and trackers (v0.3.0) ✅

- [x] `new-feature-spec`, `new-story`, `approve-spec` (blocks on markers), `triage-specs`,
      `start-story`, `open-pr`
- [x] `promote-pack` (grow a pack in a project, promote it here)
- [x] Tracker adapters: `none` (Markdown queue), `github-issues`, `clickup` — one CLI shape, no
      vendor MCP dependency
- [x] PR template and a `git_host` question if hosting beyond GitHub is needed
- [x] `docs/workflow.yaml`: the spec chain declared once, read by the skills

## M4 — Pack content (v0.4.0) ✅

- [x] `http-api`, `events`, `webhooks`, `money`, `ledger`, `multi-tenant`, `audit-trail` filled
      with proposed rules; every product-specific choice a parameter
- [x] `user-interface` filled: design tokens and semantic roles, accessibility, UI states,
      content and i18n, components, tool-neutral design workflow. Its token rules come from a
      source document that was never ratified, so review them more closely than the others
- [x] Optional checks for the `user-interface` pack: token-contrast check across themes,
      catalog-parity check (both stack-independent where possible)
- [x] Feature-spec template sections per pack (already conditional) checked against the packs
- [x] `browser-security.md` added to the `user-interface` pack (CSP, CSRF, CORS, framing, headers)

## M5 — Enforcement and fixtures (v0.5.0) ✅

- [x] A fixture per skill and agent under `.agents/tests/<name>/` with an answer key
      (e.g. `approve-spec` refusing a spec with a blocker; `judge` failing incomplete work)
- [x] Optional tool-hook adapters (e.g. Claude Code `PreToolUse`) that call the same scripts —
      early warning only; git hooks and CI stay the gate
- [x] Secret scanning in `pre-commit`
- [x] Check plugins (`scripts/checks/`), rule/enforcement/cross-reference checks, `scripts/params.mjs`

Still owed (tracked as `⬜` rows): PR-body CI job for PRs not opened through `open-pr.mjs`,
startability check in CI, spec filename and frontmatter checks, guard against editing a shipped
migration, live tests of the GitHub Issues and ClickUp tracker adapters.

## M6 — Dogfood and release (v1.0.0)

- [ ] Generate two contrasting projects (e.g. a SaaS product and an infrastructure tool) and run
      the full bootstrap in each
- [ ] Run the bootstrap and the skill fixtures in **at least two different AI tools**
- [ ] Fix what they expose; tag v1.0.0

## Later

- Packs grown in real projects and promoted: `fx`, `control-plane`,
  `progressive-delivery`, `quotas-and-rate-limits`, `sre`, `client-surfaces`, `metering`.
