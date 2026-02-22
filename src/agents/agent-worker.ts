import { spawn, type ChildProcess } from 'node:child_process';
import { AgentStatus, TaskStatus, type Agent, type Task, type TaskResult } from './types.js';
import { getAgentConfig } from './agent-registry.js';
import { eventBus } from '../shared/event-bus.js';
import { loadConfig } from '../shared/config.js';
import { createLogger } from '../shared/logger.js';
import type { AgentType } from './types.js';

let workerCounter = 0;

export class AgentWorker {
  readonly agent: Agent;
  private process: ChildProcess | null = null;
  private logger;

  constructor(type: AgentType) {
    workerCounter++;
    const config = getAgentConfig(type);
    this.agent = {
      id: `agent-${type}-${workerCounter}`,
      type,
      status: AgentStatus.Idle,
      config,
      progress: 0,
    };
    this.logger = createLogger(this.agent.id);
  }

  get id(): string {
    return this.agent.id;
  }

  get status(): AgentStatus {
    return this.agent.status;
  }

  get isAvailable(): boolean {
    return this.agent.status === AgentStatus.Idle;
  }

  start(): void {
    this.agent.status = AgentStatus.Idle;
    this.agent.startedAt = Date.now();
    this.logger.info('Worker ready');
    eventBus.emit('agent:spawn', { agent: this.agent });
  }

  async run(task: Task): Promise<TaskResult> {
    this.agent.status = AgentStatus.Running;
    this.agent.currentTask = task;
    this.agent.progress = 0;
    task.status = TaskStatus.InProgress;
    task.startedAt = Date.now();

    this.logger.info(`Running task: ${task.description}`);
    eventBus.emit('task:started', { task, agentId: this.agent.id });

    const startTime = Date.now();

    try {
      const output = await this.executeGeminiCli(task);
      const duration = Date.now() - startTime;

      const result: TaskResult = {
        taskId: task.id,
        agentId: this.agent.id,
        success: true,
        output,
        duration,
      };

      task.status = TaskStatus.Done;
      task.completedAt = Date.now();
      task.result = result;
      this.agent.status = AgentStatus.Completed;
      this.agent.currentTask = undefined;
      this.agent.progress = 100;

      this.logger.info(`Task completed in ${duration}ms`);
      eventBus.emit('agent:complete', { agentId: this.agent.id, result });
      eventBus.emit('task:done', { task, result });

      this.agent.status = AgentStatus.Idle;
      return result;
    } catch (err) {
      const duration = Date.now() - startTime;
      const errorMsg = err instanceof Error ? err.message : String(err);

      const result: TaskResult = {
        taskId: task.id,
        agentId: this.agent.id,
        success: false,
        output: '',
        error: errorMsg,
        duration,
      };

      task.status = TaskStatus.Failed;
      task.completedAt = Date.now();
      task.result = result;
      this.agent.status = AgentStatus.Failed;
      this.agent.currentTask = undefined;

      this.logger.error(`Task failed: ${errorMsg}`);
      eventBus.emit('agent:error', { agentId: this.agent.id, error: errorMsg });

      this.agent.status = AgentStatus.Idle;
      return result;
    }
  }

  stop(): void {
    if (this.process) {
      this.process.kill('SIGTERM');
      this.process = null;
    }
    this.agent.status = AgentStatus.Idle;
    this.agent.currentTask = undefined;
    this.logger.info('Worker stopped');
  }

  private executeGeminiCli(task: Task): Promise<string> {
    return new Promise((resolve, reject) => {
      const config = loadConfig();
      const model = this.agent.config.model;

      const args = [
        '--model', model,
        '--prompt', task.description,
      ];

      this.process = spawn(config.gemini_cli_path, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
      });

      let stdout = '';
      let stderr = '';

      this.process.stdout?.on('data', (chunk: Buffer) => {
        const text = chunk.toString();
        stdout += text;
        eventBus.emit('agent:output', { agentId: this.agent.id, output: text });
        this.updateProgress(stdout);
      });

      this.process.stderr?.on('data', (chunk: Buffer) => {
        stderr += chunk.toString();
      });

      this.process.on('close', (code) => {
        this.process = null;
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`Gemini CLI exited with code ${code}: ${stderr || 'unknown error'}`));
        }
      });

      this.process.on('error', (err) => {
        this.process = null;
        reject(err);
      });
    });
  }

  private updateProgress(output: string): void {
    const lines = output.split('\n').length;
    const progress = Math.min(95, lines * 5);
    if (progress !== this.agent.progress) {
      this.agent.progress = progress;
      eventBus.emit('agent:progress', {
        agentId: this.agent.id,
        progress,
      });
    }
  }
}
