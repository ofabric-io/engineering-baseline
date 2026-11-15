# Story: bound the download call

## Acceptance criteria

- **AC1.** The download call gives up after the configured timeout and returns the timeout error.
- **AC2.** A test proves AC1 with a server that never answers.

## Constraints

- No new dependencies.
- No change to any document marked `status: ratified`.

## Deviations

None.
