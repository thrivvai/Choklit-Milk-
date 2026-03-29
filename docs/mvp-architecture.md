# Choklit Milk MVP Architecture

## 1) Proposed folder structure

```txt
apps/
  web/                  # Next.js cockpit with all MVP surfaces
  api/                  # Hosted control plane entrypoint
packages/
  shared-types/         # Core TypeScript domain model
  policy-engine/        # Permission + risk + panic logic
  approval-queue/       # Deterministic human approval queue
  timeline/             # Human-readable event log module
  runtime-provisioner/  # Per-user OpenClaw runtime routing/provisioning
  openclaw-client/      # Internal OpenClaw API client abstraction
  control-plane/        # Orchestration between policy, approvals, runtime, timeline
  skills-registry/      # Curated starter skills
docs/
  mvp-architecture.md
```

## 2) Core TypeScript types

Located in `packages/shared-types/src/index.ts`.

Highlights:
- `PermissionTier`: `read | draft | ask | act`
- `PermissionState`: `{ tier, panicMode, updatedAt }`
- `ActionRequest`: normalized action card payload with risk and reason
- `ApprovalItem`: pending/approved/rejected lifecycle
- `TimelineEvent`: normalized timeline entry for all significant events
- `RuntimeDescriptor`: per-user hidden OpenClaw runtime metadata
- `SkillManifest`: explicit schema for starter skills and allowed actions

## 3) Event model

All notable actions are captured as immutable timeline events:
- `message_received`
- `action_requested`
- `approval_requested`
- `approval_decided`
- `action_executed`
- `action_blocked`
- `permission_changed`
- `panic_mode_toggled`
- `runtime_provisioned`

This supports reviewability, replayability, and incident auditing.

## 4) Permission model

User-facing tiers:
- **Read**: inspect/summarize
- **Draft**: generate drafts but do not send
- **Ask**: collect missing info and ask approvals
- **Act**: execute bounded actions after policy checks

Panic mode forces the assistant into read-only behavior.

## 5) Approval middleware design

Approval middleware lives in the control-plane orchestration layer:
1. Evaluate action against `policy-engine`.
2. If blocked, write `action_blocked` timeline event.
3. If requires approval, create `ApprovalItem` and write `approval_requested`.
4. Only after explicit approval, execute action through runtime client.

Deterministic approval list includes send/publish/delete/connect/change-permissions/reveal-secret.

## 6) Per-user runtime routing design

`runtime-provisioner` enforces 1 runtime per user/workspace trust boundary:
- `ensureRuntime(userId, workspaceId)` provisions or returns existing descriptor.
- Control plane never executes without a resolved runtime.
- Runtime IDs are stable per user (mocked as `rt_<userId>` in MVP scaffold).

No shared multi-user runtime is exposed in MVP.

## 7) OpenClaw client interface

`openclaw-client` provides a strict internal interface:

```ts
interface OpenClawClient {
  executeAction(request: OpenClawExecuteRequest): Promise<OpenClawExecuteResponse>
}
```

The app talks only to Choklit APIs. Choklit talks internally to OpenClaw runtime URLs.
