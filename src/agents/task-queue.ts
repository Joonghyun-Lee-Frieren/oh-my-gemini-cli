import type { Task } from './types.js';
import { TaskStatus, TaskPriority } from './types.js';
import { eventBus } from '../shared/event-bus.js';

export class TaskQueue {
  private queue: Task[] = [];
  private taskMap = new Map<string, Task>();

  get size(): number {
    return this.queue.length;
  }

  get isEmpty(): boolean {
    return this.queue.length === 0;
  }

  enqueue(task: Task): void {
    task.status = TaskStatus.Queued;
    this.taskMap.set(task.id, task);
    this.insertByPriority(task);
    eventBus.emit('task:queued', { task });
  }

  dequeue(): Task | undefined {
    const task = this.queue.shift();
    if (task) {
      this.taskMap.delete(task.id);
    }
    return task;
  }

  peek(): Task | undefined {
    return this.queue[0];
  }

  getById(id: string): Task | undefined {
    return this.taskMap.get(id);
  }

  getByStatus(status: TaskStatus): Task[] {
    return this.queue.filter((t) => t.status === status);
  }

  remove(id: string): boolean {
    const idx = this.queue.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    this.queue.splice(idx, 1);
    this.taskMap.delete(id);
    return true;
  }

  clear(): void {
    this.queue = [];
    this.taskMap.clear();
  }

  private insertByPriority(task: Task): void {
    // Lower enum value = higher priority (Critical=0, Low=3)
    const insertIdx = this.queue.findIndex((t) => t.priority > task.priority);
    if (insertIdx === -1) {
      this.queue.push(task);
    } else {
      this.queue.splice(insertIdx, 0, task);
    }
  }
}
