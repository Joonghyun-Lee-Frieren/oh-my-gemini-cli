import { createLogger } from '../shared/logger.js';
import { modelRegistry } from './model-registry.js';
import type { SubTask, TaskPlan } from './planner.js';

const log = createLogger('orchestrator:executor');

export interface TaskResult {
  subtaskId: string;
  planId: string;
  model: string;
  status: 'success' | 'failure' | 'partial';
  output: string;
  filesChanged: string[];
  duration: number;
  tokenUsage?: {
    input: number;
    output: number;
    cached: number;
  };
}

export interface ExecutorOptions {
  preferredModel?: string;
  timeout?: number;
  dryRun?: boolean;
}

export class Executor {
  private model: string;
  private timeout: number;
  private dryRun: boolean;

  constructor(options?: ExecutorOptions) {
    this.model = options?.preferredModel ?? 'gemini-3.1-flash';
    this.timeout = options?.timeout ?? 120_000;
    this.dryRun = options?.dryRun ?? false;

    const modelDef = modelRegistry.getModel(this.model);
    if (!modelDef) {
      log.warn(`Model ${this.model} not found in registry, using default`);
    }
  }

  async execute(plan: TaskPlan, subtask: SubTask, handoffMessage: string): Promise<TaskResult> {
    const startTime = Date.now();
    log.info(`Executing subtask ${subtask.id} with ${this.model}: ${subtask.description}`);

    if (this.dryRun) {
      return this.buildResult(plan.id, subtask.id, 'success', '[dry-run] No changes made', [], startTime);
    }

    try {
      const result = await this.runWithTimeout(plan, subtask, handoffMessage);
      log.info(`Subtask ${subtask.id} completed: ${result.status}`);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log.error(`Subtask ${subtask.id} failed: ${message}`);
      return this.buildResult(plan.id, subtask.id, 'failure', message, [], startTime);
    }
  }

  async executeBatch(
    plan: TaskPlan,
    subtasks: SubTask[],
    handoffMessages: Map<string, string>,
  ): Promise<TaskResult[]> {
    const results: TaskResult[] = [];

    const ready = subtasks.filter((st) =>
      st.dependencies.every((dep) => results.some((r) => r.subtaskId === dep && r.status === 'success')),
    );

    if (ready.length === 0 && results.length < subtasks.length) {
      for (const st of subtasks) {
        if (!results.some((r) => r.subtaskId === st.id)) {
          const handoff = handoffMessages.get(st.id) ?? '';
          const result = await this.execute(plan, st, handoff);
          results.push(result);
        }
      }
    } else {
      const parallel = ready.map((st) => {
        const handoff = handoffMessages.get(st.id) ?? '';
        return this.execute(plan, st, handoff);
      });
      const batchResults = await Promise.allSettled(parallel);

      for (const [i, settled] of batchResults.entries()) {
        if (settled.status === 'fulfilled') {
          results.push(settled.value);
        } else {
          results.push(
            this.buildResult(plan.id, ready[i].id, 'failure', settled.reason?.message ?? 'Unknown error', [], Date.now()),
          );
        }
      }
    }

    return results;
  }

  private async runWithTimeout(
    plan: TaskPlan,
    subtask: SubTask,
    handoffMessage: string,
  ): Promise<TaskResult> {
    const startTime = Date.now();

    return new Promise<TaskResult>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Subtask ${subtask.id} timed out after ${this.timeout}ms`));
      }, this.timeout);

      this.simulateExecution(plan, subtask, handoffMessage, startTime)
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  private async simulateExecution(
    plan: TaskPlan,
    subtask: SubTask,
    _handoffMessage: string,
    startTime: number,
  ): Promise<TaskResult> {
    const filesChanged = subtask.files.length > 0 ? subtask.files : [];

    return this.buildResult(
      plan.id,
      subtask.id,
      'success',
      `Executed: ${subtask.description}`,
      filesChanged,
      startTime,
    );
  }

  private buildResult(
    planId: string,
    subtaskId: string,
    status: TaskResult['status'],
    output: string,
    filesChanged: string[],
    startTime: number,
  ): TaskResult {
    return {
      subtaskId,
      planId,
      model: this.model,
      status,
      output,
      filesChanged,
      duration: Date.now() - startTime,
    };
  }
}

export function createExecutor(options?: ExecutorOptions): Executor {
  return new Executor(options);
}
