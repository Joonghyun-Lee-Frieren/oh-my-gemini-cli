import { logger } from '../shared/logger.js';
import { cacheManager } from './cache-manager.js';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface CompactionResult {
  messages: Message[];
  compacted: boolean;
  originalCount: number;
  compactedCount: number;
  savedChars: number;
}

const COMPACTION_SUMMARY_PROMPT = `<system_reminder>
The conversation history has been compacted. Below is a summary of the prior context.
Preserve all key decisions, code changes, file paths, and action items.
Continue the conversation naturally from this point.
</system_reminder>`;

function totalSize(messages: Message[]): number {
  return messages.reduce((sum, m) => sum + m.content.length, 0);
}

function buildSummary(messages: Message[]): string {
  const keyPoints: string[] = [];

  for (const msg of messages) {
    if (msg.role === 'system') continue;

    const lines = msg.content.split('\n').filter(l => l.trim());
    if (lines.length <= 3) {
      keyPoints.push(`[${msg.role}]: ${msg.content.trim()}`);
    } else {
      const preview = lines.slice(0, 2).join('\n');
      keyPoints.push(`[${msg.role}]: ${preview}\n  ... (${lines.length} lines)`);
    }
  }

  return keyPoints.join('\n\n');
}

export function compact(
  messages: Message[],
  threshold: number,
  prefixContent?: string,
): CompactionResult {
  const size = totalSize(messages);

  if (size <= threshold) {
    cacheManager.recordHit();
    return {
      messages,
      compacted: false,
      originalCount: messages.length,
      compactedCount: messages.length,
      savedChars: 0,
    };
  }

  logger.info(`Compacting: ${messages.length} messages, ${size} chars exceeds threshold ${threshold}`);
  cacheManager.recordMiss();

  const preserveCount = Math.max(2, Math.floor(messages.length * 0.3));
  const toCompact = messages.slice(0, messages.length - preserveCount);
  const toKeep = messages.slice(messages.length - preserveCount);

  const summary = buildSummary(toCompact);

  const compactionMessage: Message = {
    role: 'system',
    content: `${COMPACTION_SUMMARY_PROMPT}\n\n${summary}`,
    timestamp: Date.now(),
  };

  const result: Message[] = [compactionMessage, ...toKeep];
  const newSize = totalSize(result);

  logger.info(`Compacted: ${messages.length} → ${result.length} messages, saved ${size - newSize} chars`);

  return {
    messages: result,
    compacted: true,
    originalCount: messages.length,
    compactedCount: result.length,
    savedChars: size - newSize,
  };
}

export function shouldCompact(messages: Message[], threshold: number): boolean {
  return totalSize(messages) > threshold;
}

export function compactWithPrefix(
  messages: Message[],
  threshold: number,
  prefix: string,
): CompactionResult {
  const prefixSize = prefix.length;
  const adjustedThreshold = Math.max(0, threshold - prefixSize);

  logger.debug(`Prefix-aware compaction: prefix=${prefixSize}, adjusted threshold=${adjustedThreshold}`);
  return compact(messages, adjustedThreshold, prefix);
}
