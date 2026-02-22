import React, { useState, useEffect } from 'react';
import { Text } from 'ink';
import { spinnerFrames } from '../theme.js';

type SpinnerType = keyof typeof spinnerFrames;

interface SpinnerProps {
  active?: boolean;
  type?: SpinnerType;
  color?: string;
}

export function Spinner({ active = true, type = 'pixel', color = '#67e8f9' }: SpinnerProps) {
  const frames = spinnerFrames[type];
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!active) return;

    const timer = setInterval(() => {
      setFrame((prev) => (prev + 1) % frames.length);
    }, 100);

    return () => clearInterval(timer);
  }, [active, frames.length]);

  if (!active) return null;

  return <Text color={color}>{frames[frame]}</Text>;
}
