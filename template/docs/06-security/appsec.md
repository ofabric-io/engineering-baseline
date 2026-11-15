---
layer: 06-security
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Application Security Baseline

## Purpose

Input handling, abuse limits, outbound-call hygiene, threat modelling and the security checks every change passes. Identity and permissions are in `authn-authz.md`; secrets and cryptography in `secrets-and-crypto.md`; dependency policy in `dependencies-and-supply-chain.md`. This document owns outbound destination validation; other documents cite it.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `threat_model_required_for` | [[threat_model_required_for]] | new external interfaces and changes to authn/authz | cost vs. coverage |
| `max_input_size` | [[max_input_size]] | 1 MB per inbound message unless an interface documents its own cap | a low cap breaks legitimate uploads; none invites exhaustion |
| `blocking_vulnerability_severity` | [[blocking_vulnerability_severity]] | high and critical block the build | stricter blocks more releases; looser ships known holes |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Which inbound interfaces are reachable by untrusted parties?
- [ ] Who triages a vulnerability report, and within what time?

## Rules

### Input

- **R1.** Every value crossing a trust boundary (a message, argument, file, parameter or environment value) MUST be validated against a declared schema at the edge, before any other processing.
- **R2.** Validation of an inbound customer-facing interface MUST reject unknown fields rather than silently discard them. _(applies to: service, daemon)_
- **R3.** Every string MUST have a maximum length and every collection a maximum size.
- **R4.** The size of an inbound message MUST be capped at `max_input_size`.
- **R5.** Untrusted input MUST NOT be concatenated into a query, command, path or template. Parameterized interfaces MUST be used.

### Abuse limits

- **R6.** An interface reachable by untrusted parties MUST enforce rate limits in the application, keyed on at least the network origin and the authenticated identity, the tightest applying. _(applies to: service)_
- **R7.** Authentication and other high-impact operations MUST have their own stricter limits. _(applies to: service)_
- **R8.** When the limiter's state store is unavailable, the limiter MUST fail closed on authentication and high-impact operations and MAY fail open on read-only operations. _(applies to: service)_
- **R9.** A rejection caused by a limit MUST NOT reveal the limit's configuration. _(applies to: service)_

### Outbound calls

- **R10.** Outbound network access MUST be restricted to a documented allowlist of destinations, except where R19 applies. _(applies to: service, daemon, batch)_
- **R11.** This rule owns outbound destination validation. A destination supplied by an untrusted party MUST be validated before use and before every call: encrypted transport only, public addresses only, redirects not followed.
- **R12.** Every outbound call MUST have a timeout and a maximum response size (`08-reliability/timeouts-retries.md`).

### Supply chain

- **R13.** Dependency vulnerability scanning MUST run in CI and MUST block the build at `blocking_vulnerability_severity`; lower severities MUST be reported (update obligations in `06-security/dependencies-and-supply-chain.md`).
- **R14.** Lockfiles and install integrity MUST follow `06-security/dependencies-and-supply-chain.md` R10 and R11.
- **R15.** Adding, upgrading and removing a dependency MUST follow `06-security/dependencies-and-supply-chain.md` R1 to R5.
- **R16.** Secret scanning MUST run before commit and in CI.

### Threat modelling and review

- **R17.** A change in `threat_model_required_for` MUST include a written threat model, reviewed before merge.
- **R18.** Security-relevant defaults MUST be the safe ones: a feature that is not configured MUST be disabled or denied, not open.

### Customer-configured destinations

- **R19.** A product whose job is to reach addresses its customers supply MUST NOT rely on a fixed allowlist; it MUST validate each address against a documented policy (permitted schemes, ports and address ranges, re-validation after name resolution, redirect handling) and MUST record that policy in this document or an ADR. R11 still applies to every call. _(applies to: service, daemon, batch)_
- **R20.** Calls to customer-configured destinations MUST be made from an egress path isolated from internal networks and from the product's own control plane. _(applies to: service, daemon, batch)_

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | Schema validation at each edge; test that an invalid input is rejected | ⬜ scheduled |
| R2 | Schema configuration check | ⬜ scheduled |
| R3 | Schema lint requiring bounds on strings and collections | ⬜ scheduled |
| R4 | Integration test sending an oversized message | ⬜ scheduled |
| R5 | Static analysis rule for query/command construction, chosen in `13-technology/` | ⬜ scheduled |
| R6 | Integration test per exposed interface | ⬜ scheduled |
| R7 | Integration test | ⬜ scheduled |
| R8 | Fault-injection test of the limiter store | ⬜ scheduled |
| R9 | PR review | ❌ review-only |
| R10 | Network policy plus review of the allowlist | ⬜ scheduled |
| R11 | Unit tests for the destination validator | ⬜ scheduled |
| R12 | Static check that outbound clients set both | ⬜ scheduled |
| R13 | CI dependency-audit job | ⬜ scheduled |
| R14 | See `06-security/dependencies-and-supply-chain.md` | ⬜ scheduled |
| R15 | See `06-security/dependencies-and-supply-chain.md` | ⬜ scheduled |
| R16 | Git hook and CI secret-scan job | ⬜ scheduled |
| R17 | PR template checkbox; reviewer check | ❌ review-only |
| R18 | PR review | ❌ review-only |
| R19 | Unit tests of the policy validator with hostile addresses; policy review | ⬜ scheduled |
| R20 | Network policy review | ❌ review-only |

## AI guardrails

- Validate input at the edge; reject unknown fields.
- Bound every string, collection and message size.
- Never build a query or command by string concatenation.
- Never add a dependency outside `06-security/dependencies-and-supply-chain.md`.
- A customer-supplied address is validated by the documented policy, every call.
- Never disable a security check to make a build pass.

## References

- [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- `06-security/authn-authz.md`, `06-security/secrets-and-crypto.md`, `06-security/dependencies-and-supply-chain.md`, `08-reliability/timeouts-retries.md`
