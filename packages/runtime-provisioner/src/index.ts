import { RuntimeDescriptor, UserId, WorkspaceId } from '../../shared-types/src/index.js';

export interface RuntimeProvisioner {
  ensureRuntime(userId: UserId, workspaceId: WorkspaceId): Promise<RuntimeDescriptor>;
  getRuntimeByUser(userId: UserId): Promise<RuntimeDescriptor | undefined>;
}

export class MockRuntimeProvisioner implements RuntimeProvisioner {
  private runtimes = new Map<UserId, RuntimeDescriptor>();

  async ensureRuntime(userId: UserId, workspaceId: WorkspaceId): Promise<RuntimeDescriptor> {
    const existing = this.runtimes.get(userId);
    if (existing) {
      return existing;
    }

    const now = new Date().toISOString();
    const runtime: RuntimeDescriptor = {
      userId,
      workspaceId,
      runtimeId: `rt_${userId}`,
      baseUrl: `http://internal-openclaw/${userId}`,
      status: 'ready',
      createdAt: now,
      updatedAt: now
    };

    this.runtimes.set(userId, runtime);
    return runtime;
  }

  async getRuntimeByUser(userId: UserId): Promise<RuntimeDescriptor | undefined> {
    return this.runtimes.get(userId);
  }
}
