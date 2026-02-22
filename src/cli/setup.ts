import { existsSync, mkdirSync, writeFileSync, readFileSync, cpSync } from 'node:fs';
import { resolve, join } from 'node:path';
import {
  getGeminiDir,
  getProjectRoot,
  OMG_DIR,
  STATE_DIR,
  PLANS_DIR,
  LOGS_DIR,
  SETTINGS_FILE,
  getDefaultSettings,
  saveSettings,
  ensureDir,
} from '../shared/config.js';
import { logger } from '../shared/logger.js';

export type SetupScope = 'user' | 'project-local' | 'project';

export interface SetupOptions {
  scope: SetupScope;
  dryRun: boolean;
}

interface SetupStep {
  label: string;
  run: () => void;
}

function resolvePackageAsset(relativePath: string): string {
  const base = import.meta.dirname ?? resolve('.');
  return resolve(base, '..', '..', relativePath);
}

export async function runSetup(opts: SetupOptions): Promise<void> {
  const root = getProjectRoot();
  const geminiDir = getGeminiDir();
  let stepIndex = 0;

  const steps: SetupStep[] = [
    {
      label: 'Creating .omg/ runtime directories',
      run() {
        for (const dir of [OMG_DIR, STATE_DIR, PLANS_DIR, LOGS_DIR]) {
          const full = resolve(root, dir);
          ensureDir(full);
          logger.debug(`Created ${full}`);
        }
      },
    },
    {
      label: 'Copying prompts to ~/.gemini/prompts/',
      run() {
        const targetDir = join(geminiDir, 'prompts');
        ensureDir(targetDir);
        const srcDir = resolvePackageAsset('prompts');
        if (existsSync(srcDir)) {
          cpSync(srcDir, targetDir, { recursive: true, force: false });
        } else {
          logger.warn('Prompts source directory not found, skipping copy');
        }
      },
    },
    {
      label: 'Copying skills to ~/.gemini/skills/',
      run() {
        const targetDir = join(geminiDir, 'skills');
        ensureDir(targetDir);
        const srcDir = resolvePackageAsset('skills');
        if (existsSync(srcDir)) {
          cpSync(srcDir, targetDir, { recursive: true, force: false });
        } else {
          logger.warn('Skills source directory not found, skipping copy');
        }
      },
    },
    {
      label: 'Copying commands to ~/.gemini/commands/',
      run() {
        const targetDir = join(geminiDir, 'commands');
        ensureDir(targetDir);
        const srcDir = resolvePackageAsset('commands');
        if (existsSync(srcDir)) {
          cpSync(srcDir, targetDir, { recursive: true, force: false });
        } else {
          logger.warn('Commands source directory not found, skipping copy');
        }
      },
    },
    {
      label: 'Registering MCP servers in ~/.gemini/settings.json',
      run() {
        const settingsPath = join(geminiDir, 'settings.json');
        let settings: Record<string, unknown> = {};

        if (existsSync(settingsPath)) {
          settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));
        }

        const mcpServers = (settings.mcpServers ?? {}) as Record<string, unknown>;
        if (!mcpServers['omg-context']) {
          mcpServers['omg-context'] = {
            command: 'npx',
            args: ['-y', 'oh-my-gemini-cli', '--mcp'],
            description: 'oh-my-gemini-cli context engineering MCP server',
          };
        }
        settings.mcpServers = mcpServers;

        ensureDir(geminiDir);
        writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf-8');
      },
    },
    {
      label: 'Creating project GEMINI.md',
      run() {
        const geminiMd = resolve(root, 'GEMINI.md');
        if (existsSync(geminiMd)) {
          logger.info('GEMINI.md already exists, skipping');
          return;
        }

        const templatePath = resolvePackageAsset('templates/GEMINI.md');
        if (existsSync(templatePath)) {
          const template = readFileSync(templatePath, 'utf-8');
          const projectName = root.split(/[\\/]/).pop() ?? 'my-project';
          const content = template.replace(/\{\{PROJECT_NAME\}\}/g, projectName);
          writeFileSync(geminiMd, content, 'utf-8');
        } else {
          const projectName = root.split(/[\\/]/).pop() ?? 'my-project';
          writeFileSync(geminiMd, generateDefaultGeminiMd(projectName), 'utf-8');
        }
      },
    },
    {
      label: 'Creating default omg-settings.json',
      run() {
        const settingsPath = resolve(root, SETTINGS_FILE);
        if (existsSync(settingsPath)) {
          logger.info('omg-settings.json already exists, skipping');
          return;
        }
        saveSettings(getDefaultSettings(), root);
      },
    },
  ];

  if (opts.scope === 'user') {
    console.log('Running user-scope setup (global configuration only)');
  } else if (opts.scope === 'project-local') {
    console.log('Running project-local setup (no global changes)');
  }

  console.log(`\nSetting up oh-my-gemini-cli in ${root}\n`);

  for (const step of steps) {
    stepIndex++;
    const prefix = `[${stepIndex}/${steps.length}]`;

    if (opts.dryRun) {
      console.log(`${prefix} (dry-run) ${step.label}`);
      continue;
    }

    console.log(`${prefix} ${step.label}`);
    try {
      step.run();
      logger.debug(`Step ${stepIndex} completed`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ Failed: ${msg}`);
      logger.error(`Setup step ${stepIndex} failed`, msg);
    }
  }

  console.log('\n✓ Setup complete! Run `omg doctor` to verify your environment.\n');
}

function generateDefaultGeminiMd(projectName: string): string {
  return `# ${projectName}

## Project Overview
<!-- Describe your project here -->

## Architecture
<!-- High-level architecture description -->

## Conventions
- Use TypeScript with strict mode
- Follow existing code patterns
- Write tests for new features

## Key Files
<!-- List important files and their purposes -->

## Development
\`\`\`bash
npm install
npm run build
npm test
\`\`\`
`;
}
