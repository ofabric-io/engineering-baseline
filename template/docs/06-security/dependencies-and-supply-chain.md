---
layer: 06-security
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
---

# Dependencies & Supply Chain

## Purpose

How third-party code enters, stays in and leaves the project: who may add, upgrade or remove a dependency, how often dependencies are updated, what happens to abandoned ones, which licences are acceptable, and how installs and releases are made tamper-evident. Vulnerability scanning thresholds are in `06-security/appsec.md` R13; this document owns everything else about dependencies.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `agent_dependency_changes` | [[agent_dependency_changes]] | agents may propose; security patches may be applied on a branch with tests | stricter slows patching; looser lets an agent widen the attack surface unseen |
| `dependency_update_cadence` | [[dependency_update_cadence]] | routine updates reviewed monthly; security patches as soon as available | frequent updates cost review time; rare ones make each update bigger and riskier |
| `abandonment_threshold` | [[abandonment_threshold]] | no release or maintainer activity for 12 months, or an archived upstream | a short threshold flags healthy stable packages; a long one hides dead ones |
| `allowed_licences` | [[allowed_licences]] | permissive licences only; anything else needs recorded legal approval | a wider list widens choice and obligations |
| `sbom_required` | [[sbom_required]] | yes, generated for every release | none significant beyond tooling; a customer or regulator may require it |
| `release_signing` | [[release_signing]] | released artefacts are signed and carry build provenance | signing needs key management; unsigned releases cannot be verified downstream |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Which package sources are approved (R12), and who maintains the list?
- [ ] Who approves a dependency on a licence outside `allowed_licences`?

## Rules

### Adding, upgrading and removing

- **R1.** A change that adds a dependency MUST state its purpose, licence, maintenance state and the alternatives considered, including doing without it.
- **R2.** A new runtime dependency MUST be approved by a human reviewer who is not the author. What an agent may do on its own is limited to `agent_dependency_changes`.
- **R3.** A major-version upgrade MUST be its own change, with the upstream's breaking changes read and noted.
- **R4.** A security-patch update MAY be applied ahead of the normal review cadence, provided the test suite passes on the branch that carries it.
- **R5.** A dependency no longer used MUST be removed in the change that stops using it.

### Currency and health

- **R6.** Dependencies MUST be reviewed for updates on `dependency_update_cadence`; a security patch MUST be applied within the time implied by `blocking_vulnerability_severity` (`06-security/appsec.md` R13).
- **R7.** A dependency that meets `abandonment_threshold` MUST be recorded in the at-risk register below with a plan: replace, take over, vendor, or accept with a stated reason.
- **R8.** Code copied into the repository from a third party MUST be recorded with its source, version and licence, and is governed by this document as if it were a dependency.
- **R9.** Every dependency, direct and transitive, MUST carry a licence in `allowed_licences`; a licence check MUST run in CI.

### Lockfiles and integrity

- **R10.** The lockfile (or its equivalent) MUST be committed, and CI MUST install exactly what it records and fail if the install would change it.
- **R11.** Installed packages MUST be verified against recorded integrity hashes.
- **R12.** Dependencies MUST be fetched only from approved package sources; a dependency declared by direct URL or by an unreviewed source MUST NOT be used.
- **R13.** Build and CI tooling references (pipeline actions, base images, build plugins) MUST be pinned to an immutable version or digest.

### Releases

- **R14.** Per `sbom_required`, every release MUST publish a software bill of materials listing its dependencies and versions.
- **R15.** Per `release_signing`, release artefacts MUST be signed, and the signing key MUST be held in the secret store, never in the repository (`06-security/secrets-and-crypto.md`).

## At-risk register

| Dependency | Why at risk | Plan | Reviewed |
| --- | --- | --- | --- |
| | | | |

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | PR template and review | ❌ review-only |
| R2 | Dependency-manifest diff flagged for human approval | ⬜ scheduled |
| R3 | PR review | ❌ review-only |
| R4 | CI runs the full suite on dependency branches | ⬜ scheduled |
| R5 | Unused-dependency check, chosen in `13-technology/` | ⬜ scheduled |
| R6 | Scheduled update job and review calendar | ⬜ scheduled |
| R7 | Scheduled maintenance-state report; register review | ⬜ scheduled |
| R8 | PR review | ❌ review-only |
| R9 | CI licence check | ⬜ scheduled |
| R10 | CI install in frozen mode | ⬜ scheduled |
| R11 | Package manager integrity verification enabled | ⬜ scheduled |
| R12 | Package-manager configuration review; manifest lint | ⬜ scheduled |
| R13 | Pipeline lint for unpinned references | ⬜ scheduled |
| R14 | Release pipeline step; release checklist | ⬜ scheduled |
| R15 | Release pipeline signs and a verification step runs | ⬜ scheduled |

## AI guardrails

- Never add a runtime dependency on your own; propose it with purpose, licence and alternatives.
- Apply a security patch only on a branch, with the tests passing.
- Never edit a lockfile by hand or install without honouring it.
- Never pull a dependency from an unapproved source or by raw URL.
- Never bypass a licence or integrity failure.

## References

- [SPDX](https://spdx.dev/) and [CycloneDX](https://cyclonedx.org/) — SBOM formats
- [SLSA](https://slsa.dev/) — build provenance levels
- [OWASP Software Supply Chain Security](https://cheatsheetseries.owasp.org/cheatsheets/Software_Supply_Chain_Security_Cheat_Sheet.html)
- `06-security/appsec.md`, `06-security/secrets-and-crypto.md`, `16-ai/prohibitions.md`
