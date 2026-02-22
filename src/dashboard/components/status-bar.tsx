import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../theme.js';

interface StatusBarProps {
  cacheHitRate?: number;
  tokenUsage?: number;
  costEstimate?: number;
}

export function StatusBar({ cacheHitRate = 0, tokenUsage = 0, costEstimate = 0 }: StatusBarProps) {
  return (
    <Box
      borderStyle="round"
      borderColor={colors.border}
      paddingX={1}
      justifyContent="space-between"
    >
      <Box gap={2}>
        <Text>
          <Text dimColor>cache:</Text>
          <Text color={cacheHitRate > 70 ? 'green' : cacheHitRate > 30 ? 'yellow' : 'red'}>
            {' '}
            {cacheHitRate.toFixed(0)}%
          </Text>
        </Text>
        <Text>
          <Text dimColor>tokens:</Text>
          <Text color={colors.secondary}> {tokenUsage.toLocaleString()}</Text>
        </Text>
        <Text>
          <Text dimColor>cost:</Text>
          <Text color={colors.warning}> ${costEstimate.toFixed(4)}</Text>
        </Text>
      </Box>
      <Box gap={1}>
        <Text dimColor>
          [q]<Text color={colors.muted}>quit</Text> [p]<Text color={colors.muted}>pause</Text> [r]
          <Text color={colors.muted}>resume</Text> [d]<Text color={colors.muted}>detail</Text> [t]
          <Text color={colors.muted}>tg-sync</Text>
        </Text>
      </Box>
    </Box>
  );
}
