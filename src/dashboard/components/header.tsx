import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { retroColors } from '../theme.js';

interface HeaderProps {
  projectName?: string;
  version?: string;
  activeAgentCount: number;
  totalAgentCount?: number;
}

function formatGameTimer(ms: number): string {
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60000) % 60;
  const h = Math.floor(ms / 3600000);
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  if (h > 0) return `${String(h).padStart(2, '0')}:${mm}:${ss}`;
  return `${mm}:${ss}`;
}

export function Header({
  activeAgentCount,
  totalAgentCount = 6,
}: HeaderProps) {
  const [elapsed, setElapsed] = useState(0);
  const [startTime] = useState(() => Date.now());
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setElapsed(Date.now() - startTime), 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  useEffect(() => {
    const timer = setInterval(() => setBlink((b) => !b), 600);
    return () => clearInterval(timer);
  }, []);

  const partyDiamonds =
    '♦'.repeat(activeAgentCount) + '○'.repeat(Math.max(0, totalAgentCount - activeAgentCount));

  return (
    <Box flexDirection="column">
      <Text color={retroColors.purple}>╔══════════════════════════════════════════════════════════════════════════╗</Text>
      <Text>
        <Text color={retroColors.purple}>║ </Text>
        <Text color={retroColors.pink} bold>◆ OMG ◆</Text>
        <Text color={retroColors.dim}> │ </Text>
        <Text color={retroColors.cyan}>⏱ TIME </Text>
        <Text color={retroColors.white} bold>{formatGameTimer(elapsed)}</Text>
        <Text color={retroColors.dim}> │ </Text>
        <Text color={retroColors.gold}>PARTY </Text>
        <Text color={retroColors.green}>{partyDiamonds}</Text>
        <Text color={retroColors.slate}> {activeAgentCount}/{totalAgentCount}</Text>
        <Text> </Text>
        <Text color={retroColors.cyan} dimColor={!blink}>▸</Text>
        <Text color={retroColors.purple}> ║</Text>
      </Text>
      <Text color={retroColors.purple}>╚══════════════════════════════════════════════════════════════════════════╝</Text>
    </Box>
  );
}
