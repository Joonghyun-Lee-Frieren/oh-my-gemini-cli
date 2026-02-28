import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, normalize, relative, resolve } from 'node:path';
import { homedir } from 'node:os';
import type { McpServer, McpTool, McpToolResult } from './types.js';
import { createLogger } from '../shared/logger.js';
import {
  bootstrapProjectMemoryFiles,
  bootstrapUserMemoryFiles,
  PROJECT_MEMORY_DIR,
  PROJECT_MEMORY_INDEX_FILE,
  PROJECT_RULES_DIR,
  syncProjectMemoryIndex,
} from '../shared/memory-files.js';

const log = createLogger('mcp:memory');

const PROJECT_ROOT = process.cwd();
const MEMORY_PATH = join(PROJECT_ROOT, '.omg', 'project-memory.json');
const PROJECT_MEMORY_INDEX_PATH = join(PROJECT_ROOT, PROJECT_MEMORY_INDEX_FILE);
const PROJECT_RULES_PATH = join(PROJECT_ROOT, PROJECT_RULES_DIR);
const USER_OMG_PATH = join(homedir(), '.omg');
const USER_MEMORY_INDEX_PATH = join(USER_OMG_PATH, PROJECT_MEMORY_INDEX_FILE);
const USER_RULES_PATH = join(USER_OMG_PATH, 'rules');

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

interface RuleFrontmatter {
  description: string;
  globs: string[];
  alwaysApply: boolean;
  body: string;
}

type RuleSource = 'project' | 'user';

interface RuleFile {
  path: string;
  source: RuleSource;
  description: string;
  globs: string[];
  alwaysApply: boolean;
  body: string;
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

function normalizeSlashes(path: string): string {
  return path.replace(/\\/g, '/');
}

function samePath(a: string, b: string): boolean {
  return normalize(a).toLowerCase() === normalize(b).toLowerCase();
}

function stripQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
    || (trimmed.startsWith('\'') && trimmed.endsWith('\''))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseArrayValue(value: string): string[] {
  const trimmed = value.trim();
  if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) {
    return [stripQuotes(trimmed)].filter(Boolean);
  }

  const inner = trimmed.slice(1, -1).trim();
  if (!inner) return [];
  return inner
    .split(',')
    .map((item) => stripQuotes(item))
    .filter(Boolean);
}

function parseRuleFrontmatter(markdown: string): RuleFrontmatter {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    return {
      description: '',
      globs: [],
      alwaysApply: false,
      body: markdown.trim(),
    };
  }

  const rawMeta = match[1].split(/\r?\n/);
  let description = '';
  let globs: string[] = [];
  let alwaysApply = false;
  let collectingGlobs = false;

  for (const rawLine of rawMeta) {
    const line = rawLine.trim();
    if (!line) continue;

    const keyValue = rawLine.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/);
    if (keyValue) {
      const key = keyValue[1];
      const value = keyValue[2].trim();
      collectingGlobs = false;

      if (key === 'description') {
        description = stripQuotes(value);
        continue;
      }

      if (key === 'alwaysApply') {
        alwaysApply = value.toLowerCase() === 'true';
        continue;
      }

      if (key === 'globs') {
        if (!value) {
          collectingGlobs = true;
          continue;
        }
        globs = parseArrayValue(value);
      }

      continue;
    }

    if (collectingGlobs && line.startsWith('- ')) {
      const item = stripQuotes(line.slice(2).trim());
      if (item) globs.push(item);
    }
  }

  return {
    description,
    globs,
    alwaysApply,
    body: markdown.slice(match[0].length).trim(),
  };
}

function escapeRegex(value: string): string {
  return value.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
}

function globToRegExp(glob: string): RegExp {
  const normalizedGlob = normalizeSlashes(glob.trim());
  let regex = '';
  let idx = 0;

  while (idx < normalizedGlob.length) {
    const char = normalizedGlob[idx];
    const next = normalizedGlob[idx + 1];

    if (char === '*') {
      if (next === '*') {
        const afterNext = normalizedGlob[idx + 2];
        if (afterNext === '/') {
          regex += '(?:.*/)?';
          idx += 3;
          continue;
        }
        regex += '.*';
        idx += 2;
        continue;
      }
      regex += '[^/]*';
      idx += 1;
      continue;
    }

    if (char === '?') {
      regex += '[^/]';
      idx += 1;
      continue;
    }

    regex += escapeRegex(char);
    idx += 1;
  }

  if (!normalizedGlob.includes('/')) {
    regex = `(?:^|.*/)${regex}`;
  }

  return new RegExp(`^${regex}$`);
}

function normalizeTargetPath(target: string): string {
  const absolute = isAbsolute(target) ? target : resolve(PROJECT_ROOT, target);
  const rel = relative(PROJECT_ROOT, absolute);

  if (rel === '') return '.';
  if (!rel.startsWith('..') && !isAbsolute(rel)) {
    return normalizeSlashes(rel);
  }

  return normalizeSlashes(absolute);
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function isInside(base: string, target: string): boolean {
  const rel = relative(base, target);
  return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel));
}

function pathDisplay(path: string): string {
  if (isInside(PROJECT_ROOT, path) || samePath(path, PROJECT_ROOT)) {
    return normalizeSlashes(relative(PROJECT_ROOT, path) || '.');
  }

  if (isInside(USER_OMG_PATH, path) || samePath(path, USER_OMG_PATH)) {
    const rel = normalizeSlashes(relative(USER_OMG_PATH, path));
    return `~/.omg/${rel}`;
  }

  return normalizeSlashes(path);
}

function listMarkdownFiles(rootDir: string): string[] {
  if (!existsSync(rootDir)) return [];
  const out: string[] = [];
  const stack: string[] = [rootDir];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    const entries = readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }
      if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
        out.push(fullPath);
      }
    }
  }

  out.sort((a, b) => a.localeCompare(b));
  return out;
}

function parseRuleFile(path: string, source: RuleSource): RuleFile | null {
  try {
    const raw = readFileSync(path, 'utf-8');
    const parsed = parseRuleFrontmatter(raw);
    return {
      path,
      source,
      description: parsed.description,
      globs: parsed.globs,
      alwaysApply: parsed.alwaysApply,
      body: parsed.body,
    };
  } catch {
    return null;
  }
}

function getRuleFiles(includeUserRules: boolean): RuleFile[] {
  const rules: RuleFile[] = [];
  const projectFiles = listMarkdownFiles(PROJECT_RULES_PATH);
  for (const file of projectFiles) {
    const parsed = parseRuleFile(file, 'project');
    if (parsed) rules.push(parsed);
  }

  if (includeUserRules) {
    const userFiles = listMarkdownFiles(USER_RULES_PATH);
    for (const file of userFiles) {
      const parsed = parseRuleFile(file, 'user');
      if (parsed) rules.push(parsed);
    }
  }

  return rules;
}

function ruleMatchesTarget(rule: RuleFile, targetPaths: string[]): boolean {
  if (rule.alwaysApply) return true;
  if (rule.globs.length === 0) return false;
  if (targetPaths.length === 0) return false;

  for (const target of targetPaths) {
    for (const glob of rule.globs) {
      try {
        if (globToRegExp(glob).test(target)) {
          return true;
        }
      } catch {
        continue;
      }
    }
  }

  return false;
}

function findLinkedMarkdown(indexPath: string, content: string): string[] {
  const found = new Set<string>();
  const linkPattern = /\[[^\]]+\]\(([^)\s]+)\)/g;
  const atImportPattern = /(?:^|\s)@([A-Za-z0-9_./\\-]+\.md)\b/g;

  const collect = (rawTarget: string): void => {
    const target = rawTarget.trim();
    if (!target || target.startsWith('http://') || target.startsWith('https://') || target.startsWith('#')) {
      return;
    }

    const clean = target.split('#')[0].split('?')[0];
    if (!clean.toLowerCase().endsWith('.md')) return;

    const resolved = isAbsolute(clean) ? clean : resolve(dirname(indexPath), clean);
    try {
      if (existsSync(resolved) && statSync(resolved).isFile()) {
        found.add(resolved);
      }
    } catch {
      // Ignore unreadable linked files.
    }
  };

  for (const match of content.matchAll(linkPattern)) {
    collect(match[1]);
  }
  for (const match of content.matchAll(atImportPattern)) {
    collect(match[1]);
  }

  return [...found];
}

function collectMemoryIndexFiles(targetPaths: string[]): string[] {
  const output: string[] = [];
  const seen = new Set<string>();

  const pushUnique = (candidate: string): void => {
    const normalized = normalize(candidate).toLowerCase();
    if (seen.has(normalized)) return;
    if (!existsSync(candidate)) return;
    seen.add(normalized);
    output.push(candidate);
  };

  pushUnique(PROJECT_MEMORY_INDEX_PATH);

  for (const target of targetPaths) {
    const absoluteTarget = isAbsolute(target) ? target : resolve(PROJECT_ROOT, target);
    const start = existsSync(absoluteTarget) && statSync(absoluteTarget).isDirectory()
      ? absoluteTarget
      : dirname(absoluteTarget);

    let current = start;
    while (true) {
      const candidate = join(current, PROJECT_MEMORY_INDEX_FILE);
      pushUnique(candidate);

      if (samePath(current, PROJECT_ROOT)) break;
      const parent = dirname(current);
      if (samePath(parent, current)) break;
      const relToProject = relative(PROJECT_ROOT, parent);
      if (relToProject.startsWith('..') || isAbsolute(relToProject)) break;
      current = parent;
    }
  }

  return output;
}

function collectMemoryFiles(targetPaths: string[], includeUserMemory: boolean): string[] {
  const files: string[] = [];
  const seen = new Set<string>();

  const pushUnique = (candidate: string): void => {
    const normalized = normalize(candidate).toLowerCase();
    if (seen.has(normalized)) return;
    if (!existsSync(candidate)) return;
    seen.add(normalized);
    files.push(candidate);
  };

  if (includeUserMemory) {
    pushUnique(USER_MEMORY_INDEX_PATH);
  }

  const indexFiles = collectMemoryIndexFiles(targetPaths);
  for (const indexPath of indexFiles) {
    pushUnique(indexPath);
    try {
      const content = readFileSync(indexPath, 'utf-8');
      const linked = findLinkedMarkdown(indexPath, content);
      for (const linkedFile of linked) {
        pushUnique(linkedFile);
      }
    } catch {
      // Ignore unreadable index files.
    }
  }

  const projectTopicFiles = listMarkdownFiles(join(PROJECT_ROOT, PROJECT_MEMORY_DIR));
  for (const topicFile of projectTopicFiles) {
    pushUnique(topicFile);
  }

  return files;
}

function readSnippet(path: string, maxChars: number): { content: string; truncated: boolean } {
  const raw = readFileSync(path, 'utf-8').trim();
  if (raw.length <= maxChars) {
    return { content: raw, truncated: false };
  }

  const excerpt = raw.slice(0, maxChars).trimEnd();
  return {
    content: `${excerpt}\n\n...[truncated ${raw.length - maxChars} chars]`,
    truncated: true,
  };
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

const memoryBootstrapTool: McpTool = {
  name: 'memory_bootstrap',
  description: 'Bootstrap MEMORY.md index, topic files, and modular rule packs',
  parameters: {
    force: { type: 'boolean', description: 'Overwrite existing scaffold files', optional: true },
    includeUserMemory: { type: 'boolean', description: 'Also initialize ~/.omg memory scaffolding', optional: true },
    syncIndex: { type: 'boolean', description: 'Generate MEMORY.md index during bootstrap', optional: true },
  },
  async execute(args): Promise<McpToolResult> {
    const { force, includeUserMemory, syncIndex } = args as {
      force?: unknown;
      includeUserMemory?: unknown;
      syncIndex?: unknown;
    };
    const safeForce = typeof force === 'boolean' ? force : false;
    const safeIncludeUserMemory = typeof includeUserMemory === 'boolean' ? includeUserMemory : false;
    const safeSyncIndex = typeof syncIndex === 'boolean' ? syncIndex : true;

    const projectResult = bootstrapProjectMemoryFiles(PROJECT_ROOT, { force: safeForce, syncIndex: safeSyncIndex });
    let userResult: ReturnType<typeof bootstrapUserMemoryFiles> | undefined;
    if (safeIncludeUserMemory) {
      userResult = bootstrapUserMemoryFiles({ force: safeForce, syncIndex: safeSyncIndex });
    }

    log.info(
      `Memory scaffold updated: project(created=${projectResult.created.length}, skipped=${projectResult.skipped.length})`,
    );

    return {
      success: true,
      data: {
        project: {
          created: projectResult.created.map(pathDisplay),
          skipped: projectResult.skipped.map(pathDisplay),
          index: projectResult.index
            ? {
              ...projectResult.index,
              path: pathDisplay(projectResult.index.path),
            }
            : undefined,
        },
        user: userResult
          ? {
            created: userResult.created.map(pathDisplay),
            skipped: userResult.skipped.map(pathDisplay),
            index: userResult.index
              ? {
                ...userResult.index,
                path: pathDisplay(userResult.index.path),
              }
              : undefined,
          }
          : undefined,
      },
    };
  },
};

const memoryIndexSyncTool: McpTool = {
  name: 'memory_index_sync',
  description: 'Regenerate project MEMORY.md index from .omg/memory topic files',
  parameters: {
    maxLines: { type: 'number', description: 'Max line count target for MEMORY.md (default: 200)', optional: true },
  },
  async execute(args): Promise<McpToolResult> {
    const { maxLines } = args as { maxLines?: number };
    const safeMaxLines = typeof maxLines === 'number' && maxLines >= 40 ? Math.floor(maxLines) : 200;
    const result = syncProjectMemoryIndex(PROJECT_ROOT, safeMaxLines);
    return {
      success: true,
      data: {
        ...result,
        path: pathDisplay(result.path),
      },
    };
  },
};

const memoryRulesResolveTool: McpTool = {
  name: 'memory_rules_resolve',
  description: 'Resolve applicable modular rule packs using alwaysApply and glob matching',
  parameters: {
    targetPaths: { type: 'array', description: 'Changed or focused file paths for rule matching', optional: true },
    includeUserRules: { type: 'boolean', description: 'Include ~/.omg/rules in matching', optional: true },
  },
  async execute(args): Promise<McpToolResult> {
    const { targetPaths, includeUserRules } = args as {
      targetPaths?: unknown;
      includeUserRules?: unknown;
    };
    const safeIncludeUserRules = typeof includeUserRules === 'boolean' ? includeUserRules : true;

    const normalizedTargets = toStringArray(targetPaths).map(normalizeTargetPath);
    const rules = getRuleFiles(safeIncludeUserRules)
      .map((rule) => ({
        rule,
        matched: ruleMatchesTarget(rule, normalizedTargets),
      }))
      .filter((item) => item.matched)
      .map((item) => ({
        path: pathDisplay(item.rule.path),
        source: item.rule.source,
        description: item.rule.description,
        globs: item.rule.globs,
        alwaysApply: item.rule.alwaysApply,
      }));

    return {
      success: true,
      data: {
        targetPaths: normalizedTargets,
        matchedRules: rules,
      },
    };
  },
};

const memoryBuildContextTool: McpTool = {
  name: 'memory_build_context',
  description: 'Build prompt-ready memory context from MEMORY.md, topic files, and matched rules',
  parameters: {
    task: { type: 'string', description: 'Optional task description for context framing', optional: true },
    targetPaths: { type: 'array', description: 'Optional target file paths for nested memory/rule matching', optional: true },
    includeRules: { type: 'boolean', description: 'Include matched modular rules (default: true)', optional: true },
    includeUserMemory: { type: 'boolean', description: 'Include ~/.omg/MEMORY.md when present', optional: true },
    includeUserRules: { type: 'boolean', description: 'Include ~/.omg/rules when resolving rules', optional: true },
    maxFiles: { type: 'number', description: 'Maximum number of memory files to include', optional: true },
    maxCharsPerFile: { type: 'number', description: 'Maximum characters per file snippet', optional: true },
  },
  async execute(args): Promise<McpToolResult> {
    const {
      task,
      targetPaths,
      includeRules,
      includeUserMemory,
      includeUserRules,
      maxFiles,
      maxCharsPerFile,
    } = args as {
      task?: string;
      targetPaths?: unknown;
      includeRules?: unknown;
      includeUserMemory?: unknown;
      includeUserRules?: unknown;
      maxFiles?: unknown;
      maxCharsPerFile?: unknown;
    };

    const safeIncludeRules = typeof includeRules === 'boolean' ? includeRules : true;
    const safeIncludeUserMemory = typeof includeUserMemory === 'boolean' ? includeUserMemory : true;
    const safeIncludeUserRules = typeof includeUserRules === 'boolean' ? includeUserRules : true;
    const normalizedTargets = toStringArray(targetPaths).map(normalizeTargetPath);
    const safeMaxFiles = typeof maxFiles === 'number' && maxFiles > 0 ? Math.floor(maxFiles) : 12;
    const safeMaxCharsPerFile = typeof maxCharsPerFile === 'number' && maxCharsPerFile > 0
      ? Math.floor(maxCharsPerFile)
      : 4000;
    const memoryFiles = collectMemoryFiles(normalizedTargets, safeIncludeUserMemory).slice(
      0,
      Math.max(1, safeMaxFiles),
    );

    const sections: string[] = ['# Memory Context'];
    let truncated = false;

    if (task) {
      sections.push(`Task focus: ${task}`);
    }

    if (normalizedTargets.length > 0) {
      sections.push(`Target paths: ${normalizedTargets.join(', ')}`);
    }

    if (memoryFiles.length === 0) {
      sections.push('No memory files found. Run memory_bootstrap first.');
    } else {
      sections.push('## Memory Files');
      for (const filePath of memoryFiles) {
        try {
          const snippet = readSnippet(filePath, Math.max(500, safeMaxCharsPerFile));
          if (snippet.truncated) truncated = true;
          sections.push(`### ${pathDisplay(filePath)}\n${snippet.content}`);
        } catch {
          sections.push(`### ${pathDisplay(filePath)}\n[unreadable file]`);
        }
      }
    }

    const matchedRules = safeIncludeRules
      ? getRuleFiles(safeIncludeUserRules)
        .filter((rule) => ruleMatchesTarget(rule, normalizedTargets))
      : [];

    if (safeIncludeRules) {
      sections.push('## Active Rules');
      if (matchedRules.length === 0) {
        sections.push('No matching rules.');
      } else {
        for (const rule of matchedRules) {
          const ruleSnippet = rule.body.length <= 1500
            ? rule.body
            : `${rule.body.slice(0, 1500).trimEnd()}\n\n...[truncated ${rule.body.length - 1500} chars]`;
          if (ruleSnippet !== rule.body) truncated = true;
          const description = rule.description || 'No description';
          sections.push(
            `### ${pathDisplay(rule.path)} (${rule.source})\nDescription: ${description}\n${ruleSnippet}`,
          );
        }
      }
    }

    return {
      success: true,
      data: {
        context: sections.join('\n\n'),
        memoryFiles: memoryFiles.map(pathDisplay),
        matchedRules: matchedRules.map((rule) => ({
          path: pathDisplay(rule.path),
          source: rule.source,
          description: rule.description,
          globs: rule.globs,
          alwaysApply: rule.alwaysApply,
        })),
        targetPaths: normalizedTargets,
        truncated,
      },
    };
  },
};

export class MemoryServer implements McpServer {
  name = 'memory-server';
  tools: McpTool[] = [
    memoryReadTool,
    memoryWriteTool,
    memoryAddNoteTool,
    memorySearchTool,
    memoryBootstrapTool,
    memoryIndexSyncTool,
    memoryRulesResolveTool,
    memoryBuildContextTool,
  ];

  async start(): Promise<void> {
    mkdirSync(dirname(MEMORY_PATH), { recursive: true });
    mkdirSync(join(PROJECT_ROOT, PROJECT_MEMORY_DIR), { recursive: true });
    mkdirSync(PROJECT_RULES_PATH, { recursive: true });
    if (!existsSync(MEMORY_PATH)) {
      saveMemory({ version: 1, entries: [] });
    }
    if (!existsSync(PROJECT_MEMORY_INDEX_PATH)) {
      bootstrapProjectMemoryFiles(PROJECT_ROOT, { syncIndex: true, force: false });
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
