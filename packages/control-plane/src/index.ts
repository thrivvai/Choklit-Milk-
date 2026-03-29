import { ApprovalQueue } from '../../approval-queue/src/index.js';
import { MockOpenClawClient, OpenClawClient } from '../../openclaw-client/src/index.js';
import { evaluatePolicy, nextPermissionState, togglePanicMode } from '../../policy-engine/src/index.js';
import { MockRuntimeProvisioner, RuntimeProvisioner } from '../../runtime-provisioner/src/index.js';
import { TimelineStore } from '../../timeline/src/index.js';
import { ActionRequest, ApprovalItem, PermissionState, UserId } from '../../shared-types/src/index.js';

export type UserContext = {
  userId: string;
  workspaceId: string;
  permission: PermissionState;
};

export class ControlPlaneService {
  constructor(
    private readonly approvals: ApprovalQueue,
    private readonly timeline: TimelineStore,
    private readonly provisioner: RuntimeProvisioner,
    private readonly openclawClient: OpenClawClient
  ) {}

  static createDefault(): ControlPlaneService {
    return new ControlPlaneService(
      new ApprovalQueue(),
      new TimelineStore(),
      new MockRuntimeProvisioner(),
      new MockOpenClawClient()
    );
  }

  async handleAction(context: UserContext, action: ActionRequest): Promise<{ status: string; approvalId?: string }> {
    const decision = evaluatePolicy(action, context.permission);

    this.timeline.append({
      id: `evt_${action.id}_requested`,
      userId: context.userId,
      workspaceId: context.workspaceId,
      type: 'action_requested',
      actor: 'user',
      summary: `${action.actionType} requested`,
      metadata: { reason: action.reason, risk: action.riskLevel },
      createdAt: new Date().toISOString()
    });

    if (!decision.allowed) {
      this.timeline.append({
        id: `evt_${action.id}_blocked`,
        userId: context.userId,
        workspaceId: context.workspaceId,
        type: 'action_blocked',
        actor: 'system',
        summary: decision.reason,
        createdAt: new Date().toISOString()
      });

      return { status: 'blocked' };
    }

    if (decision.requiresApproval) {
      const approval: ApprovalItem = {
        id: `apr_${action.id}`,
        actionRequestId: action.id,
        userId: context.userId,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      this.approvals.create(approval);
      this.timeline.append({
        id: `evt_${action.id}_approval`,
        userId: context.userId,
        workspaceId: context.workspaceId,
        type: 'approval_requested',
        actor: 'system',
        summary: `Approval requested for ${action.actionType}`,
        metadata: { approvalId: approval.id },
        createdAt: new Date().toISOString()
      });

      return { status: 'pending_approval', approvalId: approval.id };
    }

    await this.executeAction(context, action);
    return { status: 'executed' };
  }

  async approveAndExecute(context: UserContext, approvalId: string, action: ActionRequest): Promise<void> {
    const approval = this.approvals.decide(approvalId, 'approved', new Date().toISOString());

    this.timeline.append({
      id: `evt_${approvalId}_approved`,
      userId: context.userId,
      workspaceId: context.workspaceId,
      type: 'approval_decided',
      actor: 'user',
      summary: `Approval granted for ${approval.actionRequestId}`,
      metadata: { approvalId },
      createdAt: new Date().toISOString()
    });

    await this.executeAction(context, action);
  }

  async updatePermission(context: UserContext, nextTier: PermissionState['tier']): Promise<UserContext> {
    const now = new Date().toISOString();
    const permission = nextPermissionState(context.permission, nextTier, now);

    this.timeline.append({
      id: `evt_perm_${context.userId}_${Date.now()}`,
      userId: context.userId,
      workspaceId: context.workspaceId,
      type: 'permission_changed',
      actor: 'user',
      summary: `Permission tier updated to ${nextTier}`,
      metadata: { tier: nextTier },
      createdAt: now
    });

    return { ...context, permission };
  }

  async setPanicMode(context: UserContext, enabled: boolean): Promise<UserContext> {
    const now = new Date().toISOString();
    const permission = togglePanicMode(context.permission, enabled, now);

    this.timeline.append({
      id: `evt_panic_${context.userId}_${Date.now()}`,
      userId: context.userId,
      workspaceId: context.workspaceId,
      type: 'panic_mode_toggled',
      actor: 'user',
      summary: `Panic mode ${enabled ? 'enabled' : 'disabled'}`,
      metadata: { enabled },
      createdAt: now
    });

    return { ...context, permission };
  }

  getTimeline(userId: UserId) {
    return this.timeline.listForUser(userId);
  }

  private async executeAction(context: UserContext, action: ActionRequest): Promise<void> {
    const runtime = await this.provisioner.ensureRuntime(context.userId, context.workspaceId);

    await this.openclawClient.executeAction({
      runtimeId: runtime.runtimeId,
      userId: context.userId,
      action
    });

    this.timeline.append({
      id: `evt_${action.id}_executed`,
      userId: context.userId,
      workspaceId: context.workspaceId,
      type: 'action_executed',
      actor: 'assistant',
      summary: `${action.actionType} executed via runtime ${runtime.runtimeId}`,
      createdAt: new Date().toISOString()
    });
  }
}
