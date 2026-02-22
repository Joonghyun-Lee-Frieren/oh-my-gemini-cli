import { createHash } from 'node:crypto';
import { logger } from '../shared/logger.js';

export interface PrefixValidation {
  stable: boolean;
  breakpoint?: string;
  currentHash: string;
  previousHash?: string;
}

export interface PrefixChange {
  type: 'tool_addition' | 'prompt_modification' | 'system_change' | 'unknown';
  description: string;
  suggestion: string;
}

function hashContent(content: string): string {
  return createHash('sha256').update(content).digest('hex').slice(0, 16);
}

function findFirstDifference(a: string, b: string): number {
  const minLen = Math.min(a.length, b.length);
  for (let i = 0; i < minLen; i++) {
    if (a[i] !== b[i]) return i;
  }
  return minLen < Math.max(a.length, b.length) ? minLen : -1;
}

function classifyChange(current: string, previous: string): PrefixChange {
  const diffPos = findFirstDifference(current, previous);
  if (diffPos === -1) {
    return { type: 'unknown', description: 'No difference found', suggestion: '' };
  }

  const context = current.slice(Math.max(0, diffPos - 50), diffPos + 50);

  if (context.includes('tool') || context.includes('function') || context.includes('mcp')) {
    return {
      type: 'tool_addition',
      description: `Tool definition changed near position ${diffPos}`,
      suggestion: 'Move tool updates to session context via system_reminder instead of modifying the prefix',
    };
  }

  if (context.includes('prompt') || context.includes('instruction') || context.includes('system')) {
    return {
      type: 'prompt_modification',
      description: `Prompt content changed near position ${diffPos}`,
      suggestion: 'Use addSessionContext() to append updates without breaking the cached prefix',
    };
  }

  return {
    type: 'unknown',
    description: `Content changed at position ${diffPos}`,
    suggestion: 'Consider using <system_reminder> tags to inject updates into the conversation layer',
  };
}

export function validatePrefix(current: string, previous?: string): PrefixValidation {
  const currentHash = hashContent(current);

  if (!previous) {
    return { stable: true, currentHash };
  }

  const previousHash = hashContent(previous);
  const stable = currentHash === previousHash;

  if (!stable) {
    const change = classifyChange(current, previous);
    logger.warn(`Prefix instability detected: ${change.type}`);
    logger.warn(`  ${change.description}`);
    logger.warn(`  Suggestion: ${change.suggestion}`);

    return {
      stable: false,
      breakpoint: change.description,
      currentHash,
      previousHash,
    };
  }

  return { stable: true, currentHash, previousHash };
}

export function detectBreakingChanges(
  currentPrefix: string,
  previousPrefix: string,
): PrefixChange[] {
  if (currentPrefix === previousPrefix) return [];

  const changes: PrefixChange[] = [];
  const change = classifyChange(currentPrefix, previousPrefix);
  changes.push(change);

  const sizeDiff = currentPrefix.length - previousPrefix.length;
  if (Math.abs(sizeDiff) > 1000) {
    changes.push({
      type: 'system_change',
      description: `Significant size change: ${sizeDiff > 0 ? '+' : ''}${sizeDiff} chars`,
      suggestion: 'Large prefix changes will invalidate the entire prompt cache. Consider incremental updates.',
    });
  }

  return changes;
}

export function suggestSystemReminder(update: string): string {
  return `<system_reminder>\n${update}\n</system_reminder>`;
}

export class PrefixTracker {
  private history: Array<{ hash: string; size: number; timestamp: number }> = [];

  record(prefix: string): void {
    this.history.push({
      hash: hashContent(prefix),
      size: prefix.length,
      timestamp: Date.now(),
    });

    if (this.history.length > 100) {
      this.history = this.history.slice(-50);
    }
  }

  getStabilityRate(): number {
    if (this.history.length < 2) return 100;

    let stableTransitions = 0;
    for (let i = 1; i < this.history.length; i++) {
      if (this.history[i].hash === this.history[i - 1].hash) {
        stableTransitions++;
      }
    }

    return (stableTransitions / (this.history.length - 1)) * 100;
  }

  getHistory(): ReadonlyArray<{ hash: string; size: number; timestamp: number }> {
    return this.history;
  }
}
