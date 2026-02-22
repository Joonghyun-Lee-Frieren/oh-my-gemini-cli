import { Command } from 'commander';
import { getPackageVersion, loadSettings, saveSettings } from '../shared/config.js';
import { logger } from '../shared/logger.js';
import { runSetup } from './setup.js';
import { runDoctor } from './doctor.js';
import { runLaunch } from './launch.js';
import { runTeam } from './team.js';

function createProgram(): Command {
  const version = getPackageVersion();

  const program = new Command()
    .name('omg')
    .description('Context engineering powered multi-agent harness for Gemini CLI')
    .version(version, '-v, --version')
    .option('--agent <type>', 'agent type to use (architect, planner, executor, reviewer)')
    .option('--workers <count>', 'number of parallel workers', parseInt)
    .option('--model <model>', 'Gemini model to use')
    .option('--no-dashboard', 'disable ASCII dashboard')
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
      await runLaunch({
        task: task.join(' '),
        model: globalOpts.model,
        dashboard: globalOpts.dashboard ?? true,
        verbose: globalOpts.verbose ?? false,
        dryRun: globalOpts.dryRun ?? false,
      });
    });

  program
    .command('status')
    .description('Show current agent and task status')
    .action(async () => {
      const globalOpts = program.opts();
      if (globalOpts.verbose) logger.setLevel('debug');
      await runTeam({ subcommand: 'status' });
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
      await runTeam({
        subcommand: 'start',
        task: task.join(' '),
        workers: globalOpts.workers,
        model: globalOpts.model,
        dashboard: globalOpts.dashboard ?? true,
      });
    });

  teamCmd
    .command('status')
    .description('Show active agents and task pipeline')
    .action(async () => {
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
        const val = (settings as Record<string, unknown>)[key];
        console.log(val !== undefined ? String(val) : `Unknown key: ${key}`);
        return;
      }
      const settings = loadSettings();
      (settings as Record<string, unknown>)[key] = value;
      saveSettings(settings);
      console.log(`Set ${key} = ${value}`);
    });

  program
    .command('bot')
    .description('Start a bot integration (Telegram, Discord)')
    .argument('<platform>', 'platform: telegram or discord')
    .action((platform: string) => {
      console.log(`Bot integration for ${platform} is not yet implemented.`);
      console.log('Stay tuned for future releases!');
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
  const program = createProgram();
  await program.parseAsync(process.argv);
}
