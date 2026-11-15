---
layer: 06-security
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Authentication & Authorization

## Purpose

Who the actors are, how they prove identity, and how permissions are decided and enforced. The concrete actor types and the authorization model are the project's parameters; the rules below hold for any choice.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `actor_types` | [[actor_types]] | `user`, `operator`, `service`, `system`, `agent` | each needs its own credential type; the values are also the audit `actor.type` values |
| `authorization_model` | [[authorization_model]] | role-based, checked server-side on every request | attribute-based is more expressive and harder to audit |
| `step_up_actions` | [[step_up_actions]] | changing credentials, changing recovery details, irreversible bulk operations, any operation across isolation boundaries | more step-up means more friction; less means a stolen session does more damage |
| `session_lifetime` | [[session_lifetime]] | short idle timeout, bounded absolute lifetime, revocable server-side | long-lived sessions or tokens are convenient and widen the theft window |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Which credential mechanism does each actor type use? Fill the table under Rules.
- [ ] Is there an external identity provider, and which protocol does it speak?

## Rules

### Actors and credentials

- **R1.** Every actor type in `actor_types` MUST have exactly one documented credential mechanism, recorded in the actor-credential table in this document.

  | Actor type | Credential mechanism | Revocation |
  | --- | --- | --- |
  | [[credential_actor]] | [[credential_mechanism]] | [[credential_revocation]] |

- **R2.** An authentication mechanism MUST NOT be built for an actor type that has no consumer yet.
- **R3.** Actor types with different privilege levels MUST NOT share a credential type, a session or token store namespace or a session or token type. Escalating between them MUST require forging a different credential, not changing a claim.
- **R4.** A credential that grants access MUST be revocable server-side. A bearer credential that cannot be revoked MUST be short-lived.
- **R5.** A credential issued for a single purpose MUST be scoped to that purpose and MUST expire quickly, and it MUST grant nothing beyond that purpose.
- **R6.** A credential held by a client or a node MUST be stored with owner-only access, in the platform's protected credential facility where one exists. Storage rules specific to an interface type belong to that interface's standards.
- **R7.** A failed authentication MUST NOT reveal whether the identifier exists.
- **R8.** Authentication attempts MUST be rate limited per identifier and per network origin (`06-security/appsec.md` R6, R7). _(applies to: service)_

### Authorization

- **R9.** Authorization MUST be deny-by-default: an operation with no explicit policy MUST be denied.
- **R10.** Authorization MUST be decided on the server, on every request, following `authorization_model`. A decision made in a client is advisory only. _(applies to: service)_
- **R11.** An authorization check MUST test the actor's right to act on the specific resource, not only the actor's role. A role check alone is never sufficient for an owned resource.
- **R12.** The decision MUST be enforced at the entry point, and the resource-scoped part MUST be re-checked in the logic that performs the operation, because that logic is also reachable from background work where no entry-point check ran.
- **R13.** Adding a role, permission or actor type MUST be recorded in an ADR.

### Dangerous actions

- **R14.** Each action in `step_up_actions` MUST require a fresh credential presentation, not just a live session.
- **R15.** When one actor acts on behalf of another, the audit record and every log line MUST name the real actor, never the one being acted for, and the delegated session MUST be time-boxed.
- **R16.** Authentication and authorization decisions (grants, denials, step-up, revocation) MUST be logged with the actor, the resource and the outcome, and without the credential (`06-security/sensitive-data.md` R1).
- **R17.** Sessions and tokens issued to actors MUST follow `session_lifetime`, and revoking one MUST take effect on the next request. _(applies to: service)_

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | Document completeness at ratification; the table has a row per actor type | ❌ review-only |
| R2 | PR review | ❌ review-only |
| R3 | Integration test: a credential of one type is rejected by the other's entry points | ⬜ scheduled |
| R4 | Integration test of revocation | ⬜ scheduled |
| R5 | Integration test of scope and expiry | ⬜ scheduled |
| R6 | Security review of client and node credential storage | ❌ review-only |
| R7 | Test comparing responses for known and unknown identifiers | ⬜ scheduled |
| R8 | Integration test | ⬜ scheduled |
| R9 | Test that enumerates entry points and fails on any without a policy | ⬜ scheduled |
| R10 | Integration tests with an unauthorized actor | ⬜ scheduled |
| R11 | Cross-actor access test per owned resource | ⬜ scheduled |
| R12 | PR review; test calling the logic directly as an unauthorized actor | ◐ partial |
| R13 | PR review | ❌ review-only |
| R14 | Integration test per step-up action | ⬜ scheduled |
| R15 | Test asserting the logged actor in a delegated session | ⬜ scheduled |
| R16 | Log assertion test | ⬜ scheduled |
| R17 | Integration test of idle expiry, absolute expiry and revocation | ⬜ scheduled |

## AI guardrails

- A new entry point is denied until a policy says otherwise.
- A role check is not an ownership check. Check both.
- Never read the actor from a client-supplied claim you have not verified.
- Never add a role or actor type without an ADR.
- Never build an authentication mechanism nobody uses yet.

## References

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- `06-security/appsec.md`, `06-security/sensitive-data.md`
