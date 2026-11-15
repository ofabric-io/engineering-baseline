# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versions: [SemVer](https://semver.org/).
A change that alters a document a project may already have ratified is called out under
**Projects must review**, because `copier update` will propose it.

## [Unreleased]

### Changed

- The `ai_tools` creation question is gone. Every project ships pointers for Claude Code,
  Copilot, Cursor and Gemini CLI (Codex reads `AGENTS.md` natively), and
  `sync-adapters.mjs --check` fails if one is missing.
- Bootstrap question 6.7 now asks which AI vendors the team uses before mapping model tiers.

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
