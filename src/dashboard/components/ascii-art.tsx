import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { colors } from '../theme.js';

const logoFrames = [
  [
    '  ___  __  __  ___  ',
    ' / _ \\|  \\/  |/ __| ',
    '| (_) | |\\/| | (_ | ',
    ' \\___/|_|  |_|\\___| ',
  ],
  [
    '  ___  __  __  ___  ',
    ' / _ \\|  \\/  |/ __| ',
    '| (_) | |\\/| | (_ | ',
    ' \\___/|_|  |_|\\___| ',
    '   oh-my-gemini-cli  ',
  ],
  [
    '  ___  __  __  ___  ',
    ' / _ \\|  \\/  |/ __| ',
    '| (_) | |\\/| | (_ | ',
    ' \\___/|_|  |_|\\___| ',
    '   oh-my-gemini-cli  ',
    '  ✦ context is king  ',
  ],
];

interface AsciiArtProps {
  onComplete?: () => void;
}

export function AsciiArt({ onComplete }: AsciiArtProps) {
  const [frame, setFrame] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (frame >= logoFrames.length - 1) {
      const hideTimer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 2000);
      return () => clearTimeout(hideTimer);
    }

    const timer = setTimeout(() => {
      setFrame((prev) => prev + 1);
    }, 400);
    return () => clearTimeout(timer);
  }, [frame, onComplete]);

  if (!visible) return null;

  const lines = logoFrames[frame];

  return (
    <Box flexDirection="column" alignItems="center" paddingY={1}>
      {lines.map((line, i) => (
        <Text key={i} color={i < 4 ? colors.primary : colors.accent} bold={i < 4}>
          {line}
        </Text>
      ))}
    </Box>
  );
}
