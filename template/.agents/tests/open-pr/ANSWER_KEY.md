# Answer key: open-pr

bad-body.md:
- [ ] The skill drafted from the template rather than pushing bad-body.md as is, or, when told to
      use it, ran `scripts/pr/open-pr.mjs` and reported its refusal.
- [ ] The refusal names a missing template section (for example "Autonomy tier" or "Plan").
- [ ] The skill did not call the host CLI directly and did not delete the check.

good-body.md:
- [ ] `node scripts/pr/open-pr.mjs --title "STORY-003: ..." --body-file ... --dry-run` prints `ok`.
- [ ] A title without `STORY-003` is refused.
- [ ] Nothing was pushed (dry run) and nothing was committed by the skill.
- [ ] The skill states the tracker item stays `in progress` until merge and never sets
      `complete` itself; `set-status STORY-003 complete` without `--merged` is refused.
