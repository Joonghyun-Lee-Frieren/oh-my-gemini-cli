import { existsSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { execSync } from 'node:child_process';
import { getGeminiDir, getProjectRoot, SETTINGS_FILE, OMG_DIR } from '../shared/config.js';
import { logger } from '../shared/logger.js';

interface CheckResult {
  passed: boolean;
  label: string;
  detail?: string;
}

type DiagnosticCheck = () => CheckResult;

function checkNodeVersion(): CheckResult {
  const [major] = process.versions.node.split('.').map(Number);
  return {
    passed: major >= 20,
    label: 'Node.js >= 20',
    detail: `Found v${process.versions.node}`,
  };
}

function checkGeminiCli(): CheckResult {
  try {
    const output = execSync('gemini --version', {
      encoding: 'utf-8',
      timeout: 5000,
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    return { passed: true, label: 'Gemini CLI installed', detail: output };
  } catch {
    return { passed: false, label: 'Gemini CLI installed', detail: 'Not found in PATH' };
  }
}

function checkGeminiAuth(): CheckResult {
  const geminiDir = getGeminiDir();
  const possibleAuthFiles = [
    join(geminiDir, 'oauth_creds.json'),
    join(geminiDir, 'credentials.json'),
  ];

  const hasApiKey = !!process.env.GEMINI_API_KEY || !!process.env.GOOGLE_API_KEY;
  const hasOAuthFile = possibleAuthFiles.some(f => existsSync(f));

  if (hasApiKey) {
    return { passed: true, label: 'Gemini auth configured', detail: 'API key found in environment' };
  }
  if (hasOAuthFile) {
    return { passed: true, label: 'Gemini auth configured', detail: 'OAuth credentials found' };
  }
  return {
    passed: false,
    label: 'Gemini auth configured',
    detail: 'No API key or OAuth credentials found',
  };
}

function checkPromptsInstalled(): CheckResult {
  const promptsDir = join(getGeminiDir(), 'prompts');
  const exists = existsSync(promptsDir);
  return {
    passed: exists,
    label: 'Prompts installed (~/.gemini/prompts/)',
    detail: exists ? 'Directory exists' : 'Run `omg setup` to install',
  };
}

function checkSkillsInstalled(): CheckResult {
  const skillsDir = join(getGeminiDir(), 'skills');
  const exists = existsSync(skillsDir);
  return {
    passed: exists,
    label: 'Skills installed (~/.gemini/skills/)',
    detail: exists ? 'Directory exists' : 'Run `omg setup` to install',
  };
}

function checkMcpServersRegistered(): CheckResult {
  const settingsPath = join(getGeminiDir(), 'settings.json');
  if (!existsSync(settingsPath)) {
    return {
      passed: false,
      label: 'MCP servers registered',
      detail: '~/.gemini/settings.json not found',
    };
  }

  try {
    const settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));
    const servers = settings.mcpServers ?? {};
    const requiredServers = ['omg_state', 'omg_memory', 'omg_context', 'omg_orchestrator'];
    const missing = requiredServers.filter((name) => !(name in servers));
    const hasAll = missing.length === 0;
    return {
      passed: hasAll,
      label: 'MCP servers registered',
      detail: hasAll
        ? `All OMG servers registered (${Object.keys(servers).length} total servers)`
        : `Missing MCP servers: ${missing.join(', ')}`,
    };
  } catch {
    return { passed: false, label: 'MCP servers registered', detail: 'Failed to parse settings.json' };
  }
}

function checkSettingsJsonValid(): CheckResult {
  const settingsPath = join(getGeminiDir(), 'settings.json');
  if (!existsSync(settingsPath)) {
    return { passed: false, label: 'settings.json valid', detail: 'File not found' };
  }

  try {
    JSON.parse(readFileSync(settingsPath, 'utf-8'));
    return { passed: true, label: 'settings.json valid', detail: 'Valid JSON' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Parse error';
    return { passed: false, label: 'settings.json valid', detail: msg };
  }
}

function checkOmgSettings(): CheckResult {
  const root = getProjectRoot();
  const settingsPath = resolve(root, SETTINGS_FILE);
  const omgDir = resolve(root, OMG_DIR);

  if (!existsSync(settingsPath)) {
    return {
      passed: false,
      label: 'omg-settings.json exists',
      detail: 'Run `omg setup` to create',
    };
  }

  try {
    JSON.parse(readFileSync(settingsPath, 'utf-8'));
    const hasOmgDir = existsSync(omgDir);
    return {
      passed: true,
      label: 'omg-settings.json exists',
      detail: hasOmgDir ? 'Settings and .omg/ directory present' : 'Settings found, .omg/ directory missing',
    };
  } catch {
    return { passed: false, label: 'omg-settings.json exists', detail: 'File exists but invalid JSON' };
  }
}

export async function runDoctor(): Promise<void> {
  console.log('\noh-my-gemini-cli doctor\n');
  console.log('Running environment checks...\n');

  const checks: DiagnosticCheck[] = [
    checkNodeVersion,
    checkGeminiCli,
    checkGeminiAuth,
    checkPromptsInstalled,
    checkSkillsInstalled,
    checkMcpServersRegistered,
    checkSettingsJsonValid,
    checkOmgSettings,
  ];

  let passed = 0;
  let failed = 0;

  for (const check of checks) {
    try {
      const result = check();
      const icon = result.passed ? '✓' : '✗';
      const color = result.passed ? '\x1b[32m' : '\x1b[31m';
      const reset = '\x1b[0m';

      console.log(`  ${color}${icon}${reset} ${result.label}`);
      if (result.detail) {
        console.log(`    ${result.detail}`);
      }

      if (result.passed) passed++;
      else failed++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`  \x1b[31m✗\x1b[0m Check failed with error`);
      console.log(`    ${msg}`);
      failed++;
      logger.error('Doctor check error', msg);
    }
  }

  console.log(`\n${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    console.log('Run `omg setup` to fix common issues.\n');
  } else {
    console.log('All checks passed! You\'re ready to go.\n');
  }
}
