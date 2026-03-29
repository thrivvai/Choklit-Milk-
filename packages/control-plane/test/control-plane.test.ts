import { describe, expect, it } from 'vitest';
import { ApprovalQueue } from '../../approval-queue/src/index.js';
import { MockOpenClawClient } from '../../openclaw-client/src/index.js';
import { MockRuntimeProvisioner } from '../../runtime-provisioner/src/index.js';
import { TimelineStore } from '../../timeline/src/index.js';
import { ControlPlaneService, UserContext } from '../src/index.js';
import { ActionRequest } from '../../shared-types/src/index.js';

function buildService() {
  const approvals = new ApprovalQueue();
  const timeline = new TimelineStore();
  const provisioner = new MockRuntimeProvisioner();
  const openclaw = new MockOpenClawClient();
  const service = new ControlPlaneService(approvals, timeline, provisioner, openclaw);

  const context: UserContext = {
    userId: 'u_1',
    workspaceId: 'w_1',
    permission: {
      tier: 'draft',
      panicMode: false,
      updatedAt: new Date().toISOString()
    }
  };

  return { service, approvals, timeline, provisioner, openclaw, context };
}

function action(overrides: Partial<ActionRequest>): ActionRequest {
  return {
    id: 'act_1',
    userId: 'u_1',
    workspaceId: 'w_1',
    actionType: 'send_message',
    reason: 'Send follow up',
    riskLevel: 'high',
    payload: {},
    createdAt: new Date().toISOString(),
    ...overrides
  };
}

describe('ControlPlaneService', () => {
  it('enforces approval gating for risky actions', async () => {
    const { service, openclaw, context } = buildService();

    const result = await service.handleAction(context, action({}));

    expect(result.status).toBe('pending_approval');
    expect(result.approvalId).toBeDefined();
    expect(openclaw.calls.length).toBe(0);
  });

  it('panic mode blocks non-read actions', async () => {
    const { service, context } = buildService();
    const panicContext = await service.setPanicMode(context, true);

    const result = await service.handleAction(panicContext, action({ actionType: 'draft_message', riskLevel: 'medium' }));

    expect(result.status).toBe('blocked');
  });

  it('writes timeline events for request and execution', async () => {
    const { service, context } = buildService();

    await service.handleAction(
      context,
      action({
        id: 'act_2',
        actionType: 'draft_message',
        riskLevel: 'medium'
      })
    );

    const events = service.getTimeline(context.userId);
    expect(events.some((event) => event.type === 'action_requested')).toBe(true);
    expect(events.some((event) => event.type === 'action_executed')).toBe(true);
  });

  it('supports permission state transitions', async () => {
    const { service, context } = buildService();

    const next = await service.updatePermission(context, 'ask');
    expect(next.permission.tier).toBe('ask');
  });

  it('routes execution to a dedicated runtime per user', async () => {
    const { service, context, openclaw } = buildService();

    await service.handleAction(
      context,
      action({ id: 'act_3', actionType: 'draft_message', riskLevel: 'low' })
    );

    expect(openclaw.calls[0]?.runtimeId).toBe('rt_u_1');
  });
});
