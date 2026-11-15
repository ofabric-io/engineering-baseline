---
name: ratify-standard
description: Run a ratification session for one standards document in docs/ — ask its open decisions in one batch with recommended defaults, then write its Rules, Enforcement and AI guardrails and move it to ratified on the user's yes. Use when the user wants to decide, fill in, change or ratify a standard ("ratify the testing doc", "let's do layer 8", "next document"), or when the bootstrap reaches a document.
---

# Ratify a standard

Moves one document in `docs/` to `status: ratified`.

## Inputs

The target document. If the user did not name one, read `docs/DECISION-QUEUE.md` and propose
the next unratified document, top layer first. Do not pick arbitrarily.

## Procedure

1. **Read before asking:** the target document (its Parameters and Open decisions),
   `docs/README.md`, every ratified document in the layers above it, and the deferred decisions
   in `docs/DECISION-QUEUE.md` that belong to it.
2. **Ask the open decisions in one batch,** numbered, each with a recommended default and a
   one-line trade-off. Where a higher ratified layer forces the answer, say so and ask for
   confirmation instead of presenting a false choice. Add questions the document missed if the
   answer changes what gets built; drop ones that do not.
3. **Never answer for the user.** An unanswered question stays in `## Open decisions` and its
   parameter stays `[[...]]`. If the user stops partway, write what was decided and list what
   remains.
4. **Write the document:**
   - `## Parameters` — every answer filled in.
   - `## Rules` — numbered (`R1.`), imperative, RFC 2119. Prefer MUST and MAY. One testable
     thing per rule. No rationale; that is the ADR's job.
   - `## Enforcement` — every rule appears, with its mechanism and status: `✅` automated,
     `◐` partial, `⬜` scheduled, `❌` deliberately review-only.
   - `## AI guardrails` — under ten blunt lines, nothing that is not in `## Rules`.
   - Frontmatter: `status: ratified`, `owner`, `last-reviewed: <today>` — only after step 7.
5. **Write an ADR for every real trade-off** (`.agents/skills/new-adr/SKILL.md`). Not for
   obvious choices.
6. **Build the enforcement that is cheap now** — a script check, a CI step, a test. Anything
   not buildable now becomes a `⬜` row and an Enforcement-debt row in
   `docs/DECISION-QUEUE.md`. No rule is left with no mechanism at all.
7. **Ratify only on the user's explicit yes.** Then update the status board in
   `docs/DECISION-QUEUE.md` and run `node scripts/check.mjs`, reporting its output.

## Constraints

- Do not ratify a document whose decisions depend on a layer that is still `not-started`. Name
  the blocking layer and stop.
- Do not create a separate agent-only rules file. Rules live once, in `docs/`.
- A ratified document changes only through an ADR (`docs/04-adr/README.md`).
