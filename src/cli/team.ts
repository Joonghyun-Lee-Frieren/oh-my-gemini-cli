import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { eventBus } from '../shared/event-bus.js';
import { loadSettings, getProjectRoot, STATE_DIR, ensureDir } from '../shared/config.js';
import { logger } from '../shared/logger.js';
import { cacheManager } from '../context/cache-manager.js';
import type { Agent, AgentType, Task } from '../agents/types.js';
import { AgentStatus, TaskStatus, TaskPriority } from '../agents/types.js';

export interface TeamOptions {
  subcommand: 'start' | 'status' | 'shutdown';
  task?: string;
  workers?: number;
  model?: string;
  dashboard?: boolean;
  statusView?: 'all' | 'agents' | 'tasks' | 'cache' | 'context' | 'cache-history';
  json?: boolean;
}

interface AgentPoolState {
  agents: Agent[];
  tasks: Task[];
  startedAt: number;
}

const STATE_FILE = 'team-state.json';

function getStatePath(): string {
  return resolve(getProjectRoot(), STATE_DIR, STATE_FILE);
}

function loadTeamState(): AgentPoolState | null {
  const path = getStatePath();
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return null;
  }
}

function saveTeamState(state: AgentPoolState): void {
  const dir = resolve(getProjectRoot(), STATE_DIR);
  ensureDir(dir);
  writeFileSync(getStatePath(), JSON.stringify(state, null, 2) + '\n', 'utf-8');
}

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function createAgent(type: AgentType, model: string): Agent {
  return {
    id: generateId(),
    type,
    status: AgentStatus.Idle,
    config: {
      type,
      model,
      description: `${type} agent`,
      capabilities: [],
    },
    progress: 0,
  };
}

function createTask(description: string, agentType: AgentType): Task {
  return {
    id: generateId(),
    description,
    agentType,
    status: TaskStatus.Queued,
    priority: TaskPriority.Normal,
    dependencies: [],
    createdAt: Date.now(),
  };
}

async function startTeam(opts: TeamOptions): Promise<void> {
  const settings = loadSettings();
  const model = opts.model ?? settings.defaultModel;
  const workerCount = opts.workers ?? settings.maxWorkers;

  if (!opts.task) {
    console.error('Error: task description is required for team start');
    process.exitCode = 1;
    return;
  }

  console.log(`\nStarting multi-agent team`);
  console.log(`  Model: ${model}`);
  console.log(`  Workers: ${workerCount}`);
  console.log(`  Task: ${opts.task}\n`);

  const agents: Agent[] = [];
  const agentTypes: AgentType[] = ['architect' as AgentType, 'planner' as AgentType, 'executor' as AgentType];

  for (let i = 0; i < Math.min(workerCount, agentTypes.length); i++) {
    const agent = createAgent(agentTypes[i], model);
    agents.push(agent);
    eventBus.emit('agent:spawn', { agent });
    logger.info(`Spawned ${agent.type} agent: ${agent.id}`);
  }

  const task = createTask(opts.task, 'architect' as AgentType);
  task.status = TaskStatus.Assigned;
  task.assignedTo = agents[0]?.id;
  task.startedAt = Date.now();

  eventBus.emit('task:queued', { task });
  eventBus.emit('task:started', { task, agentId: agents[0].id });

  if (agents[0]) {
    agents[0].status = AgentStatus.Assigned;
    agents[0].currentTask = task;
  }

  const state: AgentPoolState = {
    agents,
    tasks: [task],
    startedAt: Date.now(),
  };
  saveTeamState(state);

  if (opts.dashboard) {
    console.log('Dashboard: enabled (connect via `omg status`)\n');
  }

  console.log('Team is running. Use `omg team status` to check progress.');
  console.log('Use `omg team shutdown` to stop all agents.\n');
}

interface StatusPayload {
  agents: Agent[];
  tasks: Task[];
  summary: {
    agents: { active: number; total: number };
    tasks: { total: number; done: number; running: number; queued: number; failed: number };
  };
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
    targetHitRate: number;
    summary: string;
  };
  cacheHistory: Array<{ timestamp: number; hitRate: number; hits: number; misses: number }>;
  context: {
    tokenLimit: number;
    tokenUsage: number;
    usageRate: number;
    compactionThreshold: number;
    promptsCacheEnabled: boolean;
  };
  uptimeSeconds: number;
}

function buildStatusPayload(state: AgentPoolState | null): StatusPayload {
  const settings = loadSettings();
  const cacheStats = cacheManager.getStats();
  const hitRate = Number(cacheManager.getHitRate().toFixed(2));
  const now = Date.now();

  const tasks = state?.tasks ?? [];
  const agents = state?.agents ?? [];
  const doneCount = tasks.filter((t) => t.status === TaskStatus.Done).length;
  const runningCount = tasks.filter(
    (t) => t.status === TaskStatus.InProgress || t.status === TaskStatus.Assigned,
  ).length;
  const queuedCount = tasks.filter((t) => t.status === TaskStatus.Queued).length;
  const failedCount = tasks.filter((t) => t.status === TaskStatus.Failed).length;
  const activeAgents = agents.filter((a) => a.status === AgentStatus.Running || a.status === AgentStatus.Assigned).length;
  const tokenUsage = Math.max(0, doneCount * 2200 + runningCount * 900 + queuedCount * 250);

  return {
    agents,
    tasks,
    summary: {
      agents: { active: activeAgents, total: agents.length },
      tasks: {
        total: tasks.length,
        done: doneCount,
        running: runningCount,
        queued: queuedCount,
        failed: failedCount,
      },
    },
    cache: {
      hits: cacheStats.hits,
      misses: cacheStats.misses,
      hitRate,
      targetHitRate: 90,
      summary: cacheManager.getSummary(),
    },
    cacheHistory: [
      {
        timestamp: cacheStats.lastUpdated,
        hitRate,
        hits: cacheStats.hits,
        misses: cacheStats.misses,
      },
    ],
    context: {
      tokenLimit: 1_000_000,
      tokenUsage,
      usageRate: Number(((tokenUsage / 1_000_000) * 100).toFixed(2)),
      compactionThreshold: settings.compactionThreshold,
      promptsCacheEnabled: settings.promptsCacheEnabled,
    },
    uptimeSeconds: state ? Math.round((now - state.startedAt) / 1000) : 0,
  };
}

function printHumanStatus(payload: StatusPayload, view: NonNullable<TeamOptions['statusView']>): void {
  if (view === 'agents' || view === 'all') {
    console.log('\nAgents:');
    for (const agent of payload.agents) {
      const taskInfo = agent.currentTask ? ` → ${agent.currentTask.description.slice(0, 50)}` : '';
      console.log(`  [${agent.status.padEnd(9)}] ${agent.type} (${agent.id})${taskInfo}`);
    }
  }

  if (view === 'tasks' || view === 'all') {
    console.log('\nTasks:');
    for (const task of payload.tasks) {
      const assignee = task.assignedTo ? ` → ${task.assignedTo}` : '';
      console.log(`  [${task.status.padEnd(11)}] ${task.description.slice(0, 60)}${assignee}`);
    }
  }

  if (view === 'cache' || view === 'all') {
    console.log('\nCache:');
    console.log(`  Hit rate: ${payload.cache.hitRate}% (target: ${payload.cache.targetHitRate}%)`);
    console.log(`  Hits/Misses: ${payload.cache.hits}/${payload.cache.misses}`);
    console.log(`  Summary: ${payload.cache.summary}`);
  }

  if (view === 'cache-history' || view === 'all') {
    console.log('\nCache History:');
    for (const item of payload.cacheHistory) {
      console.log(`  [${new Date(item.timestamp).toISOString()}] ${item.hitRate}% (${item.hits}/${item.misses})`);
    }
  }

  if (view === 'context' || view === 'all') {
    console.log('\nContext:');
    console.log(
      `  Tokens: ${payload.context.tokenUsage}/${payload.context.tokenLimit} (${payload.context.usageRate}%)`,
    );
    console.log(`  Compaction threshold: ${payload.context.compactionThreshold}`);
    console.log(`  Prompt cache enabled: ${payload.context.promptsCacheEnabled}`);
  }

  console.log();
}

async function showStatusWithView(opts: TeamOptions): Promise<void> {
  const state = loadTeamState();
  const view = opts.statusView ?? 'all';
  const payload = buildStatusPayload(state);

  if (opts.json) {
    const agentsJson = {
      active: payload.summary.agents.active,
      total: payload.summary.agents.total,
      agents: payload.agents.map((agent) => ({
        id: agent.id,
        type: agent.type,
        status: agent.status,
        model: agent.config.model,
        progress: agent.progress,
        current_task: agent.currentTask?.description ?? null,
      })),
    };
    const tasksJson = {
      total: payload.summary.tasks.total,
      done: payload.summary.tasks.done,
      running: payload.summary.tasks.running,
      queued: payload.summary.tasks.queued,
      failed: payload.summary.tasks.failed,
      tasks: payload.tasks.map((task) => ({
        id: task.id,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assigned_to: task.assignedTo ?? null,
      })),
    };
    const cacheJson = {
      hit_rate: payload.cache.hitRate,
      target_rate: payload.cache.targetHitRate,
      hits: payload.cache.hits,
      misses: payload.cache.misses,
      summary: payload.cache.summary,
    };
    const cacheHistoryJson = payload.cacheHistory.map((item) => ({
      timestamp: item.timestamp,
      hit_rate: item.hitRate,
      hits: item.hits,
      misses: item.misses,
    }));
    const contextJson = {
      used: payload.context.tokenUsage,
      limit: payload.context.tokenLimit,
      percentage: payload.context.usageRate,
      compaction_threshold: payload.context.compactionThreshold,
      prompts_cache_enabled: payload.context.promptsCacheEnabled,
    };
    const allJson = {
      uptime_seconds: payload.uptimeSeconds,
      agents: agentsJson,
      tasks: tasksJson,
      cache: cacheJson,
      cache_history: cacheHistoryJson,
      context: contextJson,
    };

    const output =
      view === 'all'
        ? allJson
        : view === 'agents'
          ? agentsJson
          : view === 'tasks'
            ? tasksJson
            : view === 'cache'
              ? cacheJson
              : view === 'cache-history'
                ? cacheHistoryJson
                : contextJson;
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  if (!state) {
    console.log('\nNo active team session found.');
    console.log('Start one with: omg team start <task>\n');
  } else {
    console.log(`\nTeam Status (running for ${payload.uptimeSeconds}s)\n`);
  }
  printHumanStatus(payload, view);
}

async function shutdownTeam(): Promise<void> {
  const state = loadTeamState();

  if (!state) {
    console.log('\nNo active team session to shut down.\n');
    return;
  }

  console.log('\nShutting down team...\n');

  for (const agent of state.agents) {
    agent.status = AgentStatus.Completed;
    agent.currentTask = undefined;
    logger.info(`Stopped agent ${agent.id}`);
    console.log(`  Stopped ${agent.type} agent (${agent.id})`);
  }

  for (const task of state.tasks) {
    if (task.status === TaskStatus.InProgress || task.status === TaskStatus.Assigned) {
      task.status = TaskStatus.Failed;
    }
  }

  saveTeamState(state);
  console.log('\nAll agents stopped.\n');
}

export async function runTeam(opts: TeamOptions): Promise<void> {
  switch (opts.subcommand) {
    case 'start':
      return startTeam(opts);
    case 'status':
      return showStatusWithView(opts);
    case 'shutdown':
      return shutdownTeam();
  }
}
