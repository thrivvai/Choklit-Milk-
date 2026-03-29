import { TimelineEvent } from '../../shared-types/src/index.js';

export class TimelineStore {
  private events: TimelineEvent[] = [];

  append(event: TimelineEvent): TimelineEvent {
    this.events.push(event);
    return event;
  }

  listForUser(userId: string): TimelineEvent[] {
    return this.events
      .filter((event) => event.userId === userId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
}
