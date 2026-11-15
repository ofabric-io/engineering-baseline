---
layer: pack-notifications
status: ratified
owner: Dana Reyes
last-reviewed: 2026-02-01
---

# Notification delivery

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `quiet_hours` | 22:00-07:00 | none | fewer night-time messages vs. delivery latency |

## Rules

- **R1.** A notification MUST NOT be sent inside `quiet_hours` unless it is marked urgent.
- **R2.** Delivery attempts MUST be retried at most 3 times.
