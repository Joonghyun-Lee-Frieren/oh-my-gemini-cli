import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { homedir } from 'node:os';

export const PROJECT_MEMORY_INDEX_FILE = 'MEMORY.md';
export const PROJECT_MEMORY_DIR = join('.omg', 'memory');
export const PROJECT_RULES_DIR = join('.omg', 'rules');
export const USER_OMG_DIR = join(homedir(), '.omg');

const DEFAULT_INDEX_MAX_LINES = 200;

export interface MemoryBootstrapOptions {
  force?: boolean;
  syncIndex?: boolean;
}

export interface MemoryBootstrapResult {
  created: string[];
  skipped: string[];
  index?: MemoryIndexSyncResult;
}

export interface MemoryIndexSyncResult {
  path: string;
  lineCount: number;
  entries: number;
  truncatedEntries: number;
}

interface MemoryTopicMetadata {
  title: string;
  summary: string;
  updated: string;
  relativePath: string;
}

function normalizeForMarkdown(target: string): string {
  return target.replace(/\\/g, '/');
}

function sanitizeCell(value: string): string {
  return value.replace(/\r?\n/g, ' ').replace(/\|/g, '\\|').trim();
}

function writeFileIfNeeded(targetPath: string, content: string, force: boolean, created: string[], skipped: string[]): void {
  mkdirSync(dirname(targetPath), { recursive: true });

  if (existsSync(targetPath) && !force) {
    skipped.push(targetPath);
    return;
  }

  const finalContent = content.endsWith('\n') ? content : `${content}\n`;
  writeFileSync(targetPath, finalContent, 'utf-8');
  created.push(targetPath);
}

function listMarkdownFiles(rootDir: string): string[] {
  if (!existsSync(rootDir)) {
    return [];
  }

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

function readTopicMetadata(projectRoot: string, filePath: string): MemoryTopicMetadata {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/);

  const titleLine = lines.find((line) => /^#{1,6}\s+/.test(line));
  const title = titleLine
    ? titleLine.replace(/^#{1,6}\s+/, '').trim()
    : filePath.split(/[\\/]/).pop()?.replace(/\.md$/i, '') ?? 'Untitled';

  const summaryLine = lines.find((line) => {
    const trimmed = line.trim();
    return trimmed.length > 0 && !trimmed.startsWith('#');
  });
  const summary = summaryLine ? summaryLine.trim() : 'No summary yet.';

  const updated = statSync(filePath).mtime.toISOString().slice(0, 10);
  const relativePath = normalizeForMarkdown(relative(projectRoot, filePath));

  return { title, summary, updated, relativePath };
}

function getProjectName(projectRoot: string): string {
  const parts = projectRoot.split(/[\\/]/);
  return parts[parts.length - 1] || 'project';
}

export function generateProjectMemoryIndex(projectRoot: string, maxLines = DEFAULT_INDEX_MAX_LINES): {
  content: string;
  lineCount: number;
  entries: number;
  truncatedEntries: number;
} {
  const memoryRoot = resolve(projectRoot, PROJECT_MEMORY_DIR);
  const topicFiles = listMarkdownFiles(memoryRoot);
  const topicMetadata = topicFiles.map((file) => readTopicMetadata(projectRoot, file));
  const projectName = getProjectName(projectRoot);

  const header = [
    '# MEMORY.md',
    '',
    `Project memory index for \`${projectName}\`.`,
    '',
    '## How To Use',
    '- Keep this index short and stable for caching (target: <= 200 lines).',
    '- Store detailed notes under `.omg/memory/*.md` and link them here.',
    '- Keep architecture decisions and workflow conventions in separate topic files.',
    '- Use `.omg/rules/*.md` for modular, task-conditional rule packs.',
    '',
    '## Topic Index',
    '| Topic | File | Summary | Updated |',
    '| --- | --- | --- | --- |',
  ];

  const footer = [
    '',
    '## Rules Convention',
    '- Rule files live under `.omg/rules/*.md`.',
    '- Frontmatter fields:',
    '  - `description`: short purpose for the rule',
    '  - `globs`: optional file patterns for conditional activation',
    '  - `alwaysApply`: optional boolean (`true` to always activate)',
  ];

  const allRows = topicMetadata.map((meta) => {
    return `| ${sanitizeCell(meta.title)} | \`${meta.relativePath}\` | ${sanitizeCell(meta.summary)} | ${meta.updated} |`;
  });

  const baseLineCount = header.length + footer.length;
  let availableRows = Math.max(0, maxLines - baseLineCount);
  let rows = allRows;
  let truncatedEntries = 0;

  if (rows.length > availableRows) {
    if (availableRows === 0) {
      truncatedEntries = rows.length;
      rows = [];
    } else {
      const keepCount = Math.max(0, availableRows - 1);
      truncatedEntries = rows.length - keepCount;
      rows = rows.slice(0, keepCount);
      rows.push(`| ... | ... | ${truncatedEntries} additional files omitted. Increase maxLines to show all. | - |`);
    }
  }

  const lines = [...header, ...rows, ...footer];
  const content = lines.join('\n');

  return {
    content,
    lineCount: lines.length,
    entries: topicMetadata.length,
    truncatedEntries,
  };
}

export function syncProjectMemoryIndex(projectRoot: string, maxLines = DEFAULT_INDEX_MAX_LINES): MemoryIndexSyncResult {
  const indexPath = resolve(projectRoot, PROJECT_MEMORY_INDEX_FILE);
  const generated = generateProjectMemoryIndex(projectRoot, maxLines);
  mkdirSync(dirname(indexPath), { recursive: true });
  writeFileSync(indexPath, `${generated.content}\n`, 'utf-8');

  return {
    path: indexPath,
    lineCount: generated.lineCount,
    entries: generated.entries,
    truncatedEntries: generated.truncatedEntries,
  };
}

function projectTopicTemplates(projectName: string): Record<string, string> {
  return {
    [join(PROJECT_MEMORY_DIR, 'project-overview.md')]: `# Project Overview

One-page description of ${projectName}.

## Product Goal
- What problem this project solves.

## Primary Users
- Who uses it and why.

## Success Metrics
- What outcomes mean "working well".
`,
    [join(PROJECT_MEMORY_DIR, 'architecture.md')]: `# Architecture

High-signal architecture notes.

## Core Modules
- Main module boundaries and responsibilities.

## Data Flow
- Key request/response or event flow.

## Integration Points
- External systems, APIs, or runtime contracts.
`,
    [join(PROJECT_MEMORY_DIR, 'decisions.md')]: `# Key Decisions

Record major technical decisions in ADR style.

## Decision Template
- Date:
- Context:
- Decision:
- Consequences:

## Open Questions
- Unknowns that can impact roadmap or reliability.
`,
    [join(PROJECT_MEMORY_DIR, 'workflows.md')]: `# Engineering Workflows

Stable team workflow patterns.

## Build and Validation
- Canonical build/test commands.

## Delivery Pipeline
- Plan -> implement -> verify loop conventions.

## Operational Guardrails
- Required checks before merge/release.
`,
  };
}

function projectRuleTemplates(): Record<string, string> {
  return {
    [join(PROJECT_RULES_DIR, 'always', 'project-invariants.md')]: `---
description: "Always-applied project invariants."
alwaysApply: true
---
# Project Invariants

- Preserve existing architecture boundaries unless explicitly approved.
- Avoid unrelated refactors while implementing scoped tasks.
- Validate behavior with focused checks before claiming completion.
`,
    [join(PROJECT_RULES_DIR, 'tests-required.md')]: `---
description: "Require tests or verification evidence for behavior changes."
globs:
  - "**/*.ts"
  - "**/*.tsx"
alwaysApply: false
---
# tests-required

- Add or update tests for behavior changes.
- If tests are unavailable, provide reproducible validation commands.
`,
    [join(PROJECT_RULES_DIR, 'migration-safety.md')]: `---
description: "Guardrails for schema/data/config migrations."
globs:
  - "**/migrations/**"
  - "**/*migration*"
alwaysApply: false
---
# migration-safety

- Preserve backward compatibility or provide explicit migration path.
- Document rollback steps and blast radius.
`,
    [join(PROJECT_RULES_DIR, 'security-review.md')]: `---
description: "Security checks for auth/secrets/trust boundaries."
globs:
  - "**/*auth*"
  - "**/*security*"
  - "**/.env*"
alwaysApply: false
---
# security-review

- Do not expose secrets, credentials, or sensitive logs.
- Validate auth/authorization and input-validation assumptions.
`,
    [join(PROJECT_RULES_DIR, 'docs-sync.md')]: `---
description: "Keep docs aligned with behavior changes."
globs:
  - "README.md"
  - "docs/**/*.md"
alwaysApply: false
---
# docs-sync

- Update user-facing docs for changed behavior and commands.
- Keep examples and defaults in sync with implementation.
`,
    [join(PROJECT_RULES_DIR, 'perf-watch.md')]: `---
description: "Watch for known performance-sensitive surfaces."
globs:
  - "**/*cache*"
  - "**/*context*"
  - "**/*performance*"
alwaysApply: false
---
# perf-watch

- Avoid avoidable repeated work in hot paths.
- Measure before/after impact when changing high-frequency code paths.
`,
  };
}

export function bootstrapProjectMemoryFiles(projectRoot: string, options: MemoryBootstrapOptions = {}): MemoryBootstrapResult {
  const force = options.force ?? false;
  const syncIndex = options.syncIndex ?? true;
  const created: string[] = [];
  const skipped: string[] = [];
  const projectName = getProjectName(projectRoot);

  const templates = {
    ...projectTopicTemplates(projectName),
    ...projectRuleTemplates(),
  };

  for (const [relativePath, content] of Object.entries(templates)) {
    const fullPath = resolve(projectRoot, relativePath);
    writeFileIfNeeded(fullPath, content, force, created, skipped);
  }

  let indexResult: MemoryIndexSyncResult | undefined;
  const indexPath = resolve(projectRoot, PROJECT_MEMORY_INDEX_FILE);
  const shouldSyncIndex = syncIndex && (force || !existsSync(indexPath));
  if (shouldSyncIndex) {
    indexResult = syncProjectMemoryIndex(projectRoot, DEFAULT_INDEX_MAX_LINES);
    if (!created.includes(indexResult.path)) {
      created.push(indexResult.path);
    }
  } else if (syncIndex) {
    skipped.push(indexPath);
  }

  return { created, skipped, index: indexResult };
}

export function bootstrapUserMemoryFiles(options: MemoryBootstrapOptions = {}): MemoryBootstrapResult {
  const force = options.force ?? false;
  const syncIndex = options.syncIndex ?? true;
  const created: string[] = [];
  const skipped: string[] = [];

  const templates: Record<string, string> = {
    [join(USER_OMG_DIR, 'rules', 'always', 'personal-preferences.md')]: `---
description: "Always-applied personal preferences."
alwaysApply: true
---
# Personal Preferences

- Document durable style and workflow preferences here.
- Keep this file focused on stable preferences only.
`,
  };

  for (const [fullPath, content] of Object.entries(templates)) {
    writeFileIfNeeded(fullPath, content, force, created, skipped);
  }

  const userMemoryPath = join(USER_OMG_DIR, PROJECT_MEMORY_INDEX_FILE);
  let indexResult: MemoryIndexSyncResult | undefined;

  if (syncIndex && (force || !existsSync(userMemoryPath))) {
    const content = [
      '# MEMORY.md',
      '',
      'User-level memory for reusable personal preferences.',
      '',
      '## Preferences',
      `- [Personal Preferences](./rules/always/personal-preferences.md)`,
    ].join('\n');
    writeFileIfNeeded(userMemoryPath, content, force, created, skipped);
    indexResult = {
      path: userMemoryPath,
      lineCount: content.split('\n').length,
      entries: 1,
      truncatedEntries: 0,
    };
  } else if (syncIndex) {
    skipped.push(userMemoryPath);
  }

  return { created, skipped, index: indexResult };
}
