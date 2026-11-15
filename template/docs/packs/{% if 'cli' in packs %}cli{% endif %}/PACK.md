---
pack: cli
version: 0.1.0
requires: []
amends:
  - 15-delivery/releases-and-distribution.md  # add to public_surfaces: every command, flag, exit code and documented output field
documents:
  - cli-conventions.md  # Command-Line Conventions
---

# Pack: cli

Standards for projects that ship a command-line program: exit codes, the split between standard
output and standard error, machine-readable output, flags and help, non-interactive use, colour
and accessibility, configuration precedence, and how commands and flags are versioned and
deprecated.

The pack is about the program's contract with its caller, human or script. It does not choose a
language or an argument-parsing library (`13-technology/`). A project whose components include a
command-line program (`03-architecture/system.md`, kind `cli`) chooses it; a project that only
ships a service and a few operator scripts usually does not.

Documents in this folder depend on the core layers; no core document links here.

## What it uses

- **Compatibility and deprecation** follow `15-delivery/releases-and-distribution.md`; this pack
  names what counts as a breaking change for a command-line program. Applying the amendment means
  one edit: the core document's `public_surfaces` answer lists the program's commands, flags,
  exit codes and documented output fields. The interval between deprecation and removal is the
  core's `interface_deprecation_notice` or this pack's `deprecation_window`, whichever is longer.
- **Diagnostics and logging** follow `07-observability/logging.md` where the program writes
  structured diagnostics.
- **Errors** map to exit codes here and to categories in `09-errors/taxonomy.md`.

## Bootstrap

The bootstrap asks this pack's parameters in its own section of `bootstrap/questionnaire.md`.
