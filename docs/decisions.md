# Decisions

## D-01 — Prototype scope first

The requested blueprint describes a multi-container, production-grade system with database constraints, worker fencing, AWS setup and 55 scenarios. The workspace was empty and no blueprint file was supplied beyond the detailed request. This deliverable therefore establishes the user-facing product prototype and its honest status vocabulary first. It does not substitute UI claims for backend verification.

## D-02 — Synthetic fixtures only

All branches, people, products, identifiers and values in the interface are fabricated. A permanent `SYNTHETIC DATA` marker is visible in the application shell.

## D-03 — Evidence is visibly incomplete

The Crash Theater and Reliability Centre render `NOT_RECORDED`, `NOT_RUN`, and `NOT_CONFIGURED` rather than invented measurements. This follows the supplied guardrail for honest evidence.

## D-04 — Local checkout demonstration

`server.mjs` implements a tiny local HTTP service for demonstrating idempotent checkout: an identical `Idempotency-Key` and payload return the saved invoice, while a changed payload returns HTTP 409. Its atomic JSON file is a teaching aid only; it is not a substitute for PostgreSQL transactions, stock locks, or the blueprint's production safety guarantees.
