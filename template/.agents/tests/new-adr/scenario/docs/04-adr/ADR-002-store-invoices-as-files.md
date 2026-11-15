---
adr: 002
status: accepted # proposed | accepted | rejected | superseded
date: 2026-01-12
deciders: [maintainers]
supersedes: null
superseded-by: null
---

# ADR-002: Store invoices as plain files

## Context

The tool is run from a command line and must work offline. No other component reads the data.

## Decision

Converted invoices are written as plain files next to the input.

## Alternatives considered

| Option | Why not |
| --- | --- |
| Embedded database | Adds a dependency and a migration story for no shared reader. |

## Consequences

Simple and portable. Concurrent runs on one directory are not coordinated.

## Compliance

Review only.

## Amendments

| Date | Change | Why |
| --- | --- | --- |
