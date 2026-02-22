import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { McpServer, McpTool, McpToolResult } from './types.js';
import { createLogger } from '../shared/logger.js';

const log = createLogger('mcp:state');

const STATE_DIR = join(process.cwd(), '.omg', 'state');

function ensureStateDir(): void {
  mkdirSync(STATE_DIR, { recursive: true });
}

function statePath(namespace: string, key: string): string {
  return join(STATE_DIR, `${namespace}--${key}.json`);
}

interface StateEntry {
  namespace: string;
  key: string;
  value: unknown;
  updatedAt: number;
  createdAt: number;
}

function readState(namespace: string, key: string): StateEntry | null {
  const path = statePath(namespace, key);
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as StateEntry;
  } catch {
    return null;
  }
}

function writeState(namespace: string, key: string, value: unknown): StateEntry {
  ensureStateDir();
  const existing = readState(namespace, key);
  const entry: StateEntry = {
    namespace,
    key,
    value,
    createdAt: existing?.createdAt ?? Date.now(),
    updatedAt: Date.now(),
  };
  writeFileSync(statePath(namespace, key), JSON.stringify(entry, null, 2));
  return entry;
}

function clearState(namespace: string, key: string): boolean {
  const path = statePath(namespace, key);
  try {
    unlinkSync(path);
    return true;
  } catch {
    return false;
  }
}

function listByNamespace(namespace: string): StateEntry[] {
  ensureStateDir();
  const prefix = `${namespace}--`;
  try {
    return readdirSync(STATE_DIR)
      .filter((f) => f.startsWith(prefix) && f.endsWith('.json'))
      .map((f) => {
        try {
          return JSON.parse(readFileSync(join(STATE_DIR, f), 'utf-8')) as StateEntry;
        } catch {
          return null;
        }
      })
      .filter((e): e is StateEntry => e !== null);
  } catch {
    return [];
  }
}

function getSystemStatus(): Record<string, unknown> {
  const agents = listByNamespace('agent');
  const tasks = listByNamespace('task');
  const modes = listByNamespace('mode');

  const activeAgents = agents.filter(
    (a) => (a.value as Record<string, string>)?.status === 'running',
  );
  const pendingTasks = tasks.filter(
    (t) => (t.value as Record<string, string>)?.status === 'queued',
  );

  return {
    agents: { total: agents.length, active: activeAgents.length },
    tasks: { total: tasks.length, pending: pendingTasks.length },
    modes: modes.map((m) => ({ key: m.key, value: m.value })),
    timestamp: Date.now(),
  };
}

const stateReadTool: McpTool = {
  name: 'state_read',
  description: 'Read a state value by namespace and key',
  parameters: {
    namespace: { type: 'string', description: 'State namespace (agent, task, mode)' },
    key: { type: 'string', description: 'State key' },
  },
  async execute(args): Promise<McpToolResult> {
    const { namespace, key } = args as { namespace: string; key: string };
    const entry = readState(namespace, key);
    if (!entry) return { success: false, error: `State not found: ${namespace}/${key}` };
    return { success: true, data: entry };
  },
};

const stateWriteTool: McpTool = {
  name: 'state_write',
  description: 'Write a state value by namespace and key',
  parameters: {
    namespace: { type: 'string', description: 'State namespace (agent, task, mode)' },
    key: { type: 'string', description: 'State key' },
    value: { type: 'object', description: 'State value to store' },
  },
  async execute(args): Promise<McpToolResult> {
    const { namespace, key, value } = args as { namespace: string; key: string; value: unknown };
    const entry = writeState(namespace, key, value);
    log.info(`State written: ${namespace}/${key}`);
    return { success: true, data: entry };
  },
};

const stateClearTool: McpTool = {
  name: 'state_clear',
  description: 'Clear a state entry by namespace and key',
  parameters: {
    namespace: { type: 'string', description: 'State namespace' },
    key: { type: 'string', description: 'State key' },
  },
  async execute(args): Promise<McpToolResult> {
    const { namespace, key } = args as { namespace: string; key: string };
    const removed = clearState(namespace, key);
    return removed
      ? { success: true, data: { removed: `${namespace}/${key}` } }
      : { success: false, error: `State not found: ${namespace}/${key}` };
  },
};

const stateListActiveTool: McpTool = {
  name: 'state_list_active',
  description: 'List all active entries in a namespace',
  parameters: {
    namespace: { type: 'string', description: 'State namespace to list' },
  },
  async execute(args): Promise<McpToolResult> {
    const { namespace } = args as { namespace: string };
    const entries = listByNamespace(namespace);
    return { success: true, data: entries };
  },
};

const stateGetStatusTool: McpTool = {
  name: 'state_get_status',
  description: 'Get overall system status including agents, tasks, and modes',
  parameters: {},
  async execute(): Promise<McpToolResult> {
    const status = getSystemStatus();
    return { success: true, data: status };
  },
};

export class StateServer implements McpServer {
  name = 'state-server';
  tools: McpTool[] = [
    stateReadTool,
    stateWriteTool,
    stateClearTool,
    stateListActiveTool,
    stateGetStatusTool,
  ];

  async start(): Promise<void> {
    ensureStateDir();
    log.info('State MCP server started');
  }

  async stop(): Promise<void> {
    log.info('State MCP server stopped');
  }
}

export function createStateServer(): StateServer {
  return new StateServer();
}
