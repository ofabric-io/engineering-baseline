---
pack: data-store
version: 0.1.0
requires: []
amends:
  - 15-delivery/deployments-and-rollback.md  # R17 (irreversible data changes) is the generic rule this pack's migration doctrine specialises
  - 15-delivery/pipeline-and-gates.md  # the migration-specific CI gates live here, not in the core gates
documents:
  - migrations.md  # Schema Migrations
  - transactions.md  # Transactions
---

# Pack: data-store

Standards for projects that keep state in a data store: how its schema changes safely, and how
work against it is grouped into transactions. The store's technology, migration tool and
isolation settings are decided in `docs/13-technology/`.

Documents in this folder depend on the core layers; no core document links here.

## What it adds to the core

- **Schema migrations.** `migrations.md` holds the expand, migrate, contract doctrine, the
  separate migration step and the migration-safety gates that the core delivery documents leave
  generic. Whether migrations are forward-only is a parameter there.
- **Transactions.** `transactions.md` covers transaction boundaries and store-level isolation
  mechanics.
- **Backups.** Backup and restore targets stay in `01-business/availability.md`; this pack adds
  only store-level mechanics where a document says so.

## Parameters worth deciding first

`migrations_forward_only`, `migration_unsafe_changes` and `backfill_execution` in `migrations.md`.

## Bootstrap

The bootstrap asks this pack's parameters in its own section of `bootstrap/questionnaire.md`.
