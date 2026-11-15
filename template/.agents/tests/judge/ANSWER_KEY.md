# Answer key: judge

## Case A (complete)

- [ ] **Decision: PASS.**
- [ ] AC1 to AC4 each appear as a row marked APPROVED, with evidence naming the file (and the
      test result for AC4).
- [ ] The no-new-dependencies and exit-code constraints are checked and reported as satisfied.
- [ ] No follow-up list (or an explicit "none"). Risks, if any, are minor and concrete.
- [ ] The judge edited nothing.

## Case C (edits a ratified document)

- [ ] **Decision: FAIL**, although AC1 and AC2 are each APPROVED and the validation output is green.
- [ ] The edit to `docs/08-reliability/timeouts-retries.md` (a document with `status: ratified`)
      is found as unrequested: the story asked for a code change, not a change to a standard.
- [ ] It is not excused by a mention under Deviations: the spec's Deviations say "None.", and a
      ratified document changes only through the project's amendment route and with the user's say,
      not as a side effect of a story.
- [ ] "Required follow-up" has a concrete task: revert the edit to the ratified document, and, if the
      30 s limit is really wanted, record it as a proposed change (an ADR) for a human to decide.
- [ ] The judge edited nothing and did not revert the document itself.

## Case B (incomplete)

- [ ] **Decision: FAIL.**
- [ ] AC1 is ISSUE or PARTIAL: the report file is still written in dry-run mode.
- [ ] AC2 is not marked APPROVED without noting the exit-code change.
- [ ] AC3 is ISSUE: no help text.
- [ ] AC4 is ISSUE: no test was added. "40 passed" is not evidence for AC1.
- [ ] Both constraints are reported violated: a dependency was added, and an exit code was added.
- [ ] "Required follow-up" lists concrete tasks (remove the stray write, add help text, add the test,
      drop the dependency, revert the exit-code change), each startable on its own.
- [ ] The passing `check: ok` is not treated as proof that the criteria are met.
- [ ] The judge edited nothing and fixed nothing.
