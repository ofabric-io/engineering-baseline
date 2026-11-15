---
pack: web-ui
version: 0.1.0
requires: [user-interface]
amends:
  - 06-security/appsec.md  # adds the browser-side rules (policy headers, cross-site request forgery, framing) to the general application-security baseline
documents:
  - browser-security.md  # Browser Surface Security
  - web-accessibility.md  # Web Accessibility Specifics
  - web-styling.md  # Web Styling & Semantics
---

# Pack: web-ui

Standards for interfaces that run in a web browser. They add the browser mechanics to the
platform-neutral rules of the `user-interface` pack: security headers and cookies, the HTML and
ARIA means of meeting its accessibility rules, and how the design tokens reach CSS.

A project whose interfaces are all mobile or desktop does not choose this pack. Documents in this
folder depend on the core layers and on `packs/user-interface/`; no core document links here.

## What it amends and uses

- **Extends `06-security/appsec.md`**: browser-surface rules that general application security does
  not carry. The general rules still apply.
- **Applies `06-security/sensitive-data.md`**: browser storage and screen-capture tooling are
  governed by the data classes defined there.
- **Implements `packs/user-interface/accessibility.md`** for the browser: reflow, live regions and
  native semantics (`web-accessibility.md`).
- **Implements `packs/user-interface/design-tokens.md`** for the browser (`web-styling.md`).

## Bootstrap

The bootstrap asks this pack's parameters in its own section of `bootstrap/questionnaire.md`.
