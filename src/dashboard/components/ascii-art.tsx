import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { retroColors } from '../theme.js';

const frames = [
  { lines: [{ text: '    · · ·', color: retroColors.slate }] },
  {
    lines: [{ text: '  ░▒▓█ LOADING █▓▒░', color: retroColors.cyan }],
  },
  {
    lines: [
      { text: '  ╔══════════════════════════════════╗', color: retroColors.white },
      { text: '  ║  ◆ oh-my-gemini-cli ◆          ║', color: retroColors.pink },
      { text: '  ║  ░▒▓ CONTEXT QUEST v0.1.1 ▓▒░  ║', color: retroColors.cyan },
      { text: '  ╚══════════════════════════════════╝', color: retroColors.white },
    ],
  },
  {
    lines: [
      { text: '  ╔══════════════════════════════════╗', color: retroColors.white },
      { text: '  ║  ◆ oh-my-gemini-cli ◆          ║', color: retroColors.pink },
      { text: '  ║  ░▒▓ CONTEXT QUEST v0.1.1 ▓▒░  ║', color: retroColors.cyan },
      { text: '  ║                                  ║', color: retroColors.white },
      { text: '  ║  ★ Gemini thinks. OmG orchestrates. ★   ║', color: retroColors.gold },
      { text: '  ╚══════════════════════════════════╝', color: retroColors.white },
      { text: '       PRESS ANY KEY TO START', color: retroColors.slate },
    ],
  },
];

interface AsciiArtProps {
  onComplete?: () => void;
}

export function AsciiArt({ onComplete }: AsciiArtProps) {
  const [frameIdx, setFrameIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    if (frameIdx >= frames.length - 1) {
      const blinkTimer = setInterval(() => setBlink((b) => !b), 500);
      const hideTimer = setTimeout(() => {
        clearInterval(blinkTimer);
        setVisible(false);
        onComplete?.();
      }, 3000);
      return () => {
        clearInterval(blinkTimer);
        clearTimeout(hideTimer);
      };
    }

    const timer = setTimeout(() => setFrameIdx((p) => p + 1), 500);
    return () => clearTimeout(timer);
  }, [frameIdx, onComplete]);

  if (!visible) return null;

  const current = frames[frameIdx];
  const isLastFrame = frameIdx === frames.length - 1;

  return (
    <Box flexDirection="column" alignItems="center" paddingY={1}>
      {current.lines.map((line, i) => {
        const isPromptLine = isLastFrame && i === current.lines.length - 1;
        return (
          <Text
            key={i}
            color={line.color}
            bold={line.color === retroColors.pink}
            dimColor={isPromptLine && !blink}
          >
            {line.text}
          </Text>
        );
      })}
    </Box>
  );
}
