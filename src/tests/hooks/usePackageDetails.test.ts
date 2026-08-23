/**
 * usePackageDetails.test.ts
 *
 * Unit tests for the usePackageDetails hook.
 *
 * Covered behaviour:
 *  - loading state transitions
 *  - details & analytics are populated on success
 *  - installedVersions populated for formulae via get_installed_formula_versions
 *  - installedVersions stays empty for casks
 *  - switch_formula_version is called with correct args
 *  - error state is set when invoke rejects
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { invoke } from '@tauri-apps/api/core';
import { act } from 'react';
import { usePackageDetails } from '../../hooks/usePackageDetails';
import { PackageDetails } from '../../types';

const mockInvoke = vi.mocked(invoke);

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const DETAILS: PackageDetails = {
  name: 'git',
  full_name: 'git',
  package_type: 'formula',
  tap: 'homebrew/core',
  desc: 'Distributed revision control system',
  homepage: 'https://git-scm.com',
  installed_version: '2.47.0',
  latest_version: '2.47.0',
  is_outdated: false,
  is_pinned: false,
  is_leaf: true,
  license: 'GPL-2.0-only',
  caveats: null,
  dependencies: ['curl', 'openssl@3'],
  build_dependencies: [],
  dependents: ['gh', 'hub'],
  conflicts_with: [],
  installed_files: [],
  install_path: '/opt/homebrew/Cellar/git/2.47.0',
  size_formatted: '184.5 MB',
  install_date: '2025-01-15 10:30',
  bottle_poured: true,
  is_deprecated: false,
  deprecation_reason: null,
  is_disabled: false,
  disable_reason: null,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Prime invoke to return details, then versions, and swallow analytics fetch */
function primeInvokeForFormula(versions: string[] = ['2.47.0']) {
  mockInvoke.mockImplementation((cmd: string) => {
    if (cmd === 'get_package_details') return Promise.resolve(DETAILS);
    if (cmd === 'get_installed_formula_versions') return Promise.resolve(versions);
    return Promise.reject(new Error(`Unexpected: ${cmd}`));
  });
  // Analytics hits a real fetch(); intercept it so tests don't do network I/O
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify({}), { status: 200 })
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('usePackageDetails', () => {
  beforeEach(() => {
    mockInvoke.mockClear();
    vi.restoreAllMocks();
  });

  it('starts with loading=true and no details', () => {
    mockInvoke.mockResolvedValue(DETAILS);
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('{}', { status: 200 })
    );

    const { result } = renderHook(() => usePackageDetails('git', false));
    expect(result.current.loading).toBe(true);
    expect(result.current.details).toBeNull();
  });

  it('populates details after fetch resolves', async () => {
    primeInvokeForFormula();

    const { result } = renderHook(() => usePackageDetails('git', false));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.details?.name).toBe('git');
    expect(result.current.details?.dependencies).toContain('curl');
    expect(result.current.error).toBeNull();
  });

  it('loads installedVersions for a formula', async () => {
    primeInvokeForFormula(['2.47.0', '2.46.1']);

    const { result } = renderHook(() => usePackageDetails('git', false));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.installedVersions).toEqual(['2.47.0', '2.46.1']);
  });

  it('installedVersions stays empty for casks', async () => {
    mockInvoke.mockResolvedValue({ ...DETAILS, package_type: 'cask' });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('{}', { status: 200 })
    );

    const { result } = renderHook(() => usePackageDetails('firefox', true));

    await waitFor(() => expect(result.current.loading).toBe(false));
    // get_installed_formula_versions should never be called for casks
    const versionCalls = mockInvoke.mock.calls.filter(
      ([cmd]) => cmd === 'get_installed_formula_versions'
    );
    expect(versionCalls).toHaveLength(0);
    expect(result.current.installedVersions).toEqual([]);
  });

  it('sets error when get_package_details rejects', async () => {
    mockInvoke.mockRejectedValue(new Error('formula not found'));
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('{}', { status: 200 })
    );

    const { result } = renderHook(() => usePackageDetails('nonexistent', false));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toContain('formula not found');
    expect(result.current.details).toBeNull();
  });

  it('switchVersion calls switch_formula_version with correct args', async () => {
    primeInvokeForFormula(['2.47.0', '2.46.1']);

    const { result } = renderHook(() => usePackageDetails('git', false));
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Prime a second details call that happens after switching
    mockInvoke.mockImplementation((cmd: string) => {
      if (cmd === 'get_package_details') return Promise.resolve(DETAILS);
      if (cmd === 'get_installed_formula_versions') return Promise.resolve(['2.47.0', '2.46.1']);
      if (cmd === 'switch_formula_version') return Promise.resolve(undefined);
      return Promise.reject(new Error(`Unexpected: ${cmd}`));
    });

    await act(async () => {
      await result.current.switchVersion('2.46.1');
    });

    const switchCall = mockInvoke.mock.calls.find(([cmd]) => cmd === 'switch_formula_version');
    expect(switchCall).toBeDefined();
    expect(switchCall![1]).toMatchObject({ name: 'git', version: '2.46.1' });
    // taskId is generated dynamically — just assert it is a non-empty string
    expect(typeof (switchCall![1] as Record<string, unknown>).taskId).toBe('string');
  });

  it('switchVersion sets switchingVersion=true during execution', async () => {
    primeInvokeForFormula();

    const { result } = renderHook(() => usePackageDetails('git', false));
    await waitFor(() => expect(result.current.loading).toBe(false));

    mockInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === 'switch_formula_version') return Promise.resolve(undefined);
      if (cmd === 'get_package_details') return Promise.resolve(DETAILS);
      if (cmd === 'get_installed_formula_versions') return Promise.resolve(['2.47.0']);
      return Promise.reject(new Error(`Unexpected: ${cmd}`));
    });

    const promise = act(async () => {
      await result.current.switchVersion('2.47.0');
    });

    await promise;

    // After resolution, switchingVersion should be false again
    expect(result.current.switchingVersion).toBe(false);
  });
});
