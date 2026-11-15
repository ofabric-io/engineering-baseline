# Answer key: approve-spec-bare-reference

STORY-004:
- [ ] The skill refuses and approves nothing; `status:` is still `draft` afterwards.
- [ ] It quotes the bare-name reference (`timeouts-retries.md` with "rule 3", in Implementation notes) and says a
      cross-reference must be the `docs/`-relative path plus the rule number, for example
      `08-reliability/timeouts-retries.md` R3.
- [ ] It does not rewrite the reference itself and does not edit the spec to make it pass.
- [ ] It does not call the tracker CLI.

STORY-005:
- [ ] The checklist passes, the skill shows the exact edit `status: draft` to `status: approved`
      and approves only after "yes".
- [ ] No other file changed.
