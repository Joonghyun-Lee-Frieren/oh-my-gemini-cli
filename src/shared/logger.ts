import { appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { LOGS_DIR } from './config.js';
import { eventBus } from './event-bus.js';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LEVEL_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[90m',
  info: '\x1b[36m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
};

const RESET = '\x1b[0m';

class Logger {
  private minLevel: LogLevel = 'info';
  private logFile: string | null = null;

  setLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  enableFileLogging(projectRoot: string): void {
    const logsDir = resolve(projectRoot, LOGS_DIR);
    if (!existsSync(logsDir)) {
      mkdirSync(logsDir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.logFile = join(logsDir, `omg-${timestamp}.log`);
  }

  debug(message: string, ...args: unknown[]): void {
    this.log('debug', message, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.log('warn', message, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    this.log('error', message, ...args);
  }

  private log(level: LogLevel, message: string, ...args: unknown[]): void {
    if (LEVEL_ORDER[level] < LEVEL_ORDER[this.minLevel]) return;

    const timestamp = new Date().toISOString();
    const color = LEVEL_COLORS[level];
    const tag = level.toUpperCase().padEnd(5);

    const formatted = args.length > 0
      ? `${message} ${args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ')}`
      : message;

    eventBus.emit('system:log', {
      level,
      source: 'omg',
      message: formatted,
      timestamp: Date.now(),
    });
    console.error(`${color}[${tag}]${RESET} ${formatted}`);

    if (this.logFile) {
      appendFileSync(this.logFile, `[${timestamp}] [${tag}] ${formatted}\n`);
    }
  }
}

export const logger = new Logger();

export function createLogger(source: string) {
  const prefix = `[${source}]`;
  return {
    debug(message: string, ...args: unknown[]) {
      logger.debug(`${prefix} ${message}`, ...args);
    },
    info(message: string, ...args: unknown[]) {
      logger.info(`${prefix} ${message}`, ...args);
    },
    warn(message: string, ...args: unknown[]) {
      logger.warn(`${prefix} ${message}`, ...args);
    },
    error(message: string, ...args: unknown[]) {
      logger.error(`${prefix} ${message}`, ...args);
    },
  };
}
