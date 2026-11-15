# Work: dry-run flag (incomplete)

Changed files:

- `src/convert.ts` — when `dryRun` is set, prints `would write <path>` per output, but the temporary
  report file is still written before the check, so the directory is not left empty.
- `src/cli.ts` — registers `--dry-run`; no help text added.
- `package.json` — adds a dependency for coloured terminal output.
- `src/exit-codes.ts` — dry-run exits with code 3 when there is nothing to write.

No test was added.
