import { ApprovalItem } from '../../shared-types/src/index.js';

export class ApprovalQueue {
  private approvals = new Map<string, ApprovalItem>();

  create(item: ApprovalItem): ApprovalItem {
    this.approvals.set(item.id, item);
    return item;
  }

  get(id: string): ApprovalItem | undefined {
    return this.approvals.get(id);
  }

  listByUser(userId: string): ApprovalItem[] {
    return [...this.approvals.values()].filter((a) => a.userId === userId);
  }

  decide(id: string, status: 'approved' | 'rejected', decidedAt: string, note?: string): ApprovalItem {
    const current = this.approvals.get(id);
    if (!current) {
      throw new Error(`Approval ${id} not found`);
    }

    if (current.status !== 'pending') {
      throw new Error(`Approval ${id} already decided`);
    }

    const decided: ApprovalItem = {
      ...current,
      status,
      decidedAt,
      decisionNote: note
    };

    this.approvals.set(id, decided);
    return decided;
  }
}
