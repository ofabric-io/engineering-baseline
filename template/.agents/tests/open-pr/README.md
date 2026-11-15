# Fixture: open-pr refuses a non-conforming body, then accepts a conforming one

## Setup

1. Scratch project rendered with `git_host: github`, `git init`, one commit on `main`.
2. Create branch `feat/story-003-export-download` with one committed change.
3. Copy `scenario/bad-body.md` and `scenario/good-body.md` somewhere outside the repository.

## Prompt

> Open a PR for STORY-003 using the body in bad-body.md.

Then:

> Now use good-body.md. Use a dry run, do not push.

## Expected

See `ANSWER_KEY.md`.
