import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { colors } from '../theme.js';

interface HeaderProps {
  projectName?: string;
  version?: string;
  activeAgentCount: number;
}

function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60000) % 60;
  const h = Math.floor(ms / 3600000);
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

export function Header({
  projectName = 'oh-my-gemini-cli',
  version = '0.1.0',
  activeAgentCount,
}: HeaderProps) {
  const [elapsed, setElapsed] = useState(0);
  const [startTime] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  return (
    <Box
      borderStyle="round"
      borderColor={colors.primary}
      paddingX={1}
      justifyContent="space-between"
    >
      <Box gap={1}>
        <Text bold color={colors.primary}>
          ✦ {projectName}
        </Text>
        <Text dimColor>v{version}</Text>
      </Box>
      <Box gap={2}>
        <Text>
          <Text dimColor>elapsed:</Text>
          <Text color={colors.secondary}> {formatElapsed(elapsed)}</Text>
        </Text>
        <Text>
          <Text dimColor>agents:</Text>
          <Text color={activeAgentCount > 0 ? colors.success : colors.muted}>
            {' '}
            {activeAgentCount}
          </Text>
        </Text>
      </Box>
    </Box>
  );
}
