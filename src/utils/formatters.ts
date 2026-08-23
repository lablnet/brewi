/**
 * Utility functions for cleaning and formatting values across the UI.
 */

export const cleanVersion = (v?: string | null): string => {
  if (!v) return '';
  return v.split(',')[0].trim();
};

export const formatArch = (arch?: string): string => {
  if (!arch) return '';
  if (arch === 'aarch64' || arch === 'arm64') return 'ARM64 (Apple Silicon)';
  if (arch === 'x86_64' || arch === 'x86') return 'Intel (x86_64)';
  return arch;
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
