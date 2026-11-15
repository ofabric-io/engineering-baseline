---
pack: webhooks
version: 0.1.0
requires: [events]
amends: []
documents:
  - webhooks.md  # Outbound Webhooks
---

# Pack: webhooks

Standards for projects that deliver events to HTTP endpoints registered by external parties.
Documents in this folder depend on the core layers and on the events pack; no core document
links here. The pack amends no core rule: it narrows the events pack's delivery rules for the
HTTP case.

## Parameters worth deciding first

`signature_scheme` (HMAC over timestamp and raw body by default; RFC 9421 as the long-term
alternative), `retry_schedule`, `replay_tolerance` and `url_policy`.

## Bootstrap

The bootstrap asks this pack's parameters in its own section of `bootstrap/questionnaire.md`.
