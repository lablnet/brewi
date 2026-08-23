import { describe, it, expect } from 'vitest';
import { stripAnsi } from '../../utils/ansi';

describe('ansi utility', () => {
  it('strips ANSI color escape sequences', () => {
    const raw = '\u001b[31mError:\u001b[0m Failed to fetch package';
    expect(stripAnsi(raw)).toBe('Error: Failed to fetch package');
  });

  it('leaves clean text untouched', () => {
    const raw = '==> Installing wget 1.25.0';
    expect(stripAnsi(raw)).toBe('==> Installing wget 1.25.0');
  });
});
