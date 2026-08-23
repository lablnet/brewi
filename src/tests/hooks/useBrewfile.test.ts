/**
 * useBrewfile.test.ts
 *
 * Unit tests for the useBrewfile hook.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { invoke } from '@tauri-apps/api/core';
import { useBrewfile } from '../../hooks/useBrewfile';

const mockInvoke = vi.mocked(invoke);

describe('useBrewfile', () => {
  beforeEach(() => {
    mockInvoke.mockClear();
    localStorage.clear();
  });

  it('initialises with cached content if available in localStorage', () => {
    localStorage.setItem('brewi_brewfile_cache', 'brew "wget"');
    const { result } = renderHook(() => useBrewfile());

    expect(result.current.content).toBe('brew "wget"');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('exportBrewfile fetches brewfile content and stores in cache', async () => {
    mockInvoke.mockResolvedValueOnce('brew "git"\ncask "firefox"');
    const { result } = renderHook(() => useBrewfile());

    await act(async () => {
      await result.current.exportBrewfile();
    });

    expect(mockInvoke).toHaveBeenCalledWith('export_brewfile');
    expect(result.current.content).toBe('brew "git"\ncask "firefox"');
    expect(localStorage.getItem('brewi_brewfile_cache')).toBe('brew "git"\ncask "firefox"');
    expect(result.current.loading).toBe(false);
  });

  it('exportBrewfile handles errors gracefully', async () => {
    mockInvoke.mockRejectedValueOnce(new Error('export failed'));
    const { result } = renderHook(() => useBrewfile());

    await act(async () => {
      await result.current.exportBrewfile();
    });

    expect(result.current.error).toContain('export failed');
    expect(result.current.loading).toBe(false);
  });

  it('saveToFile invokes save_brewfile_to_file with current content', async () => {
    mockInvoke.mockResolvedValueOnce('brew "git"\ncask "firefox"');
    const { result } = renderHook(() => useBrewfile());

    await act(async () => {
      await result.current.exportBrewfile();
    });

    mockInvoke.mockResolvedValueOnce('/Users/test/Brewfile');

    await act(async () => {
      const path = await result.current.saveToFile('/Users/test/Brewfile');
      expect(path).toBe('/Users/test/Brewfile');
    });

    expect(mockInvoke).toHaveBeenCalledWith('save_brewfile_to_file', {
      path: '/Users/test/Brewfile',
      content: 'brew "git"\ncask "firefox"',
    });
    expect(result.current.savedPath).toBe('/Users/test/Brewfile');
  });

  it('copyToClipboard copies content to clipboard and sets copied flag', async () => {
    mockInvoke.mockResolvedValueOnce('brew "curl"');
    const { result } = renderHook(() => useBrewfile());

    await act(async () => {
      await result.current.exportBrewfile();
    });

    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextSpy,
      },
    });

    act(() => {
      result.current.copyToClipboard();
    });

    expect(writeTextSpy).toHaveBeenCalledWith('brew "curl"');
    expect(result.current.copied).toBe(true);
  });
});
