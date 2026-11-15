---
layer: packs/cli
status: proposed # not-started | proposed | in-progress | ratified
owner: TBD
last-reviewed: never
applies-to: [cli]
---

# Command-Line Conventions

## Purpose

The contract a command-line program offers its callers, whether a person at a terminal or a
script in a pipeline: what it returns, where its output goes, how it is configured, and how it
changes over time without breaking them.

## Parameters

| Parameter | Answer | Default | Trade-off |
| --- | --- | --- | --- |
| `exit_code_scheme` | [[exit_code_scheme]] | the codes fixed in R2 plus the project's own, listed in the table below; a single failure code unless callers need to tell failures apart | one code per error category is precise and hard for scripts to keep up with |
| `machine_output_flag` | [[machine_output_flag]] | a `--json` flag that switches product output to one JSON document (or one JSON value per line for streams) | a format per command is flexible and impossible to script against |
| `non_interactive_flag` | [[non_interactive_flag]] | a `--no-input` flag, and automatic non-interactive mode when standard input is not a terminal | an explicit flag only is predictable and breaks piping by surprise |
| `config_precedence` | [[config_precedence]] | flags, then environment variables, then project file, then user file, then built-in defaults | fewer layers are easier to explain and force one place for everything |
| `config_env_prefix` | [[config_env_prefix]] | one fixed upper-case prefix per program, shared by every variable | no prefix collides with other programs' variables |
| `deprecation_window` | [[deprecation_window]] | a removed command, flag or output field is deprecated for at least two minor releases first | a shorter window frees maintainers and strands scripts |
| `version_output` | [[version_output]] | `--version` prints the program name and version on one line, and exits 0 | adding build details helps support and breaks naive parsing |

## Open decisions

- [ ] Ratify this document with the project (`.agents/skills/ratify-standard/SKILL.md`).
- [ ] Which commands are a stable public interface for scripts, and which are for people only?
- [ ] Which environments run the program non-interactively (continuous integration, scheduled jobs)?

## Exit codes

The project's own codes, beyond those fixed in R2, chosen per `exit_code_scheme`. A code is never reused for another meaning.

| Code | Meaning | Error category (`09-errors/taxonomy.md`) |
| --- | --- | --- |
| [[exit_code]] | | |

## Rules

### Exit codes and streams

- **R1.** The program MUST exit with the code `exit_code_scheme` defines, and MUST NOT report success after a failure, or failure after a success.
- **R2.** Exit code 0 MUST mean success, 2 MUST mean the invocation was invalid (unknown flag, missing argument), and any other failure MUST be a non-zero code listed in the exit-codes table or the scheme.
- **R3.** Every exit code the program can return MUST be documented in the table above and in the program's help, and MUST NOT change meaning in a later release.
- **R4.** Product output (what the user asked for) MUST go to standard output; diagnostics, progress, prompts, warnings and errors MUST go to standard error.
- **R5.** An error message MUST say what failed and, where one exists, what the caller can do; it MUST NOT expose a stack trace by default, and MUST NOT print a secret or personal data (`06-security/sensitive-data.md`).

### Machine-readable output

- **R6.** Every command that produces data MUST support `machine_output_flag`. Its output MUST contain only the machine-readable document on standard output, with nothing else interleaved.
- **R7.** The machine-readable form MUST be a stable, documented interface: field names are stable, fields are added but not renamed or removed without the process in R20, and the output carries no colour, progress or decorative text.
- **R8.** In machine-readable mode, failure details MUST still reach standard error and the exit code, and SHOULD also appear as a structured error document on standard output when the command would otherwise have produced one.

### Flags, help and version

- **R9.** Every command MUST support a help flag that prints usage, the flags with their defaults and the exit codes, to standard output, and exits 0. A command invoked incorrectly MUST print a short usage hint to standard error and exit 2.
- **R10.** `version_output` MUST be supported at the top level.
- **R11.** Long flags MUST be spelled in lower-case words joined by hyphens; a short flag MAY exist only for a frequently used long flag. A flag MUST mean the same thing in every command that has it.
- **R12.** The program MUST accept `--` to end flag parsing, and MUST read from standard input where a file argument is `-` and the command is meant to be piped.
- **R13.** A destructive command MUST ask for confirmation when interactive and MUST require an explicit flag when non-interactive; it MUST NOT proceed by default.

### Interactivity, colour and accessibility

- **R14.** The program MUST detect whether standard input and standard output are terminals. It MUST NOT prompt, paginate, animate or colour when they are not, and MUST honour `non_interactive_flag` everywhere it would otherwise prompt.
- **R15.** Colour MUST be off when the `NO_COLOR` environment variable is set to any non-empty value, when output is not a terminal, or when the terminal declares itself unable. An explicit flag MAY turn it back on.
- **R16.** Meaning MUST NOT be conveyed by colour alone: a status, an error and a warning MUST carry a word or symbol as well.
- **R17.** Progress MUST be reported as plain, appended lines (or a single updating line only on a terminal), never as an animation that a screen reader reads repeatedly; each progress line MUST stand alone in meaning.
- **R18.** Text output MUST NOT depend on a fixed terminal width or on box-drawing characters for meaning; a table MUST remain readable when wrapped or piped.

### Configuration and compatibility

- **R19.** Configuration MUST resolve in the order `config_precedence`, and the program MUST be able to print which source supplied each effective value. Environment variables MUST use `config_env_prefix`. A secret MUST NOT be accepted as a flag value, because arguments are visible to other processes; it MUST be read from the environment, a file or standard input.
- **R20.** Removing or renaming a command, flag, exit code or documented output field, or changing its meaning, MUST be treated as a breaking change under `15-delivery/releases-and-distribution.md`: it MUST be deprecated for `deprecation_window` first, the deprecation MUST be announced on standard error when the old form is used and in the release notes, and the change MUST go out in a release the versioning policy marks as breaking.
- **R21.** A deprecation warning MUST be silenced by a documented setting for scripts, MUST NOT change the exit code, and MUST NOT appear in machine-readable output on standard output.

## Enforcement

| Rule | Mechanism | Status |
| --- | --- | --- |
| R1 | Contract tests asserting each command's exit code on success and on each failure | ⬜ scheduled |
| R2 | Contract tests for an invalid invocation and an unknown failure | ⬜ scheduled |
| R3 | Test comparing the exit-codes table with the codes the program defines; PR review | ⬜ scheduled |
| R4 | Contract tests capturing the two streams separately | ⬜ scheduled |
| R5 | Contract test on failure output; PR review | ⬜ scheduled |
| R6 | Contract test parsing standard output of every data command in machine-readable mode | ⬜ scheduled |
| R7 | Golden-file test of machine-readable output; schema check | ⬜ scheduled |
| R8 | Contract test of a failing command in machine-readable mode | ⬜ scheduled |
| R9 | Contract test of help output and of an invalid invocation | ⬜ scheduled |
| R10 | Contract test of the version flag | ⬜ scheduled |
| R11 | Lint over the flag definitions; PR review | ⬜ scheduled |
| R12 | Contract test of `--` and `-` handling | ⬜ scheduled |
| R13 | Contract test of a destructive command in both modes | ⬜ scheduled |
| R14 | Contract tests run with standard streams redirected | ⬜ scheduled |
| R15 | Contract tests with `NO_COLOR` set and with output redirected | ⬜ scheduled |
| R16 | PR review of output text | ❌ review-only |
| R17 | Contract test of progress output when redirected; PR review | ◐ partial |
| R18 | Contract test with a narrow terminal width; PR review | ◐ partial |
| R19 | Contract tests of precedence for each layer; test that a secret flag is rejected | ⬜ scheduled |
| R20 | Compatibility test against the previous release's documented commands and flags; PR review against the release notes | ◐ partial |
| R21 | Contract test of deprecated usage in both output modes | ⬜ scheduled |

## AI guardrails

- Product output goes to standard output; messages, progress and errors go to standard error.
- Never change an exit code, flag name or output field without the deprecation process.
- Never print colour, progress or decoration in machine-readable mode or when output is not a terminal.
- Never take a secret as a flag value.
- Never prompt when input is not a terminal.

## References

- [NO_COLOR](https://no-color.org/) — the convention for disabling colour
- [POSIX Utility Conventions](https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/V1_chap12.html) — flags and the `--` delimiter
- [Semantic Versioning 2.0.0](https://semver.org/)
- `15-delivery/releases-and-distribution.md` — compatibility, deprecation and release notes
- `09-errors/taxonomy.md`, `07-observability/logging.md`, `06-security/sensitive-data.md`
