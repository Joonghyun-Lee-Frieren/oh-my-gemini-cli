import { Command } from 'commander';
import { getPackageVersion, loadSettings, saveSettings } from '../shared/config.js';
import { logger } from '../shared/logger.js';
import { runSetup } from './setup.js';
import { runDoctor } from './doctor.js';
import { runLaunch } from './launch.js';
import { runTeam } from './team.js';
import { runMcpServer } from '../mcp/stdio-server.js';
import { createTelegramBot } from '../bot/telegram.js';
import { createDiscordBot } from '../bot/discord.js';
import { runDashboardSession } from '../dashboard/runtime.js';

function parseValue(value: string): unknown {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  if (value === 'undefined') return undefined;
  const num = Number(value);
  if (!Number.isNaN(num) && value.trim() !== '') return num;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function getByPath(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (typeof current !== 'object' || current === null || !(key in (current as Record<string, unknown>))) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

function setByPath(obj: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (typeof current[key] !== 'object' || current[key] === null) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
}

function createProgram(): Command {
  const version = getPackageVersion();

  const program = new Command()
    .name('omg')
    .description('Context engineering powered multi-agent harness for Gemini CLI')
    .version(version, '-v, --version')
    .option('--agent <type>', 'agent type to use (architect, planner, executor, reviewer)')
    .option('--workers <count>', 'number of parallel workers', parseInt)
    .option('--model <model>', 'Gemini model to use')
    .option('--no-dashboard', 'disable TUI dashboard (plain CLI mode)')
    .option('--dashboard-style <style>', 'dashboard style: safe | retro')
    .option('--verbose', 'enable verbose logging')
    .option('--dry-run', 'show what would be done without executing');

  program
    .command('setup')
    .description('Initialize oh-my-gemini-cli for the current project')
    .option('--scope <scope>', 'installation scope: user, project-local, project', 'project')
    .action(async (opts) => {
      const globalOpts = program.opts();
      if (globalOpts.verbose) logger.setLevel('debug');
      await runSetup({ scope: opts.scope, dryRun: globalOpts.dryRun ?? false });
    });

  program
    .command('doctor')
    .description('Run diagnostic checks on your environment')
    .action(async () => {
      const globalOpts = program.opts();
      if (globalOpts.verbose) logger.setLevel('debug');
      await runDoctor();
    });

  program
    .command('launch', { isDefault: true })
    .description('Launch Gemini CLI with context engineering')
    .argument('[task...]', 'optional task description to pass to Gemini')
    .action(async (task: string[]) => {
      const globalOpts = program.opts();
      if (globalOpts.verbose) logger.setLevel('debug');
      const launchOptions = {
        task: task.join(' '),
        model: globalOpts.model,
        dashboard: globalOpts.dashboard ?? true,
        dashboardStyle: globalOpts.dashboardStyle === 'retro' ? 'retro' : 'safe',
        verbose: globalOpts.verbose ?? false,
        dryRun: globalOpts.dryRun ?? false,
      };
      if (launchOptions.dashboard && !launchOptions.dryRun) {
        await runDashboardSession({
          command: 'launch',
          run: () => runLaunch(launchOptions),
        });
        return;
      }
      await runLaunch(launchOptions);
    });

  program
    .command('status')
    .description('Show current agent and task status')
    .option('--agents', 'show only agents section')
    .option('--tasks', 'show only tasks section')
    .option('--cache', 'show only cache section')
    .option('--context', 'show only context section')
    .option('--cache-history', 'show only cache history section')
    .option('--json', 'render JSON output for automation')
    .action(async (opts) => {
      const globalOpts = program.opts();
      if (globalOpts.verbose) logger.setLevel('debug');
      const dashboardEnabled = globalOpts.dashboard ?? true;
      if (dashboardEnabled && !opts.json) {
        await runDashboardSession({
          command: 'status',
          keepOpenAfterRun: true,
        });
        return;
      }
      await runTeam({
        subcommand: 'status',
        statusView: opts.agents
          ? 'agents'
          : opts.tasks
            ? 'tasks'
            : opts.cache
              ? 'cache'
              : opts.context
                ? 'context'
                : opts.cacheHistory
                  ? 'cache-history'
                  : 'all',
        json: opts.json ?? false,
      });
    });

  const teamCmd = program
    .command('team')
    .description('Multi-agent team mode');

  teamCmd
    .command('start', { isDefault: true })
    .description('Start multi-agent team for a task')
    .argument('<task...>', 'task description')
    .action(async (task: string[]) => {
      const globalOpts = program.opts();
      if (globalOpts.verbose) logger.setLevel('debug');
      const teamOptions = {
        subcommand: 'start',
        task: task.join(' '),
        workers: globalOpts.workers,
        model: globalOpts.model,
        dashboard: globalOpts.dashboard ?? true,
      };
      if (teamOptions.dashboard) {
        await runDashboardSession({
          command: 'team-start',
          run: () => runTeam(teamOptions),
          keepOpenAfterRun: true,
        });
        return;
      }
      await runTeam(teamOptions);
    });

  teamCmd
    .command('status')
    .description('Show active agents and task pipeline')
    .action(async () => {
      const globalOpts = program.opts();
      const dashboardEnabled = globalOpts.dashboard ?? true;
      if (dashboardEnabled) {
        await runDashboardSession({
          command: 'team-status',
          keepOpenAfterRun: true,
        });
        return;
      }
      await runTeam({ subcommand: 'status' });
    });

  teamCmd
    .command('shutdown')
    .description('Gracefully stop all agents')
    .action(async () => {
      await runTeam({ subcommand: 'shutdown' });
    });

  program
    .command('config')
    .description('View or edit omg settings')
    .argument('[key]', 'setting key to view or set')
    .argument('[value]', 'value to set')
    .action((key?: string, value?: string) => {
      if (!key) {
        console.log(JSON.stringify(loadSettings(), null, 2));
        return;
      }
      if (value === undefined) {
        const settings = loadSettings();
        const val = getByPath(settings as Record<string, unknown>, key);
        if (val === undefined) {
          console.log(`Unknown key: ${key}`);
          return;
        }
        if (typeof val === 'object' && val !== null) {
          console.log(JSON.stringify(val, null, 2));
          return;
        }
        console.log(String(val));
        return;
      }
      const settings = loadSettings();
      const parsedValue = parseValue(value);
      setByPath(settings as unknown as Record<string, unknown>, key, parsedValue);
      saveSettings(settings as ReturnType<typeof loadSettings>);
      console.log(`Set ${key} = ${JSON.stringify(parsedValue)}`);
    });

  program
    .command('bot')
    .description('Start a bot integration (Telegram, Discord)')
    .argument('<platform>', 'platform: telegram or discord')
    .argument('[action]', 'action: start or stop', 'start')
    .action(async (platform: string, action: string) => {
      const settings = loadSettings() as unknown as Record<string, unknown>;
      const botSettings = (settings.bot ?? {}) as Record<string, unknown>;

      if (action !== 'start') {
        console.log(`Unsupported action: ${action}. Only "start" is currently available.`);
        return;
      }

      if (platform === 'telegram') {
        const telegram = (botSettings.telegram ?? {}) as Record<string, unknown>;
        const token = String(telegram.token ?? '');
        const chatId = String(telegram.chat_id ?? telegram.chatId ?? '');
        if (!token || !chatId) {
          console.log('Telegram bot config is missing.');
          console.log('Set both `bot.telegram.token` and `bot.telegram.chat_id` with `omg config set`.');
          return;
        }
        const bot = createTelegramBot({ token, chatId });
        await bot.start();
        console.log('Telegram bot started. Press Ctrl+C to stop.');
        await new Promise<void>(() => {});
        return;
      }

      if (platform === 'discord') {
        const discord = (botSettings.discord ?? {}) as Record<string, unknown>;
        const token = String(discord.token ?? '');
        const channelId = String(discord.channel_id ?? discord.channelId ?? '');
        if (!token || !channelId) {
          console.log('Discord bot config is missing.');
          console.log('Set both `bot.discord.token` and `bot.discord.channel_id` with `omg config set`.');
          return;
        }
        const bot = createDiscordBot({ token, channelId });
        await bot.start();
        console.log('Discord bot started. Press Ctrl+C to stop.');
        await new Promise<void>(() => {});
        return;
      }

      console.log(`Unsupported platform: ${platform}. Use "telegram" or "discord".`);
    });

  program
    .command('update')
    .description('Check for and apply updates')
    .action(() => {
      console.log('Checking for updates...');
      console.log('Run: npm update -g oh-my-gemini-cli');
    });

  return program;
}

export async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const isMcpMode = argv.includes('--mcp');
  if (isMcpMode) {
    const serverArgIdx = argv.findIndex((arg) => arg === '--server');
    const targetServer = serverArgIdx >= 0 ? argv[serverArgIdx + 1] : undefined;
    await runMcpServer(targetServer);
    return;
  }

  const program = createProgram();
  await program.parseAsync(process.argv);
}
