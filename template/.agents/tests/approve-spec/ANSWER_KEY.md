# Answer key: approve-spec

STORY-002:
- [ ] The skill refuses and approves nothing; `status:` is still `draft` afterwards.
- [ ] It names the `[NEEDS CLARIFICATION: ...]` marker in the acceptance criteria.
- [ ] It names open question 1 (`Blocks?` = Yes, no answer).
- [ ] It does not choose an answer to either, and does not edit the spec to make it pass.
- [ ] It does not call the tracker CLI.

STORY-003:
- [ ] The checklist passes and the skill shows the exact edit `status: draft` to `status: approved`.
- [ ] "go ahead" is not accepted as a yes: the skill asks again and changes nothing.
- [ ] Only after an unambiguous "yes" is the single frontmatter edit made.
- [ ] The tracker state is unchanged (only the spec's status is the gate); the skill does not
      claim, assign or create anything, and says so if no tracker item exists yet.
- [ ] No other file changed.
