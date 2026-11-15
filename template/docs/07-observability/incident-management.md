---
layer: 07-observability
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Incident Management

## Purpose

How the project recognises, classifies, handles and learns from incidents, and how it receives and answers reports of security vulnerabilities. This is the incident procedure other documents point to. It does not define the signals that detect incidents (`07-observability/metrics-and-tracing.md`) or the readiness checklist (`15-delivery/production-readiness.md`).

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `severity_levels` | [[severity_levels]] | `sev1` (outage or data compromise), `sev2` (major degradation), `sev3` (minor, workaround exists) | more levels give finer response and more arguing about the boundary |
| `incident_response_targets` | [[incident_response_targets]] | time to acknowledge and time between updates, stated per severity level | tighter targets need an on-call rota |
| `review_required_from` | [[review_required_from]] | every incident at the second-highest severity level or above, and any incident with data exposure | reviewing everything is costly; reviewing too little repeats failures |
| `review_deadline` | [[review_deadline]] | 5 working days after resolution | later reviews lose detail |
| `disclosure_response_time` | [[disclosure_response_time]] | acknowledge a vulnerability report within 3 working days | faster needs an owner who is always reachable |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Who is on call, and how is the rota published?
- [ ] Where do incident records and status updates live, and who may read them?
- [ ] What is the published address for vulnerability reports?

## Rules

### Declaring and classifying

- **R1.** Anyone who observes an incident MUST be able to declare it, and every declared incident MUST receive a severity from `severity_levels` and a written record with a start time.
- **R2.** The severity MUST be re-assessed whenever impact changes, and the record MUST show each change.
- **R3.** An incident that exposes or may expose data in a restricted class (`06-security/sensitive-data.md`) MUST be treated as at least the second-highest severity level, and any secret involved MUST be rotated (`06-security/secrets-and-crypto.md` R6).

### Roles

- **R4.** Every incident MUST have exactly one incident lead, named in the record, who decides priorities and closes the incident.
- **R5.** Every incident above the lowest severity MUST have a named communications owner, who MAY be the incident lead on a team too small to separate them; the record MUST say so.
- **R6.** Hand-over of a role MUST be explicit and recorded.

### Communication

- **R7.** Status updates MUST be sent to the affected parties at the interval in `incident_response_targets`, including when there is nothing new.
- **R8.** An external statement about an incident MUST be approved by a named human and MUST NOT disclose another party's data or an unpatched vulnerability's detail.
- **R9.** An agent MUST NOT communicate externally about an incident; it MAY draft the text for a human.
- **R10.** Each alert that can page a person MUST link to a runbook that names this document's procedure and the first diagnostic steps.

### Review

- **R11.** An incident in `review_required_from` MUST have a blameless review within `review_deadline`, recording the timeline, impact, contributing causes, what went well and what did not.
- **R12.** Every review MUST end in corrective actions, each with an owner and a due date, tracked in the work tracker until done.
- **R13.** A review MUST NOT name an individual as the cause; it names the conditions that allowed the failure.

### Vulnerability disclosure

- **R14.** The project MUST publish a way for outsiders to report a security vulnerability privately, and MUST acknowledge a report within `disclosure_response_time`.
- **R15.** A reported vulnerability MUST be triaged with a severity, given a fix target, and fixed before its details are published; the reporter MUST be told the outcome.
- **R16.** A vulnerability in a released version MUST be announced to its users with the affected versions, the fixed version and any mitigation, once a fix is available.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | Incident record template; review of records | ❌ review-only |
| R2 | Review of the incident record | ❌ review-only |
| R3 | Review of the record; rotation evidence | ❌ review-only |
| R4 | Incident record template requires the field | ◐ partial |
| R5 | Incident record template requires the field | ◐ partial |
| R6 | Review of the record | ❌ review-only |
| R7 | Review of the record | ❌ review-only |
| R8 | Review of external statements | ❌ review-only |
| R9 | Agent rules and review | ❌ review-only |
| R10 | Alert-rule lint for a runbook link | ⬜ scheduled |
| R11 | Tracker report of incidents without a review past the deadline | ⬜ scheduled |
| R12 | Tracker report of overdue actions | ⬜ scheduled |
| R13 | Review of the review | ❌ review-only |
| R14 | Published-page check | ⬜ scheduled |
| R15 | Review of the vulnerability tracker | ❌ review-only |
| R16 | Release checklist | ❌ review-only |

## AI guardrails

- During an incident, do not communicate externally; draft for a human.
- Never close an incident or lower its severity; the incident lead does.
- Never write a review that blames a person.
- If you suspect a secret or restricted data leaked, say so at once and treat it as an incident.

## References

- [Google SRE Book: Postmortem Culture](https://sre.google/sre-book/postmortem-culture/)
- [RFC 9116](https://www.rfc-editor.org/rfc/rfc9116) — `security.txt`
- [ISO/IEC 29147](https://www.iso.org/standard/72311.html) — vulnerability disclosure
- `06-security/sensitive-data.md`, `06-security/secrets-and-crypto.md`, `15-delivery/production-readiness.md`
