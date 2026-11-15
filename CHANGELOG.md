# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versions: [SemVer](https://semver.org/).
A change that alters a document a project may already have ratified is called out under
**Projects must review**, because `copier update` will propose it.

## [Unreleased]

### Added

- **Core content (M2):** every core document (layers 01–17) now carries proposed default rules,
  an Enforcement table and AI guardrails, generic and technology-neutral, with project choices as
  parameters. New: `16-ai/model-routing.md` (vendor-neutral strong / standard / fast tiers) and
  `13-technology/_technology-template.md`.
- **Process skills (M3):** `new-feature-spec`, `new-story`, `approve-spec`, `triage-specs`,
  `start-story`, `open-pr`, `promote-pack`, each with a fixture. `docs/workflow.yaml` declares
  the spec chain once.
- **Trackers (M3):** `scripts/tracker/cli.mjs` with `none` (`docs/17-specs/QUEUE.md`),
  `github-issues` and `clickup` adapters; no delete verb. New Copier questions: `git_host`,
  and the ClickUp workspace and space ids. PR gate `scripts/pr/open-pr.mjs`; GitHub and GitLab
  pull-request templates.
- **Pack content (M4):** proposed rules for `http-api`, `events`, `webhooks`, `money`,
  `ledger`, `multi-tenant`, `audit-trail` and `user-interface` (now including
  `browser-security.md`). Domain-specific source rules became parameters.
- **UI checks (M4):** `ui-catalog-parity` and `ui-token-contrast` plugins, configured by
  `.baseline/ui.json`.
- **Enforcement (M5):** `check.mjs` verifies that every proposed, in-progress or ratified
  standard has numbered rules (`R<n>`, or `P<n>` for prohibitions), an Enforcement row with a
  status for each, and valid cross-document rule references; it runs every
  `scripts/checks/*.mjs` plugin. Secret scan plugin (staged-only in pre-commit, allowlist in
  `.baseline/secrets-allowlist.txt`). Tool-neutral guards in `scripts/guards/` and a thin Claude
  Code hook adapter that only calls them. Fixtures for every skill and for the `judge` and
  `researcher` agents.
- `scripts/params.mjs` lists every open parameter with its default, so the bootstrap can offer
  the long tail in bulk.
- `tests/render.mjs`: 143 checks, including every pack rendered on its own, tracker and host
  combinations, and a failing case for every check.
- `user-interface` pack (stubs): design tokens and semantic roles, accessibility, UI states,
  content and i18n, components, design workflow. Selecting it adds a Design section and a
  User interface impact section to the feature-spec template, and a bootstrap row.
- Glossary `## Terms` table with a **UI label** column, so interface wording comes from the
  domain language.

### Changed

- The `ai_tools` creation question is gone. Every project ships pointers for Claude Code,
  Copilot, Cursor and Gemini CLI (Codex reads `AGENTS.md` natively), and
  `sync-adapters.mjs --check` fails if one is missing.
- Bootstrap question 6.7 now asks which AI vendors the team uses before mapping model tiers.
- Bootstrap questionnaire: headline questions plus a bulk offer of every remaining parameter;
  new questions 1.8, 1.9, 2.6, 4.9, 6.10–6.12, and richer pack rows.
- `data_classes` is defined only in `06-security/sensitive-data.md`; the compliance document refers
  to it.

## [0.1.0] — M1 skeleton

### Added

- Copier template with creation-time questions: AI tools, packs, tracker, CI.
- Standards hierarchy (01–17) with the `not-started → proposed → in-progress → ratified` status
  model; document, ADR, feature-spec and story-spec templates; ADR-001.
- Stubs for every core document and seven packs, each with a `## Parameters` table.
- Bootstrap questionnaire and skills: `bootstrap-project`, `ratify-standard`, `new-adr`.
- Agents: `judge`, `researcher`.
- Tool-neutral adapters for Claude Code, Codex, Copilot, Cursor and Gemini CLI.
- Checks (`scripts/check.mjs`), adapter sync, Conventional Commits hook, GitHub Actions workflow.
- `tests/render.mjs`: render scenarios, negative checks, leftover-name scan.
