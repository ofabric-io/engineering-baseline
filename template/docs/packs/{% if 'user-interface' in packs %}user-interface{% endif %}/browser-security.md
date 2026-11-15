---
layer: packs/user-interface
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Browser Surface Security

## Purpose

Security rules that exist only because an interface runs in a web browser: content security
policy, cross-site request forgery, cross-origin access, framing and transport headers. A project
whose interface is not browser-based marks this document `n/a` in its Open decisions.
General application security stays in `06-security/appsec.md`.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `browser_surface` | [[browser_surface]] | yes, if any interface runs in a browser | `no` makes this whole document not applicable |
| `content_security_policy` | [[content_security_policy]] | strict: no inline script, no `eval`, sources allow-listed per directive | a lax policy is easier to ship and gives little protection |
| `cross_origin_policy` | [[cross_origin_policy]] | no cross-origin access; any allowed origin is an explicit allow-list entry | an open policy simplifies integrations and widens the attack surface |
| `csrf_protection` | [[csrf_protection]] | required for every state-changing request authenticated by an ambient credential (cookie) | token-in-header authentication does not need it |
| `framing` | [[framing]] | denied, except an allow-listed embedder | embeddable surfaces need an explicit list |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Which surfaces, if any, are meant to be embedded by third parties, and by whom?

## Rules

- **R1.** Every response serving an interface document MUST carry a content security policy that
  implements `content_security_policy`; a relaxation MUST name the directive and the reason.
- **R2.** Inline script and dynamic code evaluation MUST NOT be used unless the policy explicitly
  allows them through a per-response nonce or hash.
- **R3.** Every state-changing request authenticated by an ambient credential MUST be protected
  against cross-site request forgery as `csrf_protection` specifies.
- **R4.** Session cookies MUST be `Secure`, `HttpOnly` and carry an explicit `SameSite` value.
- **R5.** Cross-origin access MUST follow `cross_origin_policy`: allowed origins are an explicit
  list, never a wildcard combined with credentials, and never an echo of the request's origin.
- **R6.** Framing MUST follow `framing`, declared by policy on every interface document.
- **R7.** Interface documents MUST be served only over an encrypted transport, with a policy that
  tells the browser never to downgrade.
- **R8.** Responses MUST declare their content type and forbid content sniffing.
- **R9.** Third-party script MUST be loaded from an allow-listed origin and, when served from a
  shared host, with an integrity hash.
- **R10.** A secret, a credential or personal data MUST NOT be stored in browser storage that page
  script can read, unless `06-security/sensitive-data.md` explicitly allows that class there.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1, R2 | Response-header test per interface route; browser-console check for policy violations in end-to-end tests | ⬜ scheduled |
| R3 | Contract test: a state-changing request without the anti-forgery proof is rejected | ⬜ scheduled |
| R4 | Response-header test on sign-in | ⬜ scheduled |
| R5 | Contract test: an unlisted origin receives no cross-origin grant | ⬜ scheduled |
| R6–R8 | Response-header test per interface route | ⬜ scheduled |
| R9 | Build check that every external script has an allow-listed origin and an integrity hash | ⬜ scheduled |
| R10 | PR review of every browser-storage write | ❌ review-only |

## AI guardrails

```text
Never add inline script or eval; use a nonce or hash if the policy must allow it.
Never answer a cross-origin request with a wildcard plus credentials, or echo its origin.
Every cookie-authenticated state change needs anti-forgery protection.
Never put secrets, tokens or personal data in script-readable browser storage.
```

## References

- `06-security/appsec.md` — the general application-security baseline
- `06-security/sensitive-data.md` — which data classes may be stored where
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/) — CSP, CSRF and HTTP headers
- [Content Security Policy Level 3 (W3C)](https://www.w3.org/TR/CSP3/)
- [Fetch Standard — CORS protocol (WHATWG)](https://fetch.spec.whatwg.org/#http-cors-protocol)
