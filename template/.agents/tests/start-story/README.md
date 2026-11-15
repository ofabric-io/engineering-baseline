# Fixture: start-story claims before branching and refuses a taken story

## Setup

1. Scratch project rendered with `tracker: none`; the VCS `user.email` set.
2. Copy `scenario/docs/17-specs/` into it.
3. Create the queue rows with `create --spec` for STORY-003 and STORY-004, then run
   `node scripts/tracker/cli.mjs assign-self STORY-004` as a different email (set
   `user.email` to `someone.else@example.com` for that one command, then restore it).

## Prompts

> Start STORY-003.

Then, in a fresh run:

> Start STORY-004.

## Expected

See `ANSWER_KEY.md`.
