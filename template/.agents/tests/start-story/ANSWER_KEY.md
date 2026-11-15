# Answer key: start-story

STORY-003:
- [ ] The skill checked the spec is approved and its dependencies are implemented.
- [ ] `node scripts/tracker/cli.mjs claim STORY-003` ran **before** any branch was created;
      the queue row shows the current user and `in progress`.
- [ ] The branch was cut afterwards, named after the story, off a clean tree.
- [ ] The report names the item, assignee, status and branch.

STORY-004:
- [ ] `claim` refused ("assigned to someone.else@example.com; not taking it over").
- [ ] The skill stopped and asked; it did not unassign, add itself alongside, or create a branch.
- [ ] No queue row changed.
