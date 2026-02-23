import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { retroColors, type DashboardRenderMode } from '../theme.js';
import { fitByWidth } from '../utils/display-width.js';

interface HeaderProps {
  projectName?: string;
  version?: string;
  activeAgentCount: number;
  totalAgentCount?: number;
  renderMode: DashboardRenderMode;
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
  renderMode,
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

  const partyGauge = renderMode === 'retro'
    ? '♦'.repeat(activeAgentCount) + '○'.repeat(Math.max(0, totalAgentCount - activeAgentCount))
    : '#'.repeat(activeAgentCount) + '-'.repeat(Math.max(0, totalAgentCount - activeAgentCount));
  const innerWidth = 74;
  const cursor = blink ? (renderMode === 'retro' ? '▸' : '>') : '';
  const title = renderMode === 'retro' ? '◆ OMG ◆' : 'OMG';
  const headerText = `${title} | TIME ${formatGameTimer(elapsed)} | PARTY [${partyGauge}] ${activeAgentCount}/${totalAgentCount} ${cursor}`;
  const horizontal = renderMode === 'retro' ? '═' : '-';
  const left = renderMode === 'retro' ? '╔' : '+';
  const right = renderMode === 'retro' ? '╗' : '+';
  const v = renderMode === 'retro' ? '║' : '|';
  const topBottom = `${left}${horizontal.repeat(innerWidth)}${right}`;
  const middle = `${v}${fitByWidth(headerText, innerWidth)}${v}`;

  return (
    <Box flexDirection="column">
      <Text color={retroColors.purple}>{topBottom}</Text>
      <Text color={retroColors.white}>{middle}</Text>
      <Text color={retroColors.purple}>{topBottom}</Text>
    </Box>
  );
}
