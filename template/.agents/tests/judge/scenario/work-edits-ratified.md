# Work: bounded download call (edits a ratified document)

Changed files:

- `src/download.ts` — the call is made with the configured timeout and returns the timeout error
  when it expires.
- `test/download.timeout.test.ts` — starts a server that never answers and asserts the timeout
  error is returned.
- `docs/08-reliability/timeouts-retries.md` — the `default_timeout` answer changed from 10 s to 30 s
  so that the new call fits within the rule.

No dependency files changed. The story's Deviations section is unchanged.
