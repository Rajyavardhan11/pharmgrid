# PharmGrid demonstrator

A polished, synthetic-data operations-console prototype for the PharmGrid pharmacy safety specification.

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (normally `http://localhost:5173`). Build a production bundle with `npm run build`.

For the complete local demonstrator (static interface plus a small checkout API), run:

```bash
npm run build
npm start
```

Open `http://127.0.0.1:4173`. The local service exposes `/api/health` and an idempotent `POST /api/v1/checkout` endpoint. Its JSON store is explicitly a development demonstrator, not the requested PostgreSQL source of truth.

## Included prototype flows

- Today dashboard with stock, expiry, and action prioritisation
- Keyboard-oriented billing surface with a visible idempotency-key contract and a simulated checkout acknowledgement
- Alert journey with explicit `NOT_YET` status
- Ledger-backed product story / rewind treatment
- What-if reorder lab showing the blueprint example: 5 surviving packs and a suggestion of 55
- Delivery Radar which distinguishes provider acceptance from delivery confirmation
- Reliability centre, Crash Theater, and Proof Pack states that accurately remain `NOT_RUN` / `NOT_RECORDED`

## Important boundary

This is an early local foundation using synthetic fixtures. It includes an executable JSON-backed checkout/idempotency demonstration, but deliberately does **not** claim a FastAPI/PostgreSQL transaction service, a persisted browser queue, actual email, AWS infrastructure, or measured evidence. The specification's production portions remain to be built behind these screens.

See [traceability](docs/traceability.md) for the implemented-to-requested mapping.

## Production foundation

The repository now also contains a real-world service foundation under `backend/`, plus `docker-compose.yml`, HAProxy configuration, role-based authentication, PostgreSQL transaction models, a notification worker, and production smoke tests. Review [production readiness](docs/production-readiness.md) before attempting a deployment. Do not put real pharmacy, patient, or customer data into this project until the listed security, testing, privacy, AWS and restore-verification gates have passed.
