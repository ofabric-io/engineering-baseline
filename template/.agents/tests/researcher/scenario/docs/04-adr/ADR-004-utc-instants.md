---
adr: 004
status: accepted # proposed | accepted | rejected | superseded
date: 2026-01-15
deciders: [maintainers]
supersedes: null
superseded-by: null
---

# ADR-004: Instants are stored in UTC

## Context

Mixed local times caused off-by-one-day errors in reports.

## Decision

Every instant is stored and exchanged in UTC. Zones are applied only for display.

## Alternatives considered

| Option | Why not |
| --- | --- |
| Store the zone of the originating user | Comparison and sorting need conversion everywhere. |

## Consequences

Comparisons are simple. Business dates that depend on a zone need their zone stored separately.

## Compliance

Review only.

## Amendments

| Date | Change | Why |
| --- | --- | --- |
