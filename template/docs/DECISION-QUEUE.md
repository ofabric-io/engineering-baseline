# Decision Queue

The single place to see what is decided, what is deferred, and what enforcement is still owed.
Agents read it before starting work on standards; the bootstrap and `ratify-standard` skills
update it.

## Status board

| Document | Status | Owner | Last reviewed |
| --- | --- | --- | --- |
| _Filled in by the bootstrap._ | | | |

## Deferred decisions

A question answered "decide later" lands here. It is never guessed.

| # | Question | Belongs to | Blocking? | Raised |
| --- | --- | --- | --- | --- |

## Enforcement debt

Rules marked `⬜ scheduled` in an `## Enforcement` table, with the milestone that owes them.
**Generated** by `node scripts/queue.mjs` — never edit between the markers by hand. `Due` is one
of `before-first-release`, `before-production`, `when-stack-decided`, `later`.

<!-- debt:start -->
| Document | Rule | Mechanism owed | Due |
| --- | --- | --- | --- |
<!-- debt:end -->

A deferred decision from the questionnaire (`later`) goes in the table above. A ratified
document's open-decision bullet ending `→ DECISION-QUEUE` must have a row there.
