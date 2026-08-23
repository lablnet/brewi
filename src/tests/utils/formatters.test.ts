import { describe, it, expect } from 'vitest';
import { cleanVersion, formatArch, formatBytes } from '../../utils/formatters';

describe('formatters utility', () => {
  describe('cleanVersion', () => {
    it('returns empty string for null or undefined', () => {
      expect(cleanVersion(null)).toBe('');
      expect(cleanVersion(undefined)).toBe('');
      expect(cleanVersion('')).toBe('');
    });

    it('returns first element before comma', () => {
      expect(cleanVersion('1.2.3, 1.2.4')).toBe('1.2.3');
      expect(cleanVersion('2.47.0')).toBe('2.47.0');
    });
  });

  describe('formatArch', () => {
    it('returns empty string for missing arch', () => {
      expect(formatArch(undefined)).toBe('');
      expect(formatArch('')).toBe('');
    });

    it('formats ARM64 / Apple Silicon', () => {
      expect(formatArch('aarch64')).toBe('ARM64 (Apple Silicon)');
      expect(formatArch('arm64')).toBe('ARM64 (Apple Silicon)');
    });

    it('formats Intel x86_64', () => {
      expect(formatArch('x86_64')).toBe('Intel (x86_64)');
      expect(formatArch('x86')).toBe('Intel (x86_64)');
    });

    it('returns raw string for custom architecture', () => {
      expect(formatArch('riscv64')).toBe('riscv64');
    });
  });

  describe('formatBytes', () => {
    it('formats 0 bytes', () => {
      expect(formatBytes(0)).toBe('0 B');
    });

    it('formats bytes, kilobytes, megabytes, gigabytes', () => {
      expect(formatBytes(500)).toBe('500 B');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(1073741824)).toBe('1 GB');
    });
  });
});
