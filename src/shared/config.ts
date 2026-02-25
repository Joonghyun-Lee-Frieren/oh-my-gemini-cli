import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { homedir } from 'node:os';

export interface OmgSettings {
  defaultModel: string;
  maxWorkers: number;
  dashboard: boolean;
  dashboardStyle: 'safe' | 'retro';
  verbose: boolean;
  geminiCliPath: string;
  promptsCacheEnabled: boolean;
  compactionThreshold: number;
}

export interface LegacyAgentConfig {
  model: string;
}

export interface LegacyConfig {
  max_concurrent: number;
  gemini_cli_path: string;
  agents: Record<string, LegacyAgentConfig>;
}

const DEFAULT_SETTINGS: OmgSettings = {
  defaultModel: 'gemini-3.1-pro',
  maxWorkers: 3,
  dashboard: true,
  dashboardStyle: 'safe',
  verbose: false,
  geminiCliPath: 'gemini',
  promptsCacheEnabled: true,
  compactionThreshold: 800_000,
};

export const OMG_DIR = '.omg';
export const STATE_DIR = join(OMG_DIR, 'state');
export const PLANS_DIR = join(OMG_DIR, 'plans');
export const LOGS_DIR = join(OMG_DIR, 'logs');
export const SETTINGS_FILE = 'omg-settings.json';

export function getGeminiDir(): string {
  return join(homedir(), '.gemini');
}

export function getProjectRoot(): string {
  return process.cwd();
}

export function getOmgDir(): string {
  return resolve(getProjectRoot(), OMG_DIR);
}

export function loadSettings(projectRoot?: string): OmgSettings {
  const root = projectRoot ?? getProjectRoot();
  const settingsPath = resolve(root, SETTINGS_FILE);

  if (!existsSync(settingsPath)) {
    return { ...DEFAULT_SETTINGS };
  }

  const raw = readFileSync(settingsPath, 'utf-8');
  const parsed = JSON.parse(raw) as Partial<OmgSettings>;
  return { ...DEFAULT_SETTINGS, ...parsed };
}

export function saveSettings(settings: OmgSettings, projectRoot?: string): void {
  const root = projectRoot ?? getProjectRoot();
  const settingsPath = resolve(root, SETTINGS_FILE);
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf-8');
}

export function getDefaultSettings(): OmgSettings {
  return { ...DEFAULT_SETTINGS };
}

function resolveAgentModels(settings: OmgSettings): Record<string, LegacyAgentConfig> {
  const pro = settings.defaultModel.includes('flash') ? 'gemini-3.1-pro' : settings.defaultModel;
  const flash = settings.defaultModel.includes('flash') ? settings.defaultModel : 'gemini-3.1-flash';

  return {
    architect: { model: pro },
    planner: { model: pro },
    reviewer: { model: pro },
    debugger: { model: pro },
    researcher: { model: pro },
    executor: { model: flash },
    quick: { model: flash },
  };
}

/**
 * Backward-compatible config shape used by legacy modules.
 * Keep this until all call-sites are migrated to loadSettings().
 */
export function loadConfig(projectRoot?: string): LegacyConfig {
  const settings = loadSettings(projectRoot);
  return {
    max_concurrent: settings.maxWorkers,
    gemini_cli_path: settings.geminiCliPath,
    agents: resolveAgentModels(settings),
  };
}

export function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

export function getPackageVersion(): string {
  try {
    const pkgPath = resolve(import.meta.dirname ?? '.', '..', '..', 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    return pkg.version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
}

