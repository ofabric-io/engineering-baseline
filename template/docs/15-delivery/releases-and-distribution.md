---
layer: 15-delivery
status: proposed
owner: TBD
last-reviewed: never
---

# Releases & Distribution

## Purpose

How a version of the project is numbered, published to the people or systems that consume it, and
supported afterwards. It covers software others install or link against: packages, binaries,
libraries, images and installers. Getting a version running in the project's own environments is
`deployments-and-rollback.md`; the rules for an HTTP interface's own versioning are not here.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `release_versioning_scheme` | [[release_versioning_scheme]] | Semantic Versioning, as adopted in `core_standards` (`05-protocols/rfc-profile.md`) | calendar versioning signals recency and says nothing about compatibility |
| `public_surfaces` | [[public_surfaces]] | listed by the project: for a library its exported API; for a command-line program its commands, flags, exit codes and output formats; for a daemon its configuration and wire protocols; for a user interface its documented behaviour | a wider surface protects consumers and slows change; a narrower one frees internals |
| `project_licence` | [[project_licence]] | listed by the project: an SPDX identifier for open source, or `proprietary` | the licence decides who may use, change and redistribute the code; changing it later needs every contributor's agreement |
| `distribution_channels` | [[distribution_channels]] | listed by the project, each with its registry or host | each channel is a publishing credential and a place to keep correct |
| `supported_versions_policy` | [[supported_versions_policy]] | the latest minor of the current major receives fixes; the previous major receives security fixes for 12 months | longer support costs backports; shorter support pushes upgrades onto consumers |
| `compatibility_matrix` | [[compatibility_matrix]] | listed by the project: platforms, runtimes and dependency ranges supported | a wider matrix is more test cost and fewer stranded consumers |
| `interface_deprecation_notice` | [[interface_deprecation_notice]] | at least one minor release and 90 days between the deprecation announcement and removal | shorter suits a first-party-only consumer base |
| `artifact_signing` | [[artifact_signing]] | every published artifact is signed with a key held by the release pipeline | unsigned artifacts are simpler and cannot be verified by consumers |
| `provenance_attestation` | [[provenance_attestation]] | the pipeline publishes a build provenance statement and a dependency inventory with each artifact | stronger attestation levels need a hardened build environment |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Which components are published outside the project (`03-architecture/system.md` Components
      table), and through which channels?
- [ ] Who may cut a release, and who holds the signing key?

## Rules

### Versioning

- **R1.** Every release MUST carry exactly one version under `release_versioning_scheme`, derived
  from the release tag, and the version MUST NOT be stored by hand in more than one place.
- **R2.** The project MUST list its public surfaces in `public_surfaces`; anything not listed is
  internal and MAY change in any release. _(applies to: library, cli, daemon, ui)_
- **R3.** A change that breaks a public surface MUST be released as a new major version under the
  scheme, never in a minor or patch release. _(applies to: library, cli, daemon, ui)_
- **R4.** A pre-release MUST be labelled as one in its version, and the artifact promoted to a final
  release MUST be the identical artifact (`15-delivery/deployments-and-rollback.md` R2).

### Publishing

- **R5.** Packages, binaries and libraries MUST be published by the release pipeline from a version
  tag on the default branch, to the channels in `distribution_channels` only; a person MUST NOT
  publish from a workstation. _(applies to: library, cli, daemon, ui)_
- **R6.** Publishing credentials MUST be available only to the release pipeline and MUST be scoped to
  publishing (`06-security/secrets-and-crypto.md`).
- **R7.** A published version MUST NOT be overwritten or deleted; a defect is corrected by a new
  version. A version MAY be withdrawn from use only with a recorded reason and a pointer to its
  replacement.
- **R8.** Every published artifact MUST carry its version, licence (`project_licence`), source
  location and a link to the release notes, and the repository MUST hold the licence text at its
  root.
- **R9.** Each release MUST have release notes listing breaking changes, deprecations, fixes and
  upgrade steps; they MUST come from the changelog (`14-git/git.md` R19).

### Trust

- **R10.** Published artifacts MUST be signed per `artifact_signing`, and the means of verifying a
  signature MUST be published. _(applies to: library, cli, daemon, ui)_
- **R11.** Each release MUST publish the provenance described in `provenance_attestation`, produced
  by the release pipeline and not by a person. _(applies to: library, cli, daemon, ui)_
- **R12.** The dependencies bundled in a published artifact MUST follow
  `06-security/dependencies-and-supply-chain.md`.

### Support and compatibility

- **R13.** The versions receiving fixes MUST follow `supported_versions_policy`, MUST be published,
  and the end of support of a version MUST be announced before it happens.
- **R14.** The platforms, runtimes and dependency ranges in `compatibility_matrix` MUST each be tested
  in the pipeline; dropping one MUST be announced in the release notes of the release that drops it.
  _(applies to: library, cli, daemon, ui)_
- **R15.** A security fix MUST be released for every supported version it affects, with an advisory
  published that names the affected and fixed versions.

### Deprecation of non-HTTP interfaces

- **R16.** A public surface MUST be deprecated before it is removed: announced in the release notes
  and signalled at the surface itself (a warning from the program, a marker in the library API, a
  log line for a deprecated configuration key). _(applies to: library, cli, daemon)_
- **R17.** The interval between the deprecation announcement and removal MUST be at least
  `interface_deprecation_notice`, and removal MUST happen only in a major version.
  _(applies to: library, cli, daemon)_

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | Release pipeline reads the version from the tag; a check that no second copy exists | ⬜ scheduled |
| R2 | Review of the `public_surfaces` answer | ❌ review-only |
| R3 | Compatibility check of public surfaces against the last release (API diff, command and flag diff) | ⬜ scheduled |
| R4 | Release pipeline promotes by identifier; pre-release label check | ⬜ scheduled |
| R5, R6 | Publishing job restricted to tag builds; credentials stored only in the pipeline | ⬜ scheduled |
| R7 | Registry setting forbidding overwrite and deletion | ⬜ scheduled |
| R8, R9 | Release pipeline step failing without metadata and notes | ⬜ scheduled |
| R10, R11 | Pipeline signing and attestation steps; a verification job on the published artifact | ⬜ scheduled |
| R12 | `06-security/dependencies-and-supply-chain.md` | ⬜ scheduled |
| R13, R15 | Published support table; review at release | ❌ review-only |
| R14 | Matrix build in CI | ⬜ scheduled |
| R16, R17 | Check that every removal in a diff was deprecated for the required interval | ⬜ scheduled |

## AI guardrails

- Never publish an artifact from a workstation or outside the release pipeline.
- Never overwrite or delete a published version; release a new one.
- A breaking change to a public surface is a major version. Never hide it in a minor.
- Never remove a public surface that has not been deprecated for the full notice period.
- Never commit a signing key or a publishing credential.

## References

- [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html)
- [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)
- `05-protocols/rfc-profile.md` — the adopted standards
- `14-git/git.md` — tags and changelog
- `15-delivery/deployments-and-rollback.md` — promotion of an identical artifact
- `06-security/dependencies-and-supply-chain.md` — dependencies in published artifacts
- `15-delivery/product-documentation.md` — documentation published with each release
