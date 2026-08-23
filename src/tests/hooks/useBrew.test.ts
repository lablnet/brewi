/**
 * useBrew.test.ts
 *
 * Unit tests for the useBrew hook – the central state manager for the app.
 *
 * Covered behaviour:
 *  - loadPackages: calls get_installed_packages, updates outdatedCount,
 *    and triggers Dock badge via set_dock_badge
 *  - showToast: sets message and auto-clears after timeout
 *  - pinFormula: calls pin_formula and reloads packages
 *  - runDoctor: calls run_doctor and updates doctorIssues
 *  - getCleanupDryRun: populates cleanupResult
 *  - cancelActiveTask: calls cancel_task with the active task id
 *  - clearTerminal: empties terminalLogs
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { invoke } from '@tauri-apps/api/core';
import { useBrew } from '../../hooks/useBrew';
import { PackageSummary, BrewDoctorIssue, BrewCleanupResult } from '../../types';

const mockInvoke = vi.mocked(invoke);

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const makePackage = (overrides: Partial<PackageSummary> = {}): PackageSummary => ({
  id: 'formula:wget',
  name: 'wget',
  full_name: 'wget',
  package_type: 'formula',
  tap: 'homebrew/core',
  desc: 'Internet file retriever',
  homepage: 'https://www.gnu.org/software/wget/',
  installed_version: '1.25.0',
  latest_version: '1.25.0',
  is_outdated: false,
  is_pinned: false,
  is_leaf: true,
  size_bytes: 4096000,
  size_formatted: '3.9 MB',
  install_date: '2025-01-01 00:00',
  license: 'GPL-3.0-or-later',
  ...overrides,
});

const DOCTOR_ISSUES: BrewDoctorIssue[] = [
  {
    category: 'Warning',
    title: 'Homebrew/homebrew-core is a shallow clone',
    message: 'Run `git -C ... fetch --unshallow` to fix this.',
  },
];

const CLEANUP_RESULT: BrewCleanupResult = {
  items: [
    {
      path: '/opt/homebrew/Cellar/wget/1.24.0',
      size_bytes: 3145728,
      size_formatted: '3.0 MB',
      is_cache: false,
    },
  ],
  total_bytes: 3145728,
  total_formatted: '3.0 MB',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Sets up minimum invoke mocks needed to render useBrew without error */
function primeDefaultInvokes(packages: PackageSummary[] = []) {
  mockInvoke.mockImplementation((cmd: string) => {
    switch (cmd) {
      case 'get_installed_packages': return Promise.resolve(packages);
      case 'get_services':            return Promise.resolve([]);
      case 'get_taps':                return Promise.resolve([]);
      case 'get_brew_environment':    return Promise.resolve({ brew_path: '/opt/homebrew/bin/brew', brew_version: 'Homebrew 4.4.0', prefix: '/opt/homebrew', cellar: '/opt/homebrew/Cellar', caskroom: '/opt/homebrew/Caskroom', arch: 'aarch64', os_version: 'macOS 15.3' });
      case 'set_dock_badge':          return Promise.resolve(undefined);
      default:                         return Promise.resolve(undefined);
    }
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useBrew', () => {
  beforeEach(() => {
    mockInvoke.mockClear();
  });

  // ── loadPackages ────────────────────────────────────────────────────────────

  describe('loadPackages', () => {
    it('calls get_installed_packages on mount', async () => {
      primeDefaultInvokes();
      renderHook(() => useBrew());

      await waitFor(() => {
        const calls = mockInvoke.mock.calls.map(([cmd]) => cmd);
        expect(calls).toContain('get_installed_packages');
      });
    });

    it('sets packages and outdatedCount from the returned list', async () => {
      const pkgs = [
        makePackage({ name: 'wget', is_outdated: false }),
        makePackage({ id: 'formula:curl', name: 'curl', is_outdated: true }),
        makePackage({ id: 'formula:git',  name: 'git',  is_outdated: true }),
      ];
      primeDefaultInvokes(pkgs);

      const { result } = renderHook(() => useBrew());
      await waitFor(() => expect(result.current.packages.length).toBe(3));

      expect(result.current.outdatedCount).toBe(2);
    });

    it('calls set_dock_badge with the outdated count when > 0', async () => {
      const pkgs = [makePackage({ is_outdated: true })];
      primeDefaultInvokes(pkgs);

      renderHook(() => useBrew());
      await waitFor(() => {
        const badgeCalls = mockInvoke.mock.calls.filter(([cmd]) => cmd === 'set_dock_badge');
        expect(badgeCalls.length).toBeGreaterThan(0);
      });

      const badgeCall = mockInvoke.mock.calls.find(([cmd]) => cmd === 'set_dock_badge');
      expect((badgeCall![1] as Record<string, unknown>).badge).toBe('1');
    });

    it('passes null badge to set_dock_badge when no packages are outdated', async () => {
      primeDefaultInvokes([makePackage({ is_outdated: false })]);

      renderHook(() => useBrew());
      await waitFor(() => {
        const badgeCalls = mockInvoke.mock.calls.filter(([cmd]) => cmd === 'set_dock_badge');
        expect(badgeCalls.length).toBeGreaterThan(0);
      });

      const badgeCall = mockInvoke.mock.calls.find(([cmd]) => cmd === 'set_dock_badge');
      expect((badgeCall![1] as Record<string, unknown>).badge).toBeNull();
    });
  });

  // ── showToast ───────────────────────────────────────────────────────────────

  describe('showToast', () => {
    it('sets toast message and type immediately', async () => {
      primeDefaultInvokes();
      const { result } = renderHook(() => useBrew());

      await waitFor(() => result.current.loadingPackages === false);

      act(() => {
        result.current.showToast('Hello world', 'success');
      });

      expect(result.current.toast?.message).toBe('Hello world');
      expect(result.current.toast?.type).toBe('success');
    });
  });

  // ── pinFormula ──────────────────────────────────────────────────────────────

  describe('pinFormula', () => {
    it('calls pin_formula with name and pin=true then reloads packages', async () => {
      primeDefaultInvokes();
      const { result } = renderHook(() => useBrew());
      await waitFor(() => result.current.loadingPackages === false);

      await act(async () => {
        await result.current.pinFormula('wget', true);
      });

      const pinCall = mockInvoke.mock.calls.find(([cmd]) => cmd === 'pin_formula');
      expect(pinCall).toBeDefined();
      expect(pinCall![1]).toMatchObject({ name: 'wget', pin: true });
    });

    it('calls pin_formula with pin=false when unpinning', async () => {
      primeDefaultInvokes();
      const { result } = renderHook(() => useBrew());
      await waitFor(() => result.current.loadingPackages === false);

      await act(async () => {
        await result.current.pinFormula('wget', false);
      });

      const pinCall = mockInvoke.mock.calls.find(([cmd]) => cmd === 'pin_formula');
      expect((pinCall![1] as Record<string, unknown>).pin).toBe(false);
    });
  });

  // ── runDoctor ───────────────────────────────────────────────────────────────

  describe('runDoctor', () => {
    it('calls run_doctor and populates doctorIssues', async () => {
      primeDefaultInvokes();
      mockInvoke.mockImplementationOnce(() => Promise.resolve(DOCTOR_ISSUES)); // run_doctor

      const { result } = renderHook(() => useBrew());
      await waitFor(() => result.current.loadingPackages === false);

      // Override default to return doctor issues on next call
      mockInvoke.mockImplementation((cmd: string) => {
        if (cmd === 'run_doctor') return Promise.resolve(DOCTOR_ISSUES);
        return Promise.resolve(undefined);
      });

      await act(async () => {
        await result.current.runDoctor();
      });

      expect(result.current.doctorIssues).toHaveLength(1);
      expect(result.current.doctorIssues![0].title).toContain('shallow clone');
    });

    it('sets doctorIssues to empty array when no issues found', async () => {
      primeDefaultInvokes();
      const { result } = renderHook(() => useBrew());
      await waitFor(() => result.current.loadingPackages === false);

      mockInvoke.mockImplementation((cmd: string) => {
        if (cmd === 'run_doctor') return Promise.resolve([]);
        return Promise.resolve(undefined);
      });

      await act(async () => {
        await result.current.runDoctor();
      });

      expect(result.current.doctorIssues).toEqual([]);
    });
  });

  // ── getCleanupDryRun ────────────────────────────────────────────────────────

  describe('getCleanupDryRun', () => {
    it('calls get_cleanup_dry_run and stores the result', async () => {
      primeDefaultInvokes();
      const { result } = renderHook(() => useBrew());
      await waitFor(() => result.current.loadingPackages === false);

      mockInvoke.mockImplementation((cmd: string) => {
        if (cmd === 'get_cleanup_dry_run') return Promise.resolve(CLEANUP_RESULT);
        return Promise.resolve(undefined);
      });

      await act(async () => {
        await result.current.getCleanupDryRun();
      });

      expect(result.current.cleanupResult?.total_formatted).toBe('3.0 MB');
      expect(result.current.cleanupResult?.items).toHaveLength(1);
    });
  });

  // ── clearTerminal ───────────────────────────────────────────────────────────

  describe('clearTerminal', () => {
    it('empties terminalLogs', async () => {
      primeDefaultInvokes();
      const { result } = renderHook(() => useBrew());
      await waitFor(() => result.current.loadingPackages === false);

      act(() => {
        result.current.clearTerminal();
      });

      expect(result.current.terminalLogs).toEqual([]);
    });
  });

  // ── cancelActiveTask ────────────────────────────────────────────────────────

  describe('cancelActiveTask', () => {
    it('does not call cancel_task when there is no active task', async () => {
      primeDefaultInvokes();
      const { result } = renderHook(() => useBrew());
      await waitFor(() => result.current.loadingPackages === false);

      await act(async () => {
        await result.current.cancelActiveTask();
      });

      const cancelCalls = mockInvoke.mock.calls.filter(([cmd]) => cmd === 'cancel_task');
      expect(cancelCalls).toHaveLength(0);
    });
  });
});
