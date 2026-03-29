# Choklit Milk

Choklit Milk is a founder-safe operating layer for personal AI agents.

It is designed for non-technical founders, careful vibe coders, and solo operators who want the power of agents without dealing with difficult setup, fragile local installs, or unclear safety boundaries. Choklit Milk turns raw agent infrastructure into a calm, approval-first experience with visible actions, readable logs, and beginner-friendly controls.

## Product Summary

Choklit Milk is the user-facing product.

OpenClaw is the hidden backend runtime.

Users interact with Choklit Milk through a hosted web interface and connected surfaces like Telegram. They do **not** install or configure OpenClaw themselves. Choklit Milk provisions and manages a dedicated runtime per user behind the scenes.

## Core Promise

One assistant.

One user.

Clear permissions.

Approval before risky actions.

Visible action cards.

A readable timeline.

A panic switch.

## Who It Is For

Choklit Milk is for:

- Non-technical founders who want a useful AI assistant without infrastructure headaches
- Careful vibe coders who want safety and clarity, not just raw autonomy
- Solo operators who need summaries, drafts, planning help, and structured follow-up

Choklit Milk is **not** designed as a shared multi-user agent workspace in the MVP.

## MVP Scope

The MVP includes:

- Hosted web app
- Telegram connection
- Guided onboarding
- Founder profile and memory setup
- Simple permission states
- Visible action cards
- Approval queue for risky actions
- Activity timeline
- Panic mode
- Starter skills

Starter skills:

- Meeting Brief
- Follow Up Draft
- Voice Note to Priorities

## Product Principles

1. Safety is part of the product, not an afterthought
2. Users should never wonder what the assistant is doing
3. Risky actions always require approval
4. Hosted simplicity beats self-hosted complexity for this audience
5. The system should feel warm, clear, and confidence-building
6. The MVP should be narrow, understandable, and trustworthy

## Safety Model

Choklit Milk uses a simple permission model:

- **Read**: inspect and summarize
- **Draft**: prepare content but do not send or publish
- **Ask**: request missing information or approval
- **Act**: perform a bounded action only after explicit approval

High-risk actions must always route through an approval step.

Examples include:

- sending messages
- publishing content
- deleting data
- connecting new integrations
- changing permissions
- exposing secrets or credentials

Every major action should be written to a human-readable timeline.

Panic Mode drops the system into read-only behavior and pauses actions immediately.

## Architecture

Choklit Milk follows a hosted control-plane pattern.

### High-level design

- **Frontend**: Choklit Milk web app
- **Control Plane API**: authentication, onboarding, policy engine, approvals, timeline, runtime routing
- **Runtime Layer**: one isolated OpenClaw runtime per user or workspace
- **Execution Layer**: sandboxed skills and approved tool execution
- **Storage**: product database plus generated user workspace metadata

### Guiding rule

Users never install OpenClaw.

Choklit Milk provisions and manages the runtime for them.

## Request Flow

1. The user sends a message in Choklit Milk
2. Choklit Milk checks policy and permissions
3. If the request is safe, Choklit Milk routes it to the user's runtime
4. If the request is risky, Choklit Milk creates an approval card
5. After approval, the request is executed
6. The result is returned to the user
7. The event is recorded in the timeline

## Recommended Stack

This is the recommended MVP stack, not a final lock:

- **Frontend**: Next.js + TypeScript
- **API / Control Plane**: Node.js + TypeScript
- **Database**: PostgreSQL or SQLite for early versions
- **Runtime**: OpenClaw per user, provisioned as managed infrastructure
- **Queue / Jobs**: lightweight background worker for provisioning and approvals
- **Deployment**: hosted cloud environment with isolated runtime containers

## Suggested Repository Structure

```text
choklit-milk/
  apps/
    web/
    api/
  packages/
    policy-engine/
    runtime-client/
    approvals/
    timeline/
    skills/
    shared-types/
  infra/
    docker/
    provisioner/
  docs/
  README.md
```

## Screens

The MVP includes the following screens:

1. Welcome
2. Connect Telegram
3. Setup Interview
4. Permission Setup
5. Home Dashboard
6. Action Card Drawer
7. Timeline
8. Skills Shelf
9. Memory Editor
10. Panic Mode
11. Settings

## Build Workflow

Use one GitHub repository as the source of truth.

### Codex
Use Codex to build the actual product:
- repo structure
- core architecture
- policy engine
- approval middleware
- runtime client
- tests
- integration cleanup

### Google AI Studio
Use Google AI Studio as a fast prototype lab:
- onboarding experiments
- action card UI
- permission UX
- microcopy
- screen flow exploration

Export or copy good work back into the main repo.

### Manus
Use Manus for optional polish:
- landing page
- explainer page
- visual shell
- demo surfaces

Export useful pieces into the main repo only if they are worth keeping.

## Development Status

This project is currently in planning / early build mode.

That means:
- architecture is defined
- product direction is clear
- MVP scope is intentionally narrow
- some implementation details may change during sprint execution

## Roadmap

### Phase 1
- hosted onboarding
- Telegram connection
- founder profile generation
- starter skills
- approvals
- timeline
- panic mode

### Phase 2
- richer integrations
- stronger skill packaging
- better analytics
- improved provisioning
- safer browser / file workflows

### Phase 3
- advanced mode for power users
- more channels
- stronger deployment tooling
- broader public-good distribution model

## Positioning

Choklit Milk is not trying to be the most flexible agent framework.

It is trying to be the safest, clearest, most confidence-building way for normal people to use agent systems productively.

## Notes

This README reflects the current product thesis and hosted architecture plan for the MVP. It should evolve as the codebase becomes real and implementation details harden.
