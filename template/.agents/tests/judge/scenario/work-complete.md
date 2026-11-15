# Work: dry-run flag (complete)

Changed files:

- `src/convert.ts` — reads the new `dryRun` option; when set, prints `would write <path>` per output
  and returns before any write call. Without the option the code path is identical to before.
- `src/cli.ts` — registers `--dry-run` with the help text "Print what would be written; write nothing."
- `test/convert.dry-run.test.ts` — runs the command with `--dry-run` in an empty temp directory and
  asserts the directory is still empty and the output lists the expected paths.

No dependency files changed. Exit-code handling was not touched.
