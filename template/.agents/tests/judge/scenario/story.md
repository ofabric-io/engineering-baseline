# Story: add a `--dry-run` flag to the convert command

## Acceptance criteria

- **AC1.** `convert --dry-run` prints the files it would write and writes nothing.
- **AC2.** Without `--dry-run`, behaviour is unchanged.
- **AC3.** The flag is documented in the command's help text.
- **AC4.** A test proves AC1 (no file is created in dry-run mode).

## Constraints

- No new dependencies.
- No change to the exit codes.
