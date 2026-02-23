const ANSI_REGEX = /\u001B\[[0-9;]*m/g;

function isControl(codePoint: number): boolean {
  return (codePoint >= 0 && codePoint < 32) || (codePoint >= 0x7f && codePoint < 0xa0);
}

function isCombining(codePoint: number): boolean {
  return (
    (codePoint >= 0x0300 && codePoint <= 0x036f) ||
    (codePoint >= 0x1ab0 && codePoint <= 0x1aff) ||
    (codePoint >= 0x1dc0 && codePoint <= 0x1dff) ||
    (codePoint >= 0x20d0 && codePoint <= 0x20ff) ||
    (codePoint >= 0xfe20 && codePoint <= 0xfe2f)
  );
}

function isWide(codePoint: number): boolean {
  return (
    (codePoint >= 0x1100 && codePoint <= 0x115f) ||
    (codePoint >= 0x2329 && codePoint <= 0x232a) ||
    (codePoint >= 0x2e80 && codePoint <= 0xa4cf) ||
    (codePoint >= 0xac00 && codePoint <= 0xd7a3) ||
    (codePoint >= 0xf900 && codePoint <= 0xfaff) ||
    (codePoint >= 0xfe10 && codePoint <= 0xfe19) ||
    (codePoint >= 0xfe30 && codePoint <= 0xfe6f) ||
    (codePoint >= 0xff00 && codePoint <= 0xff60) ||
    (codePoint >= 0xffe0 && codePoint <= 0xffe6) ||
    (codePoint >= 0x1f300 && codePoint <= 0x1f64f) ||
    (codePoint >= 0x1f900 && codePoint <= 0x1f9ff)
  );
}

function charWidth(char: string): number {
  const codePoint = char.codePointAt(0);
  if (codePoint === undefined) return 0;
  if (isControl(codePoint) || isCombining(codePoint)) return 0;
  return isWide(codePoint) ? 2 : 1;
}

export function stringDisplayWidth(input: string): number {
  const stripped = input.replace(ANSI_REGEX, '');
  let width = 0;
  for (const char of stripped) {
    width += charWidth(char);
  }
  return width;
}

export function truncateByWidth(input: string, maxWidth: number, ellipsis: string = '...'): string {
  if (maxWidth <= 0) return '';
  if (stringDisplayWidth(input) <= maxWidth) return input;

  const ellipsisWidth = stringDisplayWidth(ellipsis);
  const target = Math.max(0, maxWidth - ellipsisWidth);

  let result = '';
  let width = 0;
  for (const char of input) {
    const w = charWidth(char);
    if (width + w > target) break;
    result += char;
    width += w;
  }

  if (target === 0) return truncateByWidth(ellipsis, maxWidth, '');
  return result + ellipsis;
}

export function padByWidth(input: string, targetWidth: number): string {
  const current = stringDisplayWidth(input);
  if (current >= targetWidth) return input;
  return input + ' '.repeat(targetWidth - current);
}

export function fitByWidth(input: string, width: number): string {
  return padByWidth(truncateByWidth(input, width), width);
}
