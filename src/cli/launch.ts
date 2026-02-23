import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadSettings, getProjectRoot } from '../shared/config.js';
import { logger } from '../shared/logger.js';
import { eventBus } from '../shared/event-bus.js';
import { AgentStatus, TaskPriority, TaskStatus, type Agent, type Task } from '../agents/types.js';
import { estimateModelCostUsd } from '../dashboard/utils/cost-estimator.js';

export interface LaunchOptions {
  task: string;
  model?: string;
  dashboard: boolean;
  dashboardStyle?: 'safe' | 'retro';
  verbose: boolean;
  dryRun: boolean;
}

function findGeminiMd(root: string): string | null {
  const candidates = [
    resolve(root, 'GEMINI.md'),
    resolve(root, '.gemini', 'GEMINI.md'),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

function buildGeminiArgs(opts: LaunchOptions, settings: ReturnType<typeof loadSettings>): string[] {
  const args: string[] = [];
  const root = getProjectRoot();

  const geminiMd = findGeminiMd(root);
  if (geminiMd) {
    args.push('-c', `model_instructions_file=${geminiMd}`);
    logger.debug('Injecting GEMINI.md from', geminiMd);
  }

  const model = opts.model ?? settings.defaultModel;
  if (model) {
    args.push('--model', model);
  }

  if (opts.task) {
    args.push(opts.task);
  }

  return args;
}

const LAUNCH_AGENT_ID = 'gemini-cli';
const LAUNCH_TASK_ID = 'launch-main-task';

function createLaunchAgent(model: string): Agent {
  return {
    id: LAUNCH_AGENT_ID,
    type: 'executor' as Agent['type'],
    status: AgentStatus.Running,
    config: {
      type: 'executor' as Agent['type'],
      model,
      description: 'Gemini CLI launch session',
      capabilities: ['cli', 'streaming-output'],
    },
    progress: 0,
  };
}

function createLaunchTask(description: string): Task {
  return {
    id: LAUNCH_TASK_ID,
    description: description || 'Launch Gemini CLI session',
    agentType: 'executor' as Task['agentType'],
    status: TaskStatus.Queued,
    priority: TaskPriority.Normal,
    dependencies: [],
    createdAt: Date.now(),
  };
}

export async function runLaunch(opts: LaunchOptions): Promise<void> {
  const settings = loadSettings();
  const geminiCmd = settings.geminiCliPath;
  const args = buildGeminiArgs(opts, settings);
  const dashboardStyle = opts.dashboardStyle === 'retro' ? 'retro' : settings.dashboardStyle;
  const model = opts.model ?? settings.defaultModel;

  if (opts.dryRun) {
    console.log('Dry run — would execute:');
    console.log(`  ${geminiCmd} ${args.join(' ')}`);
    return;
  }

  logger.info(`Launching: ${geminiCmd} ${args.join(' ')}`);

  if (opts.dashboard) {
    logger.debug('Dashboard mode enabled (will render alongside Gemini CLI)');
  }

  const launchAgent = createLaunchAgent(model);
  const launchTask = createLaunchTask(opts.task);
  launchTask.status = TaskStatus.Assigned;
  launchTask.assignedTo = launchAgent.id;
  launchTask.startedAt = Date.now();
  launchAgent.currentTask = launchTask;
  eventBus.emit('agent:spawn', { agent: launchAgent });
  eventBus.emit('task:queued', { task: launchTask });
  eventBus.emit('task:started', { task: launchTask, agentId: launchAgent.id });
  eventBus.emit('hud:metrics', { phase: 'launching' });

  const child = spawn(geminiCmd, args, {
    stdio: opts.dashboard ? ['pipe', 'pipe', 'pipe'] : 'inherit',
    shell: true,
    cwd: getProjectRoot(),
    env: {
      ...process.env,
      OMG_ACTIVE: '1',
      OMG_DASHBOARD: opts.dashboard ? '1' : '0',
      OMG_DASHBOARD_STYLE: dashboardStyle === 'retro' ? 'retro' : 'safe',
    },
  });

  if (opts.dashboard) {
    let outputChars = 0;
    const estimatedInputTokens = Math.ceil(args.join(' ').length / 4);
    let lastProgress = 0;
    const onHudStdin = ({ data }: { data: string }) => {
      if (!child.stdin || child.stdin.destroyed) return;
      child.stdin.write(data);
    };
    child.stdout?.setEncoding('utf-8');
    child.stderr?.setEncoding('utf-8');
    eventBus.on('hud:stdin', onHudStdin);

    child.stdout?.on('data', (chunk: string) => {
      outputChars += chunk.length;
      eventBus.emit('agent:output', { agentId: launchAgent.id, output: chunk.trimEnd() });
      const estimatedOutputTokens = Math.ceil(outputChars / 4);
      const estimatedTokens = estimatedInputTokens + estimatedOutputTokens;
      const estimatedCost = estimateModelCostUsd({
        model,
        inputTokens: estimatedInputTokens,
        outputTokens: estimatedOutputTokens,
      });
      eventBus.emit('hud:metrics', {
        tokenUsage: estimatedTokens,
        costEstimate: estimatedCost,
        model,
        phase: 'running',
      });
      const progress = Math.min(95, Math.max(5, Math.floor(estimatedTokens / 20)));
      if (progress > lastProgress) {
        lastProgress = progress;
        eventBus.emit('agent:progress', {
          agentId: launchAgent.id,
          progress,
          message: 'Gemini output stream updated',
        });
      }
    });

    child.stderr?.on('data', (chunk: string) => {
      const message = chunk.trim();
      if (!message) return;
      eventBus.emit('system:log', {
        level: 'warn',
        source: 'gemini',
        message,
        timestamp: Date.now(),
      });
    });
    child.on('close', () => {
      eventBus.off('hud:stdin', onHudStdin);
    });
    child.on('error', () => {
      eventBus.off('hud:stdin', onHudStdin);
    });
  }

  return new Promise<void>((resolve, reject) => {
    child.on('close', (code) => {
      const success = code === 0 || code === null;
      const result = {
        taskId: launchTask.id,
        agentId: launchAgent.id,
        success,
        output: success ? 'Gemini CLI session completed.' : '',
        error: success ? undefined : `Gemini CLI exited with code ${code}`,
        duration: Date.now() - (launchTask.startedAt ?? Date.now()),
      };
      if (success) {
        eventBus.emit('agent:progress', { agentId: launchAgent.id, progress: 100, message: 'Gemini run completed' });
        eventBus.emit('agent:complete', { agentId: launchAgent.id, result });
        eventBus.emit('task:done', { task: { ...launchTask, status: TaskStatus.Done, completedAt: Date.now() }, result });
        eventBus.emit('hud:metrics', { phase: 'done' });
      } else {
        eventBus.emit('task:failed', {
          task: { ...launchTask, status: TaskStatus.Failed, completedAt: Date.now() },
          error: result.error ?? 'Unknown Gemini CLI error',
        });
        eventBus.emit('agent:error', { agentId: launchAgent.id, error: result.error ?? 'Unknown Gemini CLI error' });
        eventBus.emit('hud:metrics', { phase: 'failed' });
      }
      if (code === 0 || code === null) {
        resolve();
      } else {
        logger.error(`Gemini CLI exited with code ${code}`);
        process.exitCode = code;
        resolve();
      }
    });

    child.on('error', (err) => {
      eventBus.emit('task:failed', {
        task: { ...launchTask, status: TaskStatus.Failed, completedAt: Date.now() },
        error: err.message,
      });
      eventBus.emit('agent:error', {
        agentId: launchAgent.id,
        error: err.message,
      });
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        console.error(`Error: '${geminiCmd}' not found. Is Gemini CLI installed?`);
        console.error('Run `omg doctor` to check your environment.');
      } else {
        console.error(`Error spawning Gemini CLI: ${err.message}`);
      }
      reject(err);
    });
  });
}
