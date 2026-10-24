# Prototype architecture

```text
Feature-first local demonstrator
  ├─ Vite client (src/main.js)
  │   ├─ Today dashboard and action queue
  │   ├─ Billing counter, stock/expiry, alerts and reorder lab
  │   ├─ Delivery Radar and Reliability Centre
  │   └─ explicit synthetic / NOT_RUN state labels
  └─ Node local service (server.mjs)
      ├─ health endpoint
      ├─ idempotent checkout endpoint
      └─ atomic JSON demonstration store
```

The supplied target architecture is intentionally broader: React + TypeScript, FastAPI, PostgreSQL, HAProxy, worker, migration and backup jobs. No service layer, external worker, database, or cloud resources have been claimed in this prototype.
