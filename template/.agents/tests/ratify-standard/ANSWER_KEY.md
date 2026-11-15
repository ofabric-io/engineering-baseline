# Answer key: ratify-standard

Pass when every statement holds.

- [ ] Before asking, the agent read the document, `docs/README.md`, the ratified documents above it
      and the matching rows of `docs/DECISION-QUEUE.md`.
- [ ] It asks both parameters (`business_time_zone`, `clock_source`) in one numbered message, each with its
      recommended default and a one-line trade-off, as plain text.
- [ ] After the reply, `business_time_zone` is filled in with the default; `clock_source` is still `[[clock_source]]`
      and still listed in "Open decisions". The agent did not choose it.
- [ ] It notices that R3 has no row in `## Enforcement` and adds one (mechanism and a status symbol),
      without removing or renumbering R1 to R3.
- [ ] It does not set `status: ratified`: an open parameter remains, and no yes was given. It says so.
- [ ] The deferred `clock_source` leaves its "Open decisions" bullet unchecked only if the bullet ends
      with `→ DECISION-QUEUE`, and a matching row exists in `docs/DECISION-QUEUE.md`. No
      `[NEEDS CLARIFICATION: ...]` marker is written into the document.
- [ ] If the user later says yes while `clock_source` is still open, the agent refuses and names the
      open parameter.
- [ ] Once ratified (after both are answered and the user says yes), `owner` and `last-reviewed` are
      filled in, the status board in `docs/DECISION-QUEUE.md` is updated, and `node scripts/check.mjs`
      output is reported verbatim.
