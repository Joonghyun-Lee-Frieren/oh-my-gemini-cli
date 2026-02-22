import { createLogger } from '../shared/logger.js';
import { eventBus } from '../shared/event-bus.js';
import type { Agent, TaskResult } from '../agents/types.js';

const log = createLogger('bot:discord');

export interface DiscordBotConfig {
  token: string;
  channelId: string;
  notifyOnComplete?: boolean;
  notifyOnError?: boolean;
}

export interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
  fields: Array<{ name: string; value: string; inline?: boolean }>;
  timestamp?: string;
}

type CommandHandler = (args: string) => Promise<DiscordEmbed>;

const COLORS = {
  success: 0x00ff00,
  error: 0xff0000,
  info: 0x0099ff,
  warning: 0xffcc00,
  neutral: 0x95a5a6,
} as const;

export class DiscordBot {
  private config: DiscordBotConfig;
  private commands: Map<string, CommandHandler> = new Map();
  private running = false;
  private agentStates: Map<string, Agent> = new Map();
  private taskResults: TaskResult[] = [];

  constructor(config: DiscordBotConfig) {
    this.config = { notifyOnComplete: true, notifyOnError: true, ...config };
    this.registerCommands();
  }

  private registerCommands(): void {
    this.commands.set('/status', async (): Promise<DiscordEmbed> => {
      const agents = [...this.agentStates.values()];
      const running = agents.filter((a) => a.status === 'running');
      const idle = agents.filter((a) => a.status === 'idle');

      return {
        title: '시스템 상태',
        description: agents.length === 0 ? '현재 활성 에이전트가 없습니다.' : `${agents.length}개 에이전트 등록됨`,
        color: running.length > 0 ? COLORS.success : COLORS.neutral,
        fields: [
          { name: '실행 중', value: String(running.length), inline: true },
          { name: '대기 중', value: String(idle.length), inline: true },
          { name: '완료 태스크', value: String(this.taskResults.length), inline: true },
        ],
        timestamp: new Date().toISOString(),
      };
    });

    this.commands.set('/agents', async (): Promise<DiscordEmbed> => {
      const agents = [...this.agentStates.values()];

      return {
        title: '에이전트 목록',
        description: agents.length === 0 ? '등록된 에이전트가 없습니다.' : '',
        color: COLORS.info,
        fields: agents.map((a) => ({
          name: `${a.type} (${a.id.slice(0, 8)})`,
          value: `상태: ${a.status}\n모델: ${a.config.model}\n진행률: ${this.progressBar(a.progress)}`,
          inline: true,
        })),
        timestamp: new Date().toISOString(),
      };
    });

    this.commands.set('/tasks', async (): Promise<DiscordEmbed> => {
      const recent = this.taskResults.slice(-10);

      return {
        title: '최근 태스크 결과',
        description: recent.length === 0 ? '완료된 태스크가 없습니다.' : '',
        color: COLORS.info,
        fields: recent.map((r) => ({
          name: `${r.success ? '✅' : '❌'} ${r.taskId.slice(0, 8)}`,
          value: `소요 시간: ${r.duration}ms\n${r.output.slice(0, 100)}`,
        })),
        timestamp: new Date().toISOString(),
      };
    });

    this.commands.set('/pause', async (): Promise<DiscordEmbed> => {
      eventBus.emit('agent:progress', {
        agentId: 'system',
        progress: 0,
        message: 'System paused via Discord',
      });
      return {
        title: '시스템 일시정지',
        description: '모든 에이전트가 일시정지되었습니다.',
        color: COLORS.warning,
        fields: [],
        timestamp: new Date().toISOString(),
      };
    });

    this.commands.set('/resume', async (): Promise<DiscordEmbed> => {
      eventBus.emit('agent:progress', {
        agentId: 'system',
        progress: 0,
        message: 'System resumed via Discord',
      });
      return {
        title: '시스템 재개',
        description: '모든 에이전트가 재개되었습니다.',
        color: COLORS.success,
        fields: [],
        timestamp: new Date().toISOString(),
      };
    });

    this.commands.set('/screenshot', async (): Promise<DiscordEmbed> => ({
      title: '스크린샷',
      description: '스크린샷 기능은 아직 구현되지 않았습니다.',
      color: COLORS.neutral,
      fields: [],
    }));

    this.commands.set('/send', async (args): Promise<DiscordEmbed> => {
      if (!args.trim()) {
        return {
          title: '사용법',
          description: '/send <메시지>',
          color: COLORS.neutral,
          fields: [],
        };
      }
      log.info(`Manual message: ${args}`);
      return {
        title: '메시지 전송',
        description: `전송됨: ${args}`,
        color: COLORS.success,
        fields: [],
      };
    });

    this.commands.set('/cache', async (): Promise<DiscordEmbed> => ({
      title: '캐시 통계',
      description: 'context-server와 연동 후 사용 가능합니다.',
      color: COLORS.neutral,
      fields: [],
    }));
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
        this.sendEmbed({
          title: '✅ 에이전트 완료',
          description: result.output.slice(0, 200),
          color: COLORS.success,
          fields: [
            { name: '에이전트 ID', value: agentId.slice(0, 8), inline: true },
            { name: '소요 시간', value: `${result.duration}ms`, inline: true },
          ],
          timestamp: new Date().toISOString(),
        });
      }
    });

    eventBus.on('agent:error', ({ agentId, error }) => {
      if (this.config.notifyOnError) {
        this.sendEmbed({
          title: '❌ 에이전트 오류',
          description: error,
          color: COLORS.error,
          fields: [{ name: '에이전트 ID', value: agentId.slice(0, 8), inline: true }],
          timestamp: new Date().toISOString(),
        });
      }
    });
  }

  async handleCommand(text: string): Promise<DiscordEmbed> {
    const [cmd, ...rest] = text.trim().split(' ');
    const handler = this.commands.get(cmd);
    if (!handler) {
      return {
        title: '오류',
        description: `알 수 없는 명령어: ${cmd}`,
        color: COLORS.error,
        fields: [],
      };
    }
    return handler(rest.join(' '));
  }

  private async sendEmbed(embed: DiscordEmbed): Promise<void> {
    const url = `https://discord.com/api/v10/channels/${this.config.channelId}/messages`;
    log.info(`Sending embed to channel ${this.config.channelId}: ${embed.title}`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bot ${this.config.token}`,
        },
        body: JSON.stringify({ embeds: [embed] }),
      });

      if (!response.ok) {
        log.error(`Discord API error: ${response.status}`);
      }
    } catch (error) {
      log.error(`Failed to send embed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;
    this.subscribeToEvents();
    log.info('Discord bot started');
  }

  async stop(): Promise<void> {
    this.running = false;
    log.info('Discord bot stopped');
  }

  isRunning(): boolean {
    return this.running;
  }
}

export function createDiscordBot(config: DiscordBotConfig): DiscordBot {
  return new DiscordBot(config);
}
