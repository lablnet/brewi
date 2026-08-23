/**
 * usePackageSearch.test.ts
 *
 * Unit tests for the usePackageSearch hook.
 * Tests the search flow including empty queries, results parsing, error
 * handling, and the clearSearch reset action.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { invoke } from '@tauri-apps/api/core';
import { usePackageSearch } from '../../hooks/usePackageSearch';
import { PackageSummary } from '../../types';

const mockInvoke = vi.mocked(invoke);

// ─── Fixture data ─────────────────────────────────────────────────────────────

const FORMULA_RESULT: PackageSummary = {
  id: 'formula:wget',
  name: 'wget',
  full_name: 'wget',
  package_type: 'formula',
  tap: null,
  desc: null,
  homepage: null,
  installed_version: null,
  latest_version: null,
  is_outdated: false,
  is_pinned: false,
  is_leaf: false,
  size_bytes: null,
  size_formatted: null,
  install_date: null,
  license: null,
};

const CASK_RESULT: PackageSummary = {
  ...FORMULA_RESULT,
  id: 'cask:firefox',
  name: 'firefox',
  full_name: 'firefox',
  package_type: 'cask',
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('usePackageSearch', () => {
  beforeEach(() => {
    mockInvoke.mockClear();
  });

  it('initialises with empty results and idle state', () => {
    const { result } = renderHook(() => usePackageSearch());

    expect(result.current.results).toEqual([]);
    expect(result.current.searching).toBe(false);
    expect(result.current.searched).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('does NOT call invoke when query is blank / whitespace-only', async () => {
    const { result } = renderHook(() => usePackageSearch());

    await act(async () => {
      await result.current.searchPackages('   ');
    });

    expect(mockInvoke).not.toHaveBeenCalled();
    expect(result.current.searching).toBe(false);
  });

  it('calls search_brew with the trimmed query', async () => {
    mockInvoke.mockResolvedValueOnce([FORMULA_RESULT]);
    const { result } = renderHook(() => usePackageSearch());

    await act(async () => {
      await result.current.searchPackages('  wget  ');
    });

    expect(mockInvoke).toHaveBeenCalledWith('search_brew', { query: 'wget' });
  });

  it('sets results and searched=true on success', async () => {
    mockInvoke.mockResolvedValueOnce([FORMULA_RESULT, CASK_RESULT]);
    const { result } = renderHook(() => usePackageSearch());

    await act(async () => {
      await result.current.searchPackages('firefox');
    });

    expect(result.current.results).toHaveLength(2);
    expect(result.current.results[0].name).toBe('wget');
    expect(result.current.results[1].package_type).toBe('cask');
    expect(result.current.searched).toBe(true);
    expect(result.current.searching).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles backend errors gracefully – stores error, clears results', async () => {
    mockInvoke.mockRejectedValueOnce(new Error('brew not found'));
    const { result } = renderHook(() => usePackageSearch());

    await act(async () => {
      await result.current.searchPackages('broken');
    });

    expect(result.current.results).toEqual([]);
    expect(result.current.error).toContain('brew not found');
    expect(result.current.searching).toBe(false);
  });

  it('clearSearch resets all state', async () => {
    mockInvoke.mockResolvedValueOnce([FORMULA_RESULT]);
    const { result } = renderHook(() => usePackageSearch());

    await act(async () => {
      await result.current.searchPackages('wget');
    });

    act(() => {
      result.current.clearSearch();
    });

    expect(result.current.results).toEqual([]);
    expect(result.current.searched).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
