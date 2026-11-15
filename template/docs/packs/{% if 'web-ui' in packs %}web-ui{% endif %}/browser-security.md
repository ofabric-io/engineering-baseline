---
layer: packs/web-ui
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Browser Surface Security

## Purpose

Security rules that exist only because an interface runs in a web browser: content security
policy, cross-site request forgery, cross-origin access, framing, transport headers, and how the
browser holds sessions and stored data. General application security stays in
`06-security/appsec.md`; which data classes may be stored where is decided in
`06-security/sensitive-data.md`.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `content_security_policy` | [[content_security_policy]] | strict: no inline script, no dynamic code evaluation, sources allow-listed per directive | a lax policy is easier to ship and gives little protection |
| `cross_origin_policy` | [[cross_origin_policy]] | no cross-origin access; any allowed origin is an explicit allow-list entry | an open policy simplifies integrations and widens the attack surface |
| `csrf_protection` | [[csrf_protection]] | required for every state-changing request authenticated by an ambient credential (cookie) | token-in-header authentication does not need it |
| `framing` | [[framing]] | denied, except an allow-listed embedder | embeddable surfaces need an explicit list |
| `session_cookie_scope` | [[session_cookie_scope]] | host-only: no domain attribute, so subdomains cannot read or overwrite it | a shared parent-domain cookie lets several applications sign in once and widens exposure to every subdomain |
| `capture_tooling` | [[capture_tooling]] | none on any surface that handles restricted-class data; elsewhere only with input masking on by default | session replay and heatmaps help product teams and record what users type |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Which surfaces, if any, are meant to be embedded by third parties, and by whom?

## Rules

### Policy and transport

- **R1.** Every response serving an interface document MUST carry a content security policy that implements `content_security_policy`; a relaxation MUST name the directive and the reason.
- **R2.** Inline script and dynamic code evaluation MUST NOT be used unless the policy explicitly allows them through a per-response nonce or hash.
- **R3.** Every state-changing request authenticated by an ambient credential MUST be protected against cross-site request forgery as `csrf_protection` specifies.
- **R4.** Cross-origin access MUST follow `cross_origin_policy`: allowed origins are an explicit list, never a wildcard combined with credentials, and never an echo of the request's origin.
- **R5.** Framing MUST follow `framing`, declared by policy on every interface document.
- **R6.** Interface documents MUST be served only over an encrypted transport, with a policy that tells the browser never to downgrade.
- **R7.** Responses MUST declare their content type and forbid content sniffing.
- **R8.** Third-party script MUST be loaded from an allow-listed origin and, when served from a shared host, with an integrity hash.

### Sessions, cookies and browser storage

- **R9.** Session cookies MUST be `Secure`, `HttpOnly` and carry an explicit `SameSite` value.

- **R10.** A secret, a credential or personal data MUST NOT be stored in browser storage that page script can read, unless `06-security/sensitive-data.md` explicitly allows that class there.
- **R11.** A session cookie MUST follow `session_cookie_scope` and MUST NOT carry data other than an opaque session identifier.
- **R12.** A session identifier MUST NOT appear in a URL, a page body or a log line.
- **R13.** Signing out MUST invalidate the session on the server and instruct the browser to drop the cookie and any cached authenticated content.
- **R14.** Capture tooling (session replay, heatmaps, screen or input recording) MUST follow `capture_tooling`; it MUST NOT be enabled on a surface that handles data in a restricted class (`06-security/sensitive-data.md`).

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1, R2 | Response-header test per interface route; browser-console check for policy violations in end-to-end tests | ⬜ scheduled |
| R3 | Contract test: a state-changing request without the anti-forgery proof is rejected | ⬜ scheduled |
| R4 | Contract test: an unlisted origin receives no cross-origin grant | ⬜ scheduled |
| R5–R7 | Response-header test per interface route | ⬜ scheduled |
| R8 | Build check that every external script has an allow-listed origin and an integrity hash | ⬜ scheduled |
| R9 | Response-header test on sign-in | ⬜ scheduled |
| R10 | PR review of every browser-storage write | ❌ review-only |
| R11 | Response-header test on sign-in (attributes and name); PR review of session contents | ⬜ scheduled |
| R12 | Log scan and end-to-end test for identifiers in URLs | ⬜ scheduled |
| R13 | End-to-end test: after sign-out the old session is rejected and the cookie is cleared | ⬜ scheduled |
| R14 | Response-header and script-inventory check per surface; PR review when a tool is added | ⬜ scheduled |

## AI guardrails

- Never add inline script or dynamic code evaluation; use a nonce or hash if the policy must allow it.
- Never answer a cross-origin request with a wildcard plus credentials, or echo its origin.
- Every cookie-authenticated state change needs anti-forgery protection.
- Never put secrets, tokens or personal data in script-readable browser storage.
- Never put a session identifier in a URL or add a capture tool on your own.

## References

- `06-security/appsec.md` — the general application-security baseline
- `06-security/sensitive-data.md` — which data classes may be stored where
- `06-security/authn-authz.md` — session lifetime and sign-in rules
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/) — CSP, CSRF, session management and HTTP headers
- [Content Security Policy Level 3 (W3C)](https://www.w3.org/TR/CSP3/)
- [Fetch Standard — CORS protocol (WHATWG)](https://fetch.spec.whatwg.org/#http-cors-protocol)
- [RFC 6265bis — Cookies](https://datatracker.ietf.org/doc/draft-ietf-httpbis-rfc6265bis/) (draft)
