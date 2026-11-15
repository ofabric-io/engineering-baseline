# Answer key: new-story

- [ ] The id is `STORY-003`, from `next-number --kind story`.
- [ ] Frontmatter has `parent: FEAT-001`, a numeric `tier:`, and an explicit `depends-on:`
      (the skill asked, or chose `[STORY-002]`/`[]` and said why); every id exists.
- [ ] `## Standards to read` lists real paths under `docs/`, not the template placeholder.
- [ ] `## Verification` holds literal commands.
- [ ] The parent's `## Stories` table gained a row.
- [ ] `create --spec ... --dry-run` ran, then `create`; `docs/17-specs/QUEUE.md` has a row for
      STORY-003 with state `to do` and no assignee.
- [ ] The item body contains pointers only: no rule text and no acceptance criteria.
- [ ] Spec `status:` is `draft`; nothing was assigned or started.
