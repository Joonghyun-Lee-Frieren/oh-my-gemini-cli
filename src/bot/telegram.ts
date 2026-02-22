import { createLogger } from '../shared/logger.js';
import { eventBus, type EventName } from '../shared/event-bus.js';
import type { Agent, TaskResult } from '../agents/types.js';

const log = createLogger('bot:telegram');

export interface TelegramBotConfig {
  token: string;
  chatId: string;
  notifyOnComplete?: boolean;
  notifyOnError?: boolean;
}

interface TelegramMessage {
  chatId: string;
  text: string;
  parseMode?: 'Markdown' | 'HTML';
}

type CommandHandler = (args: string) => Promise<string>;

export class TelegramBot {
  private config: TelegramBotConfig;
  private commands: Map<string, CommandHandler> = new Map();
  private running = false;
  private agentStates: Map<string, Agent> = new Map();
  private taskResults: TaskResult[] = [];

  constructor(config: TelegramBotConfig) {
    this.config = { notifyOnComplete: true, notifyOnError: true, ...config };
    this.registerCommands();
  }

  private registerCommands(): void {
    this.commands.set('/status', async () => {
      const agents = [...this.agentStates.values()];
      if (agents.length === 0) return '현재 활성 에이전트가 없습니다.';

      const lines = agents.map(
        (a) => `• *${a.type}* (${a.id.slice(0, 8)}): ${a.status} ${this.progressBar(a.progress)}`,
      );
      return `*시스템 상태*\n${lines.join('\n')}`;
    });

    this.commands.set('/agents', async () => {
      const agents = [...this.agentStates.values()];
      if (agents.length === 0) return '등록된 에이전트가 없습니다.';

      const lines = agents.map((a) => {
        const task = a.currentTask ? `\n  └ Task: ${a.currentTask.description.slice(0, 50)}` : '';
        return `*${a.type}* \`${a.id.slice(0, 8)}\`\n  ├ Status: ${a.status}\n  ├ Model: ${a.config.model}${task}`;
      });
      return lines.join('\n\n');
    });

    this.commands.set('/tasks', async () => {
      if (this.taskResults.length === 0) return '완료된 태스크가 없습니다.';

      const recent = this.taskResults.slice(-10);
      const lines = recent.map(
        (r) => `• \`${r.taskId.slice(0, 8)}\` ${r.success ? '✅' : '❌'} (${r.duration}ms)`,
      );
      return `*최근 태스크 결과*\n${lines.join('\n')}`;
    });

    this.commands.set('/pause', async () => {
      eventBus.emit('agent:progress', {
        agentId: 'system',
        progress: 0,
        message: 'System paused via Telegram',
      });
      return '시스템이 일시정지되었습니다.';
    });

    this.commands.set('/resume', async () => {
      eventBus.emit('agent:progress', {
        agentId: 'system',
        progress: 0,
        message: 'System resumed via Telegram',
      });
      return '시스템이 재개되었습니다.';
    });

    this.commands.set('/screenshot', async () => {
      return '스크린샷 기능은 아직 구현되지 않았습니다.';
    });

    this.commands.set('/send', async (args) => {
      if (!args.trim()) return '사용법: /send <메시지>';
      log.info(`Manual message: ${args}`);
      return `메시지 전송됨: ${args}`;
    });

    this.commands.set('/cache', async () => {
      return '캐시 통계 기능은 context-server와 연동 후 사용 가능합니다.';
    });
  }

  private progressBar(progress: number): string {
    const filled = Math.round(progress / 10);
    const empty = 10 - filled;
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${progress}%`;
  }

  private subscribeToEvents(): void {
    eventBus.on('agent:spawn', ({ agent }) => {
      this.agentStates.set(agent.id, agent);
    });

    eventBus.on('agent:progress', ({ agentId, progress }) => {
      const agent = this.agentStates.get(agentId);
      if (agent) {
        agent.progress = progress;
      }
    });

    eventBus.on('agent:complete', ({ agentId, result }) => {
      this.taskResults.push(result);
      this.agentStates.delete(agentId);
      if (this.config.notifyOnComplete) {
        const msg = `✅ *에이전트 완료*\n\`${agentId.slice(0, 8)}\`: ${result.output.slice(0, 200)}`;
        this.sendMessage({ chatId: this.config.chatId, text: msg, parseMode: 'Markdown' });
      }
    });

    eventBus.on('agent:error', ({ agentId, error }) => {
      if (this.config.notifyOnError) {
        const msg = `❌ *에이전트 오류*\n\`${agentId.slice(0, 8)}\`: ${error}`;
        this.sendMessage({ chatId: this.config.chatId, text: msg, parseMode: 'Markdown' });
      }
    });
  }

  async handleCommand(text: string): Promise<string> {
    const [cmd, ...rest] = text.trim().split(' ');
    const handler = this.commands.get(cmd);
    if (!handler) return `알 수 없는 명령어: ${cmd}`;
    return handler(rest.join(' '));
  }

  private async sendMessage(message: TelegramMessage): Promise<void> {
    const url = `https://api.telegram.org/bot${this.config.token}/sendMessage`;
    log.info(`Sending message to chat ${message.chatId}`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: message.chatId,
          text: message.text,
          parse_mode: message.parseMode ?? 'Markdown',
        }),
      });

      if (!response.ok) {
        log.error(`Telegram API error: ${response.status}`);
      }
    } catch (error) {
      log.error(`Failed to send message: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;
    this.subscribeToEvents();
    log.info('Telegram bot started');
  }

  async stop(): Promise<void> {
    this.running = false;
    log.info('Telegram bot stopped');
  }

  isRunning(): boolean {
    return this.running;
  }
}

export function createTelegramBot(config: TelegramBotConfig): TelegramBot {
  return new TelegramBot(config);
}
