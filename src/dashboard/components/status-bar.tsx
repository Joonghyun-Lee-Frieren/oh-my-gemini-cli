import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { retroColors, progressChars } from '../theme.js';

interface StatusBarProps {
  cacheHitRate?: number;
  tokenUsage?: number;
  costEstimate?: number;
}

function miniBar(percent: number, width: number = 6): string {
  const clamped = Math.max(0, Math.min(100, percent));
  const filled = Math.round((clamped / 100) * width);
  const empty = width - filled;
  return progressChars.filled.repeat(filled) + progressChars.empty.repeat(empty);
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function StatusBar({ cacheHitRate = 0, tokenUsage = 0, costEstimate = 0 }: StatusBarProps) {
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setBlink((b) => !b), 700);
    return () => clearInterval(timer);
  }, []);

  const cacheColor = cacheHitRate > 60 ? retroColors.green : cacheHitRate > 30 ? retroColors.gold : retroColors.red;

  return (
    <Box flexDirection="column">
      <Text color={retroColors.purple}>═══════════════════════════════════════════════════════════════════════════</Text>
      <Box justifyContent="space-between" paddingX={1}>
        <Box gap={2}>
          <Text>
            <Text color={retroColors.slate}>CACHE </Text>
            <Text color={cacheColor}>{miniBar(cacheHitRate)}</Text>
            <Text color={cacheColor}> {cacheHitRate.toFixed(0)}%</Text>
          </Text>
          <Text>
            <Text color={retroColors.slate}>TOKENS </Text>
            <Text color={retroColors.cyan}>{formatTokens(tokenUsage)}/1M</Text>
          </Text>
          <Text>
            <Text color={retroColors.slate}>GOLD </Text>
            <Text color={retroColors.gold}>-${costEstimate.toFixed(2)}</Text>
          </Text>
        </Box>
        <Box gap={1}>
          <Text color={retroColors.dim}>
            <Text color={blink ? retroColors.cyan : retroColors.dim}>▸</Text>
            {' '}
            <Text color={retroColors.pink}>A</Text>:quit{' '}
            <Text color={retroColors.pink}>B</Text>:pause{' '}
            <Text color={retroColors.pink}>X</Text>:resume{' '}
            <Text color={retroColors.pink}>Y</Text>:detail{' '}
            <Text color={retroColors.pink}>SELECT</Text>:tg-sync
          </Text>
        </Box>
      </Box>
      <Text color={retroColors.purple}>═══════════════════════════════════════════════════════════════════════════</Text>
    </Box>
  );
}
