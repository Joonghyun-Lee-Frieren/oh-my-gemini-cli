import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { eventBus } from '../shared/event-bus.js';
import { loadSettings, getProjectRoot, STATE_DIR, ensureDir } from '../shared/config.js';
import { logger } from '../shared/logger.js';
import type { Agent, AgentType, Task, TaskResult } from '../agents/types.js';
import { AgentStatus, TaskStatus, TaskPriority } from '../agents/types.js';

export interface TeamOptions {
  subcommand: 'start' | 'status' | 'shutdown';
  task?: string;
  workers?: number;
  model?: string;
  dashboard?: boolean;
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

async function showStatus(): Promise<void> {
  const state = loadTeamState();

  if (!state) {
    console.log('\nNo active team session found.');
    console.log('Start one with: omg team start <task>\n');
    return;
  }

  const elapsed = Math.round((Date.now() - state.startedAt) / 1000);
  console.log(`\nTeam Status (running for ${elapsed}s)\n`);

  console.log('Agents:');
  for (const agent of state.agents) {
    const taskInfo = agent.currentTask
      ? ` → ${agent.currentTask.description.slice(0, 50)}`
      : '';
    console.log(`  [${agent.status.padEnd(9)}] ${agent.type} (${agent.id})${taskInfo}`);
  }

  console.log('\nTasks:');
  for (const task of state.tasks) {
    const assignee = task.assignedTo ? ` → ${task.assignedTo}` : '';
    console.log(`  [${task.status.padEnd(11)}] ${task.description.slice(0, 60)}${assignee}`);
  }

  console.log();
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
      return showStatus();
    case 'shutdown':
      return shutdownTeam();
  }
}
