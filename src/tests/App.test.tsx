/**
 * App.test.tsx
 *
 * Unit tests for main App component.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

vi.mock('../hooks/useBrew', () => ({
  useBrew: () => ({
    packages: [
      {
        id: 'formula:wget',
        name: 'wget',
        full_name: 'wget',
        package_type: 'formula',
        installed_version: '1.25.0',
        latest_version: '1.25.0',
        is_outdated: false,
        is_pinned: false,
        is_leaf: true,
      },
    ],
    services: [],
    taps: [],
    envInfo: {
      brew_path: '/opt/homebrew/bin/brew',
      brew_version: 'Homebrew 4.4.0',
      prefix: '/opt/homebrew',
      cellar: '/opt/homebrew/Cellar',
      caskroom: '/opt/homebrew/Caskroom',
      arch: 'aarch64',
      os_version: 'macOS 15.3',
    },
    doctorIssues: null,
    cleanupResult: null,
    outdatedCount: 0,
    loadingPackages: false,
    loadingServices: false,
    loadingTaps: false,
    loadingDoctor: false,
    loadingCleanup: false,
    activeTaskName: '',
    terminalLogs: [],
    isTerminalOpen: false,
    isTaskRunning: false,
    toast: null,
    setIsTerminalOpen: vi.fn(),
    refreshAll: vi.fn(),
    installPackage: vi.fn(),
    uninstallPackage: vi.fn(),
    pinFormula: vi.fn(),
    upgradePackages: vi.fn(),
    updateBrew: vi.fn(),
    manageService: vi.fn(),
    addTap: vi.fn(),
    removeTap: vi.fn(),
    runDoctor: vi.fn(),
    getCleanupDryRun: vi.fn(),
    runCleanup: vi.fn(),
    cancelActiveTask: vi.fn(),
    clearTerminal: vi.fn(),
  }),
}));

describe('App', () => {
  it('renders application with sidebar and default installed packages view', () => {
    render(<App />);
    expect(screen.getByText('Brewi')).toBeInTheDocument();
    expect(screen.getByText('Installed Packages')).toBeInTheDocument();
    expect(screen.getByText('wget')).toBeInTheDocument();
  });

  it('switches views when sidebar item is clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Services'));
    expect(screen.getByText('Background Services')).toBeInTheDocument();
  });

  it('toggles light/dark theme', () => {
    render(<App />);
    const themeBtn = screen.getByTitle(/Switch to Light mode/i);
    fireEvent.click(themeBtn);
    expect(localStorage.getItem('brewi_theme')).toBe('light');
  });
});
