import React from 'react';
import { Text } from 'ink';
import { progressChars, retroColors } from '../theme.js';

interface ProgressBarProps {
  percent: number;
  width?: number;
  label?: string;
  color?: string;
}

function autoColor(percent: number): string {
  if (percent > 60) return retroColors.green;
  if (percent > 30) return retroColors.gold;
  return retroColors.red;
}

export function ProgressBar({ percent, width = 10, label, color }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const filled = Math.floor((clamped / 100) * width);
  const hasHalf = (clamped / 100) * width - filled >= 0.5;
  const empty = width - filled - (hasHalf ? 1 : 0);
  const barColor = color ?? autoColor(clamped);

  const bar =
    progressChars.filled.repeat(filled) +
    (hasHalf ? progressChars.half : '') +
    progressChars.empty.repeat(empty);

  const pctText = `${Math.round(clamped)}%`.padStart(4);

  return (
    <Text>
      {label && <Text color={retroColors.dim}>{label} </Text>}
      <Text color={barColor}>{bar}</Text>
      <Text color={retroColors.slate}> {pctText}</Text>
    </Text>
  );
}
