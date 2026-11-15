---
pack: webhooks
version: 0.1.0
requires: [events]
amends:
  - 08-reliability/timeouts-retries.md  # retry_schedule overrides max_attempts for webhook deliveries (webhooks.md R11)
documents:
  - webhooks.md  # Outbound Webhooks
---

# Pack: webhooks

Standards for projects that deliver events to HTTP endpoints registered by external parties.
Documents in this folder depend on the core layers and on the events pack; no core document
links here. The pack narrows the events pack's delivery rules for the HTTP case and overrides one core
parameter: `retry_schedule` replaces `max_attempts` of `08-reliability/timeouts-retries.md` for
webhook deliveries.

## Parameters worth deciding first

`signature_scheme` (HMAC over timestamp and raw body by default; RFC 9421 as the long-term
alternative), `retry_schedule`, `replay_tolerance` and `url_policy`.

## Bootstrap

The bootstrap asks this pack's parameters in its own section of `bootstrap/questionnaire.md`.
