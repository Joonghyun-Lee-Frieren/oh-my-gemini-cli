import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import type { McpServer, McpTool, McpToolResult } from './types.js';
import { createLogger } from '../shared/logger.js';

const log = createLogger('mcp:memory');

const MEMORY_PATH = join(process.cwd(), '.omg', 'project-memory.json');

export type MemoryCategory = 'architecture' | 'decisions' | 'conventions' | 'todo';

export interface MemoryEntry {
  id: string;
  category: MemoryCategory;
  title: string;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ProjectMemory {
  version: number;
  entries: MemoryEntry[];
}

function loadMemory(): ProjectMemory {
  try {
    return JSON.parse(readFileSync(MEMORY_PATH, 'utf-8')) as ProjectMemory;
  } catch {
    return { version: 1, entries: [] };
  }
}

function saveMemory(memory: ProjectMemory): void {
  mkdirSync(dirname(MEMORY_PATH), { recursive: true });
  writeFileSync(MEMORY_PATH, JSON.stringify(memory, null, 2));
}

function generateId(): string {
  return `mem_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

const memoryReadTool: McpTool = {
  name: 'memory_read',
  description: 'Read memory entries by category or ID',
  parameters: {
    category: { type: 'string', description: 'Filter by category (optional)', optional: true },
    id: { type: 'string', description: 'Read specific entry by ID (optional)', optional: true },
  },
  async execute(args): Promise<McpToolResult> {
    const { category, id } = args as { category?: MemoryCategory; id?: string };
    const memory = loadMemory();

    if (id) {
      const entry = memory.entries.find((e) => e.id === id);
      return entry
        ? { success: true, data: entry }
        : { success: false, error: `Entry not found: ${id}` };
    }

    const filtered = category
      ? memory.entries.filter((e) => e.category === category)
      : memory.entries;

    return { success: true, data: filtered };
  },
};

const memoryWriteTool: McpTool = {
  name: 'memory_write',
  description: 'Write or update a memory entry',
  parameters: {
    id: { type: 'string', description: 'Entry ID (omit to create new)', optional: true },
    category: { type: 'string', description: 'Category: architecture, decisions, conventions, todo' },
    title: { type: 'string', description: 'Entry title' },
    content: { type: 'string', description: 'Entry content' },
    tags: { type: 'array', description: 'Tags for searchability', optional: true },
  },
  async execute(args): Promise<McpToolResult> {
    const { id, category, title, content, tags = [] } = args as {
      id?: string;
      category: MemoryCategory;
      title: string;
      content: string;
      tags?: string[];
    };

    const memory = loadMemory();
    const now = Date.now();

    if (id) {
      const idx = memory.entries.findIndex((e) => e.id === id);
      if (idx === -1) return { success: false, error: `Entry not found: ${id}` };
      memory.entries[idx] = { ...memory.entries[idx], category, title, content, tags, updatedAt: now };
      saveMemory(memory);
      log.info(`Memory updated: ${id}`);
      return { success: true, data: memory.entries[idx] };
    }

    const entry: MemoryEntry = {
      id: generateId(),
      category,
      title,
      content,
      tags,
      createdAt: now,
      updatedAt: now,
    };
    memory.entries.push(entry);
    saveMemory(memory);
    log.info(`Memory created: ${entry.id} [${category}]`);
    return { success: true, data: entry };
  },
};

const memoryAddNoteTool: McpTool = {
  name: 'memory_add_note',
  description: 'Quick-add a note to a category without full entry structure',
  parameters: {
    category: { type: 'string', description: 'Category for the note' },
    note: { type: 'string', description: 'Note content' },
    tags: { type: 'array', description: 'Optional tags', optional: true },
  },
  async execute(args): Promise<McpToolResult> {
    const { category, note, tags = [] } = args as {
      category: MemoryCategory;
      note: string;
      tags?: string[];
    };

    const memory = loadMemory();
    const entry: MemoryEntry = {
      id: generateId(),
      category,
      title: note.slice(0, 80),
      content: note,
      tags,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    memory.entries.push(entry);
    saveMemory(memory);
    log.info(`Note added: [${category}] ${entry.title}`);
    return { success: true, data: entry };
  },
};

const memorySearchTool: McpTool = {
  name: 'memory_search',
  description: 'Search memory entries by keyword across titles, content, and tags',
  parameters: {
    query: { type: 'string', description: 'Search query' },
    category: { type: 'string', description: 'Limit search to category (optional)', optional: true },
  },
  async execute(args): Promise<McpToolResult> {
    const { query, category } = args as { query: string; category?: MemoryCategory };
    const memory = loadMemory();
    const lower = query.toLowerCase();

    const results = memory.entries.filter((e) => {
      if (category && e.category !== category) return false;
      return (
        e.title.toLowerCase().includes(lower) ||
        e.content.toLowerCase().includes(lower) ||
        e.tags.some((t) => t.toLowerCase().includes(lower))
      );
    });

    return { success: true, data: results };
  },
};

export class MemoryServer implements McpServer {
  name = 'memory-server';
  tools: McpTool[] = [memoryReadTool, memoryWriteTool, memoryAddNoteTool, memorySearchTool];

  async start(): Promise<void> {
    mkdirSync(dirname(MEMORY_PATH), { recursive: true });
    if (!existsSync(MEMORY_PATH)) {
      saveMemory({ version: 1, entries: [] });
    }
    log.info('Memory MCP server started');
  }

  async stop(): Promise<void> {
    log.info('Memory MCP server stopped');
  }
}

export function createMemoryServer(): MemoryServer {
  return new MemoryServer();
}
