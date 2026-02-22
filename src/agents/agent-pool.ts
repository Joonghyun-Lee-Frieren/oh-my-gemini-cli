import { AgentStatus, TaskStatus, type Task, type TaskResult, type AgentType } from './types.js';
import { AgentWorker } from './agent-worker.js';
import { TaskQueue } from './task-queue.js';
import { loadConfig } from '../shared/config.js';
import { createLogger } from '../shared/logger.js';
import { eventBus } from '../shared/event-bus.js';

const logger = createLogger('AgentPool');

export class AgentPool {
  private workers: AgentWorker[] = [];
  private queue = new TaskQueue();
  private maxConcurrent: number;
  private running = false;

  constructor(maxConcurrent?: number) {
    const config = loadConfig();
    this.maxConcurrent = maxConcurrent ?? config.max_concurrent;
  }

  get activeCount(): number {
    return this.workers.filter((w) => w.status === AgentStatus.Running).length;
  }

  get pendingCount(): number {
    return this.queue.size;
  }

  getActiveAgents(): AgentWorker[] {
    return this.workers.filter((w) => w.status === AgentStatus.Running);
  }

  getAllWorkers(): AgentWorker[] {
    return [...this.workers];
  }

  async submitTask(task: Task): Promise<TaskResult> {
    this.running = true;

    const available = this.findAvailableWorker(task.agentType);

    if (available) {
      return this.assignToWorker(available, task);
    }

    if (this.workers.length < this.maxConcurrent) {
      const worker = this.spawnWorker(task.agentType);
      return this.assignToWorker(worker, task);
    }

    logger.info(`All agents busy, queuing task: ${task.description}`);
    return this.enqueueAndWait(task);
  }

  async shutdown(): Promise<void> {
    logger.info('Shutting down agent pool...');
    this.running = false;

    for (const worker of this.workers) {
      worker.stop();
    }

    this.queue.clear();
    this.workers = [];
    logger.info('Agent pool shut down');
  }

  private spawnWorker(type: AgentType): AgentWorker {
    const worker = new AgentWorker(type);
    worker.start();
    this.workers.push(worker);
    logger.info(`Spawned worker ${worker.id} (${this.workers.length}/${this.maxConcurrent})`);
    return worker;
  }

  private findAvailableWorker(type: AgentType): AgentWorker | undefined {
    return this.workers.find(
      (w) => w.isAvailable && w.agent.type === type,
    ) ?? this.workers.find((w) => w.isAvailable);
  }

  private async assignToWorker(worker: AgentWorker, task: Task): Promise<TaskResult> {
    task.status = TaskStatus.Assigned;
    task.assignedTo = worker.id;

    const result = await worker.run(task);
    this.processNextInQueue();
    return result;
  }

  private enqueueAndWait(task: Task): Promise<TaskResult> {
    return new Promise<TaskResult>((resolve) => {
      this.queue.enqueue(task);

      const onDone = (payload: { task: Task; result: TaskResult }) => {
        if (payload.task.id === task.id) {
          eventBus.off('task:done', onDone);
          resolve(payload.result);
        }
      };
      eventBus.on('task:done', onDone);
    });
  }

  private processNextInQueue(): void {
    if (!this.running || this.queue.isEmpty) return;

    const next = this.queue.peek();
    if (!next) return;

    const worker = this.findAvailableWorker(next.agentType);
    if (!worker && this.workers.length >= this.maxConcurrent) return;

    const dequeuedTask = this.queue.dequeue();
    if (!dequeuedTask) return;

    const assignedWorker = worker ?? this.spawnWorker(dequeuedTask.agentType);
    this.assignToWorker(assignedWorker, dequeuedTask);
  }
}
