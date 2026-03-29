export type UserId = string;
export type WorkspaceId = string;

export type PermissionTier = 'read' | 'draft' | 'ask' | 'act';
export type PermissionState = {
  tier: PermissionTier;
  panicMode: boolean;
  updatedAt: string;
};

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type ActionType =
  | 'summarize'
  | 'draft_message'
  | 'send_message'
  | 'publish_content'
  | 'delete_data'
  | 'connect_integration'
  | 'change_permissions'
  | 'reveal_secret';

export type ActionRequest = {
  id: string;
  userId: UserId;
  workspaceId: WorkspaceId;
  actionType: ActionType;
  reason: string;
  riskLevel: RiskLevel;
  payload: Record<string, unknown>;
  createdAt: string;
};

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export type ApprovalItem = {
  id: string;
  actionRequestId: string;
  userId: UserId;
  status: ApprovalStatus;
  decisionNote?: string;
  createdAt: string;
  decidedAt?: string;
};

export type TimelineEventType =
  | 'message_received'
  | 'action_requested'
  | 'approval_requested'
  | 'approval_decided'
  | 'action_executed'
  | 'action_blocked'
  | 'permission_changed'
  | 'panic_mode_toggled'
  | 'runtime_provisioned';

export type TimelineEvent = {
  id: string;
  userId: UserId;
  workspaceId: WorkspaceId;
  type: TimelineEventType;
  actor: 'user' | 'assistant' | 'system';
  summary: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type RuntimeDescriptor = {
  userId: UserId;
  workspaceId: WorkspaceId;
  runtimeId: string;
  baseUrl: string;
  status: 'provisioning' | 'ready' | 'suspended';
  createdAt: string;
  updatedAt: string;
};

export type OpenClawExecuteRequest = {
  runtimeId: string;
  userId: UserId;
  action: ActionRequest;
};

export type OpenClawExecuteResponse = {
  requestId: string;
  status: 'accepted' | 'completed' | 'failed';
  output?: string;
};

export type SkillManifest = {
  id: string;
  name: string;
  description: string;
  allowedActions: ActionType[];
  requiredTier: PermissionTier;
  defaultRisk: RiskLevel;
};
