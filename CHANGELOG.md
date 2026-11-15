# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versions: [SemVer](https://semver.org/).
A change that alters a document a project may already have ratified is called out under
**Projects must review**, because `copier update` will propose it.

## [Unreleased]

### Changed — brief-first bootstrap

- **The bootstrap starts from a brief.** Question 0.1 is a free-text description of the project
  and its requirements, guided by a checklist. Foundation questions (⚑: 0.2, 0.3, 0.5, 1.5,
  6.3) the brief leaves open are asked next.
- **Every decision gets a recommendation.** New `scripts/recommend.mjs` writes
  `.baseline/recommendations.md` with one row per open decision (headline questions and every
  open parameter). Each row says where its recommendation came from: `brief` (quoting the
  brief), `derived`, `default`, `ask` or `n/a`. `--check` fails while a row is incomplete.
  A recommendation departs from the default only when the brief says something that calls for it.
- **Accept all at once.** New question 0.6: `all`, `all except <ids>` or `review`. Only the
  `ask` rows are asked; ratification and ADR acceptance remain two explicit questions at the end.
- The questionnaire's "Writes to" cells name the parameters each question sets, and
  `recommend.mjs` fails when one does not exist or a document with open parameters is offered by
  no question. 6.8 now asks for `spec_depth`; new 6.15 covers the remaining delivery documents.
- `.baseline/answers.yaml` gains `brief`, `mode`, `except` and a `source` per answer. A file
  without `brief` continues in `review` mode.
- New fixture `bootstrap-project-brief`; render tests cover the sheet in every scenario.

### Added — M6 fixes (wave 2)

- **Component kinds**: `03-architecture/system.md` gains a Components table and
  `component_kinds` (`service`, `daemon`, `cli`, `library`, `ui`, `batch`). Rules can carry a
  scope tag `_(applies to: …)_`; documents can declare `applies-to:` and be `not-applicable`
  with a `reason:`. `check.mjs` validates all three.
- **New packs**: `data-store` (migrations, transactions), `domain-model` (aggregates, domain
  patterns), `web-ui` (browser security, web accessibility, web styling; requires
  `user-interface`), `cli` (command-line conventions). http-api gains
  `long-running-operations.md`.
- **New core documents**: `06-security/dependencies-and-supply-chain.md`,
  `07-observability/incident-management.md`, `08-reliability/performance-and-capacity.md`,
  `15-delivery/releases-and-distribution.md`, `15-delivery/product-documentation.md`.
- **Machinery**: `scripts/queue.mjs` generates the enforcement-debt table; ADR index and
  completeness checks; open-decision policy (`→ DECISION-QUEUE`); unique parameter names;
  forbidden-terms scan limited to project prose, reporting every hit, with
  `.baseline/forbidden-allow.txt`; unambiguous bare-name references; offline `next-number`.
- Spec templates: "Components touched" and sections for the new packs; `spec_depth` (full |
  lightweight) in `docs/workflow.yaml`. New fixtures for component kinds, bare references and a
  judge case that edits a ratified document.

### Changed — M6 fixes (wave 2)

- **Projects must review**: many rule texts changed. Rules no longer hard-code what their
  parameter offers (auto-merge, approvals with a new solo mode, standards, telemetry, test levels,
  coverage, branch names, commit format, jitter). Each rule has one owner; others cite it.
- Lifecycles are generic; aggregates and Unit of Work moved to `domain-model`. Schema migration
  doctrine moved to `data-store`. Browser-only rules moved to `web-ui`.
- Error categories are `domain`, `validation`, `authentication`, `authorization`,
  `not_found`, `conflict`, `rate_limited`, `unavailable`, `internal`; flags are
  `isRetryable` / `isExposable`; the error mechanism is a parameter.
- Renamed parameters: `zone_of_record` → `business_time_zone`; `delivery_guarantee` →
  `event_delivery_guarantee` / `audit_delivery_guarantee`; audit `retention` →
  `audit_retention`; `staff_cross_access_roles` → `operator_cross_access_roles`. "staff" is
  now "operator".
- Fits real products found in the dogfood: future wall-clock times with a zone, pseudonymous audit
  records for erasure, nested and per-principal isolation axes, platform-scoped workloads, one
  currency per isolation unit, CLI stdout, supervisory reconnect loops, customer-configured
  destinations, platform deployment vs. customer operations, progressive rollout and version skew.
- The `ledger` pack requires `money` and `events`.
- Bootstrap: phase order 0, 1, 2, 3, 4P, 4, 5, 6; component kinds asked first (0.5); runs on a
  branch and ends with a PR; explicit ADR acceptance; batches of about 25 questions; reuses Copier
  answers; `answers.yaml` phases are strings with a documented id scheme.
- Node ≥ 20 is stated as a prerequisite everywhere.

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
