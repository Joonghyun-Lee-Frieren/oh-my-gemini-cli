import React, { useState, useEffect } from 'react';
import { Text } from 'ink';
import { spinnerFrames } from '../theme.js';

interface SpinnerProps {
  active?: boolean;
  type?: 'braille' | 'dots' | 'line';
  color?: string;
}

export function Spinner({ active = true, type = 'braille', color = 'cyan' }: SpinnerProps) {
  const frames = spinnerFrames[type];
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!active) return;

    const timer = setInterval(() => {
      setFrame((prev) => (prev + 1) % frames.length);
    }, 80);

    return () => clearInterval(timer);
  }, [active, frames.length]);

  if (!active) return null;

  return <Text color={color}>{frames[frame]}</Text>;
}
