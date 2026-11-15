---
layer: packs/webhooks
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Outbound Webhooks

## Purpose

Delivering integration events to endpoints that external parties register: signing, replay protection, retries, disabling, secret rotation and safe outbound requests. What an event may carry is decided in `event-model.md` of the events pack; reliable recording and the retry discipline are in `delivery-and-outbox.md` of that pack.

Requires pack(s): `events`.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `signature_scheme` | [[signature_scheme]] | HMAC-SHA256 over `timestamp + "." + raw body`, hex-encoded, with a scheme-version prefix | RFC 9421 HTTP Message Signatures is the long-term standard and can sign more of the request; receiver library support decides when to move |
| `signature_headers` | [[signature_headers]] | one timestamp header and one signature header, both carrying the project's prefix | More headers carry more context and are more to document and verify |
| `retry_schedule` | [[retry_schedule]] | 8 attempts over roughly 24 hours: 10 s, 1 min, 5 min, 30 min, 2 h, 5 h, 10 h, 24 h | A longer schedule forgives longer outages and holds more queued work; a shorter one suits time-sensitive events |
| `replay_tolerance` | [[replay_tolerance]] | 5 minutes on the timestamp | A tighter window limits replay and breaks receivers with skewed clocks |
| `auto_disable_after` | [[auto_disable_after]] | 7 days of continuous failure | Shorter frees queue capacity sooner and disables flaky receivers that recover on their own |
| `delivery_timeout` | [[delivery_timeout]] | 10 seconds to a complete response | Longer tolerates slow receivers and ties up dispatch capacity |
| `secret_overlap` | [[secret_overlap]] | the old secret stays valid for 24 hours after rotation, or until revoked | A longer overlap eases receiver rollout and prolongs exposure of a leaked secret |
| `url_policy` | [[url_policy]] | HTTPS only, public addresses only, no redirects followed, no credentials in the URL | Allowing private addresses or plain HTTP enables internal integrations and opens request-forgery risk |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Who is notified when an endpoint is disabled, and through which channel?
- [ ] Is there a self-service endpoint test (a synthetic event) and what does it send?
- [ ] How long are delivery attempt logs retained for the receiver to inspect?

## Rules

### Signing

- **R1.** Every webhook MUST be signed as `signature_scheme` says and carry the headers in `signature_headers`.
- **R2.** The signature MUST be computed over the exact bytes sent; the sender MUST NOT re-serialise a payload between signing and sending.
- **R3.** The signature header MUST carry a scheme-version prefix so the scheme can change without ambiguity.
- **R4.** Receiver documentation MUST tell receivers to verify the signature over the raw body with a constant-time comparison, to reject a timestamp outside `replay_tolerance`, and to deduplicate on the event `id` (`delivery-and-outbox.md` R8 of the events pack).
- **R5.** Each endpoint MUST have its own signing secret, generated with a cryptographically secure source, shown to the owner once, and stored per `06-security/secrets-and-crypto.md`.
- **R6.** Secret rotation MUST support two valid secrets at once for `secret_overlap`: during the overlap the sender signs with the new secret (or with both), so a receiver can switch without a gap.
- **R7.** A signing secret MUST NOT appear in a log line, an error, a metric label or a delivery attempt record (`06-security/sensitive-data.md`).

### Delivery

- **R8.** The webhook payload MUST be an integration event as defined by the events pack, and nothing else.
- **R9.** A delivery MUST complete within `delivery_timeout`; a timeout MUST count as a failed attempt.
- **R10.** Any response other than `2xx`, any connection failure and any timeout MUST be treated as failure and retried per `retry_schedule`; the sender MUST NOT interpret the response body. A redirect MUST be treated as failure.
- **R11.** Retry timing MUST follow `retry_schedule` with jitter (`08-reliability/timeouts-retries.md`).
- **R12.** Deliveries to one endpoint MUST NOT block deliveries to another: a broken receiver MUST NOT delay anyone else's events.

### Safety of outbound requests

- **R13.** The destination URL MUST satisfy `url_policy`, and MUST be validated before every delivery, not only at registration, because DNS can change between the two (`06-security/appsec.md`).
- **R14.** The connection MUST be made to the address that passed validation (no second resolution between check and connect), and redirects MUST NOT be followed.

### Disabling, visibility and replay

- **R15.** An endpoint that has failed continuously for `auto_disable_after` MUST be disabled automatically and its owner notified; re-enabling MUST be an explicit action.
- **R16.** Every event whose attempts are exhausted MUST be dead-lettered, visible to operators and to the endpoint's owner, counted by a metric with an alert on depth (`07-observability/metrics-and-tracing.md`).
- **R17.** A dead-lettered or failed event MUST be replayable on demand; a replay MUST keep the original event `id`, MUST be signed afresh with a current timestamp, and MUST be recorded as a new attempt.
- **R18.** Each attempt MUST be recorded with endpoint, event `id`, attempt number, outcome (status class or error), duration and time, so "did it go out" is answerable.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1–R3 | Signing helper is the only send path; verification test against a published test vector | ⬜ scheduled |
| R4 | Receiver documentation review; sample verification code kept under test | ❌ review-only |
| R5, R7 | Secret generation test; log-scan test that no secret appears in any output | ⬜ scheduled |
| R6 | Rotation test with two valid secrets across the overlap | ⬜ scheduled |
| R8 | Architecture test: the webhook payload builder accepts only integration event types | ⬜ scheduled |
| R9–R11 | Dispatcher test asserting timeout, status handling, redirect-as-failure and the schedule | ⬜ scheduled |
| R12 | Test with one permanently failing endpoint; other deliveries proceed | ⬜ scheduled |
| R13, R14 | Outbound client validates per call; tests for private address, redirect, DNS change and plain HTTP | ⬜ scheduled |
| R15 | Test asserting the disable threshold, the notification and explicit re-enable | ⬜ scheduled |
| R16–R18 | Dead-letter store, replay tool, depth metric and alert; attempt-log schema test | ⬜ scheduled |

## AI guardrails

- Sign every webhook over the raw bytes sent; never re-serialise before signing.
- Enforce `replay_tolerance`, document verification for receivers, and rotate with two valid secrets.
- Non-2xx, timeouts and redirects are failures; never interpret the response body.
- Validate the destination URL before every delivery and connect to the validated address.
- Retry per `retry_schedule`, then dead-letter; disable after `auto_disable_after` and tell the owner.
- Dead letters are visible and replayable; a replay keeps the event `id` and is signed afresh.
- Never log a signing secret.

## References

- [RFC 9421 — HTTP Message Signatures](https://www.rfc-editor.org/rfc/rfc9421) (long-term alternative to `signature_scheme`)
- [RFC 2104 — HMAC](https://www.rfc-editor.org/rfc/rfc2104), [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110)
- [OWASP Server-Side Request Forgery Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)
- `event-model.md`, `delivery-and-outbox.md` (events pack)
- `06-security/appsec.md`, `06-security/secrets-and-crypto.md`, `06-security/sensitive-data.md`, `08-reliability/timeouts-retries.md`, `07-observability/metrics-and-tracing.md`
