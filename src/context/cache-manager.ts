import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getProjectRoot, STATE_DIR, ensureDir } from '../shared/config.js';
import { logger } from '../shared/logger.js';

export interface CacheStats {
  hits: number;
  misses: number;
  lastUpdated: number;
  sessionStart: number;
}

const CACHE_STATS_FILE = 'cache-stats.json';

function getStatsPath(): string {
  return resolve(getProjectRoot(), STATE_DIR, CACHE_STATS_FILE);
}

function loadStatsFromDisk(): CacheStats {
  const path = getStatsPath();
  if (!existsSync(path)) {
    return { hits: 0, misses: 0, lastUpdated: Date.now(), sessionStart: Date.now() };
  }
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    logger.warn('Failed to parse cache stats, resetting');
    return { hits: 0, misses: 0, lastUpdated: Date.now(), sessionStart: Date.now() };
  }
}

function persistStats(stats: CacheStats): void {
  const dir = resolve(getProjectRoot(), STATE_DIR);
  ensureDir(dir);
  const path = getStatsPath();
  stats.lastUpdated = Date.now();
  writeFileSync(path, JSON.stringify(stats, null, 2) + '\n', 'utf-8');
}

class PromptCacheManager {
  private stats: CacheStats;

  constructor() {
    this.stats = loadStatsFromDisk();
  }

  getStats(): Readonly<CacheStats> {
    return { ...this.stats };
  }

  recordHit(): void {
    this.stats.hits++;
    logger.debug(`Cache hit (#${this.stats.hits})`);
    persistStats(this.stats);
  }

  recordMiss(): void {
    this.stats.misses++;
    logger.debug(`Cache miss (#${this.stats.misses})`);
    persistStats(this.stats);
  }

  getHitRate(): number {
    const total = this.stats.hits + this.stats.misses;
    if (total === 0) return 0;
    return (this.stats.hits / total) * 100;
  }

  reset(): void {
    this.stats = { hits: 0, misses: 0, lastUpdated: Date.now(), sessionStart: Date.now() };
    persistStats(this.stats);
  }

  getSummary(): string {
    const rate = this.getHitRate().toFixed(1);
    const total = this.stats.hits + this.stats.misses;
    return `Cache: ${this.stats.hits}/${total} hits (${rate}%)`;
  }
}

export const cacheManager = new PromptCacheManager();
