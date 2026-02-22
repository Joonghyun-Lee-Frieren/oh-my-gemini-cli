import React from 'react';
import { Text } from 'ink';
import { progressChars } from '../theme.js';

interface ProgressBarProps {
  percent: number;
  width?: number;
  label?: string;
  color?: string;
}

export function ProgressBar({ percent, width = 8, label, color = 'cyan' }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const filled = Math.round((clamped / 100) * width);
  const empty = width - filled;

  const bar = progressChars.filled.repeat(filled) + progressChars.empty.repeat(empty);
  const pctText = `${Math.round(clamped)}%`.padStart(4);

  return (
    <Text>
      {label && <Text dimColor>{label} </Text>}
      <Text color={color}>{bar}</Text>
      <Text dimColor> {pctText}</Text>
    </Text>
  );
}
