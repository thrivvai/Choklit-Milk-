# Choklit Milk MVP Scaffold

Choklit Milk is a founder-safe hosted operating layer for personal agents.
OpenClaw is treated as hidden runtime infrastructure; users never touch it directly.

## Monorepo structure

```txt
apps/
  web/                  # Next.js web app surfaces
  api/                  # lightweight control plane API entrypoint
packages/
  shared-types/         # shared domain model
  policy-engine/        # permission model + panic mode + risk evaluation
  approval-queue/       # deterministic human approval queue
  timeline/             # timeline/event log persistence abstraction
  runtime-provisioner/  # per-user runtime provisioning/routing abstraction
  openclaw-client/      # internal OpenClaw client abstraction
  control-plane/        # orchestration + approval middleware
  skills-registry/      # curated starter skills
docs/
  mvp-architecture.md
```

## MVP surfaces included in `apps/web`

- Welcome
- Connect Telegram
- Setup Interview
- Permission Setup
- Home Dashboard
- Action Card Drawer
- Timeline
- Skills Shelf
- Memory Editor
- Panic Mode
- Settings

## Local setup

```bash
npm install
npm test
npm run dev:web
```

Optional API dev server:

```bash
npm --workspace @choklit/api run dev
```

## Hosted architecture notes

- Frontend only calls Choklit control plane APIs.
- Control plane enforces policy + approvals before any risky action.
- Control plane routes to a dedicated per-user OpenClaw runtime.
- Runtime provisioning is mocked for MVP with stable runtime IDs.
- Timeline and approvals are intentionally first-class product modules.

## Deployment assumptions

- Web app deployed as a Next.js service.
- Control plane deployed as a stateless API service.
- Product metadata stored in managed DB (SQLite/Postgres in early stage).
- Per-user OpenClaw runtimes provisioned in isolated containers/VMs.
- Internal-only network path from control plane to runtime base URLs.
- Secrets managed server-side only; no model keys in client.

## Test coverage included

- approval gating
- panic mode enforcement
- timeline write events
- permission transitions
- runtime routing by user
