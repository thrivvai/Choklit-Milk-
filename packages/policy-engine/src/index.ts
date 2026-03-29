import { ActionRequest, PermissionState, PermissionTier, RiskLevel } from '../../shared-types/src/index.js';

const tierRank: Record<PermissionTier, number> = {
  read: 1,
  draft: 2,
  ask: 3,
  act: 4
};

const actionTierRequirement: Record<ActionRequest['actionType'], PermissionTier> = {
  summarize: 'read',
  draft_message: 'draft',
  send_message: 'act',
  publish_content: 'act',
  delete_data: 'act',
  connect_integration: 'ask',
  change_permissions: 'ask',
  reveal_secret: 'act'
};

const alwaysApproval: Set<ActionRequest['actionType']> = new Set([
  'send_message',
  'publish_content',
  'delete_data',
  'connect_integration',
  'change_permissions',
  'reveal_secret'
]);

export type PolicyDecision = {
  allowed: boolean;
  reason: string;
  requiresApproval: boolean;
};

export function evaluatePolicy(action: ActionRequest, permission: PermissionState): PolicyDecision {
  if (permission.panicMode) {
    if (action.actionType !== 'summarize') {
      return {
        allowed: false,
        reason: 'Panic mode allows read-only actions.',
        requiresApproval: false
      };
    }
  }

  const needed = actionTierRequirement[action.actionType];
  if (tierRank[permission.tier] < tierRank[needed]) {
    return {
      allowed: false,
      reason: `Permission tier ${permission.tier} does not satisfy required tier ${needed}.`,
      requiresApproval: false
    };
  }

  const requiresApproval = alwaysApproval.has(action.actionType) || action.riskLevel === 'critical';

  return {
    allowed: true,
    reason: requiresApproval
      ? 'Action allowed but requires deterministic human approval.'
      : 'Action allowed and can execute directly.',
    requiresApproval
  };
}

export function nextPermissionState(
  current: PermissionState,
  nextTier: PermissionTier,
  now: string
): PermissionState {
  if (current.panicMode && nextTier === 'act') {
    throw new Error('Cannot enter act tier while panic mode is enabled.');
  }

  return {
    ...current,
    tier: nextTier,
    updatedAt: now
  };
}

export function togglePanicMode(current: PermissionState, panicEnabled: boolean, now: string): PermissionState {
  return {
    ...current,
    panicMode: panicEnabled,
    tier: panicEnabled && current.tier === 'act' ? 'read' : current.tier,
    updatedAt: now
  };
}

export function inferRiskFromAction(actionType: ActionRequest['actionType']): RiskLevel {
  if (alwaysApproval.has(actionType)) {
    return 'high';
  }

  return actionType === 'draft_message' ? 'medium' : 'low';
}
