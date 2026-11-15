---
pack: user-interface
version: 0.1.0
requires: []
amends:
  - 05-protocols/rfc-profile.md  # core_standards: adds WCAG 2.2 and the W3C Design Tokens format
documents:
  - design-tokens.md  # Design Tokens & Semantic Roles
  - accessibility.md  # Accessibility
  - ux-states.md  # Interface States & Error Presentation
  - content-and-i18n.md  # Content, Copy & Internationalisation
  - components.md  # Components
  - design-workflow.md  # Design Workflow & Fidelity
---

# Pack: user-interface

Optional standards for projects with a user interface on any platform (web, mobile, desktop):
design tokens and semantic roles, accessibility principles, interface states, content and
internationalisation, components, and the design workflow. The documents are platform-neutral.
Browser-specific rules (security headers, cookies, reflow, ARIA, CSS) live in the `web-ui` pack,
which requires this one. Technology (framework, styling tool, design tool) stays in
`docs/13-technology/`.

Documents in this folder depend on the core layers; no core document links here.

## What it amends and uses

- **Adds to `05-protocols/rfc-profile.md`**: WCAG 2.2 and the W3C Design Tokens Community Group
  format join the adopted standards; the project adds them to its `core_standards` answer.
- **Uses the glossary** (`02-domain/glossary.md`): its "UI label (<locale>)" columns are the source of every
  user-visible domain term (`content-and-i18n.md` R11).
- **Uses the feature-spec template's Design section** (`17-specs/feature-spec-template.md`):
  the link a story must carry to its committed design (`design-workflow.md` R1).

## Checks

Two check plugins ship with this pack in `scripts/checks/` and are run by `scripts/check.mjs`.
Both read the optional `.baseline/ui.json` and pass when it is absent.

```json
{
  "catalogs": "path/to/catalogs",
  "locales": ["en-US", "pt-BR"],
  "tokens": { "light": "path/to/light.tokens.json", "dark": "path/to/dark.tokens.json" },
  "contrastPairs": [["text-primary", "surface-default"]],
  "minContrast": 4.5
}
```

Locales are BCP 47 tags and are also the catalog directory names.

- `ui-catalog-parity.mjs`: every key path exists in every locale, per namespace file.
- `ui-token-contrast.mjs`: declared pairs meet the contrast minimum in every theme.

## Bootstrap

The bootstrap asks this pack's parameters in its own section of `bootstrap/questionnaire.md`.
