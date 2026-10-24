# PharmGrid traceability matrix

This repository is a local, synthetic-data demonstrator. It does not claim to provision AWS, send mail, or provide a production transaction service.

| Area | Demonstrated in | Safety signal | Automated verification |
|---|---|---|---|
| Billing idempotency | Billing counter + local checkout API | persisted key / replay receipt | local replay and changed-payload checks |
| Stock alerts | Today, Alert Centre | threshold labels, episode states, action assignment | UI navigation verified |
| Expiry block | Billing counter | explicit expired/held reason | UI state check planned |
| Delivery jobs | Delivery Radar | state, age, attention flags | UI state check planned |
| Reorder projection | Reorder Lab | scenario inputs kept visible | example result shown |
| Ledger rewind | Product Story | reconstructed-from-ledger label | live comparison shown |
| Crash recovery | Crash Theater | recorded-run timestamps | playback sequence shown |
| Invariant evidence | Reliability / Proof Pack | NOT_RUN never rendered as success | status card shown |

## Implementation boundary

The supplied blueprint requests a React/FastAPI/PostgreSQL/AWS system with 55 formal scenarios. The initial deliverable here is a functional client prototype built from synthetic fixtures, designed to make the proposed workflow and honest evidence states reviewable before a backend is introduced. Any external or measured outcome is labelled `NOT_RUN`, `SIMULATED`, or `NOT_RECORDED`.
