import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadSettings, getProjectRoot } from '../shared/config.js';
import { logger } from '../shared/logger.js';

export interface LaunchOptions {
  task: string;
  model?: string;
  dashboard: boolean;
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

export async function runLaunch(opts: LaunchOptions): Promise<void> {
  const settings = loadSettings();
  const geminiCmd = settings.geminiCliPath;
  const args = buildGeminiArgs(opts, settings);

  if (opts.dryRun) {
    console.log('Dry run — would execute:');
    console.log(`  ${geminiCmd} ${args.join(' ')}`);
    return;
  }

  logger.info(`Launching: ${geminiCmd} ${args.join(' ')}`);

  if (opts.dashboard) {
    logger.debug('Dashboard mode enabled (will render alongside Gemini CLI)');
  }

  const child = spawn(geminiCmd, args, {
    stdio: 'inherit',
    shell: true,
    cwd: getProjectRoot(),
    env: {
      ...process.env,
      OMG_ACTIVE: '1',
      OMG_DASHBOARD: opts.dashboard ? '1' : '0',
    },
  });

  return new Promise<void>((resolve, reject) => {
    child.on('close', (code) => {
      if (code === 0 || code === null) {
        resolve();
      } else {
        logger.error(`Gemini CLI exited with code ${code}`);
        process.exitCode = code;
        resolve();
      }
    });

    child.on('error', (err) => {
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
