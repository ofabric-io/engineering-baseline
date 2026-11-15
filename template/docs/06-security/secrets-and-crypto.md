---
layer: 06-security
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Secrets & Cryptography

## Purpose

Where secrets live, how they rotate, and which cryptographic practices are allowed. The rules are widely agreed basics; the project chooses the concrete store and algorithms in `13-technology/`.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `secret_store` | [[secret_store]] | decided in 13-technology/ | never in the repository |
| `rotation_policy` | [[rotation_policy]] | every secret rotatable without downtime; cadence and owner set per secret class | two valid versions during rotation |
| `min_transport_security` | [[min_transport_security]] | TLS 1.2 or higher for every network connection that leaves a trust zone | older clients break; weaker protocols are exploitable |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Encryption at rest: volume-level only, or field-level for named fields?
- [ ] Is mutual authentication needed for any integration?

## Rules

### Secret handling

- **R1.** A secret MUST NOT appear in source, a fixture, a commit message, a log, a CI log or a build artifact.
- **R2.** Secrets MUST be held in the `secret_store` and injected into the process at deploy or start time, except those governed by R17.
- **R3.** Secrets MUST be read in one place, validated at start-up, and the process MUST fail to start if a required one is missing.
- **R4.** A secret MUST NOT be passed to a logger even when redaction would mask it.
- **R5.** Every secret MUST be rotatable under `rotation_policy`; the system MUST accept two valid versions of a secret during rotation.
- **R6.** A secret exposed in any way MUST be treated as compromised and rotated.
- **R7.** Each environment MUST use its own secrets; a production secret MUST NOT be usable in another environment.

### Cryptography

- **R8.** Cryptography MUST NOT be hand-rolled: no custom cipher, mode, protocol or construction.
- **R9.** Primitives MUST come from a maintained, widely reviewed library, and the approved algorithms per purpose (password hashing, hashing, symmetric encryption, signatures, randomness) MUST be listed in `13-technology/`.
- **R10.** Passwords MUST be stored only as output of a purpose-built, salted, slow password-hashing function.
- **R11.** Values that must be unpredictable (tokens, identifiers used as secrets, nonces, reset codes) MUST come from a cryptographically secure random source.
- **R12.** Comparison of a secret, token, signature or authentication code MUST be constant-time.
- **R13.** A signature MUST be verified over the exact bytes received, before parsing or normalisation.
- **R14.** Encryption keys MUST be separate from the data they protect and MUST NOT share the data's backup.

### Transport

- **R15.** Network connections that leave a trust zone MUST use at least `min_transport_security`.
- **R16.** Certificate verification MUST NOT be disabled in any environment.

### Secrets that leave the control plane

- **R17.** A secret that deliberately leaves the control plane (for example customer key material distributed to nodes) MUST be: delivered only over a channel authenticated to the individual recipient, scoped to that recipient and purpose, held there in memory or owner-only storage, revocable and replaced on rotation, and never logged. Each such secret type MUST be named in this document and classed as secret in `06-security/sensitive-data.md` R13. _(applies to: service, daemon, batch)_

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | `scripts/checks/secrets.mjs`, run by `scripts/check.mjs` in the pre-commit hook (staged files) and in CI (all tracked files); log and artifact leaks by review | ◐ partial |
| R2 | Deployment configuration review | ❌ review-only |
| R3 | Start-up test with a missing secret | ⬜ scheduled |
| R4 | PR review | ❌ review-only |
| R5 | Rotation drill, run at the cadence in the open decision | ⬜ scheduled |
| R6 | Incident procedure | ❌ review-only |
| R7 | Secret-store access policy review | ❌ review-only |
| R8 | PR review; security review of any cryptographic change | ❌ review-only |
| R9 | Dependency review against the `13-technology/` list | ⬜ scheduled |
| R10 | Unit test and code review | ◐ partial |
| R11 | Static-analysis rule banning non-secure random sources in security code | ⬜ scheduled |
| R12 | Static-analysis rule on comparisons of secrets | ⬜ scheduled |
| R13 | Test with re-serialized payload | ⬜ scheduled |
| R14 | Infrastructure review | ❌ review-only |
| R15 | TLS scan of external endpoints in CI or on a schedule | ⬜ scheduled |
| R16 | Static search for verification-disabling options | ⬜ scheduled |
| R17 | Distribution-path review; revocation test | ⬜ scheduled |

## AI guardrails

- Never write a secret into a file, a test, a log or a message, not even a fake that looks real.
- Never invent cryptography. Use the library and algorithms in `13-technology/`.
- Never use a non-secure random source for anything unpredictable.
- Never disable certificate verification, even temporarily.
- A secret sent to a node is scoped to that node, revocable, and never logged.
- If a secret leaks, say so immediately; do not assess whether it was probably fine.

## References

- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [RFC 8446](https://www.rfc-editor.org/rfc/rfc8446) — TLS 1.3
- `06-security/sensitive-data.md`, `13-technology/`
