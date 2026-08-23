/**
 * Titlebar.test.tsx
 *
 * Unit tests for Titlebar component.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Titlebar } from '../../../components/layout/Titlebar';

describe('Titlebar', () => {
  const defaultProps = {
    activeTab: 'installed' as const,
    isTaskRunning: false,
    isTerminalOpen: false,
    onToggleTerminal: vi.fn(),
    onRefresh: vi.fn(),
    onOpenCommandPalette: vi.fn(),
    onOpenInstallModal: vi.fn(),
    arch: 'aarch64',
    refreshing: false,
    theme: 'dark' as const,
    onToggleTheme: vi.fn(),
  };

  it('renders title for active tab and architecture', () => {
    render(<Titlebar {...defaultProps} />);
    expect(screen.getByText('Installed Packages')).toBeInTheDocument();
    expect(screen.getByText('ARM64 (Apple Silicon)')).toBeInTheDocument();
  });

  it('triggers quick search button', () => {
    const onOpenCommandPalette = vi.fn();
    render(<Titlebar {...defaultProps} onOpenCommandPalette={onOpenCommandPalette} />);

    fireEvent.click(screen.getByText('Quick search or jump...'));
    expect(onOpenCommandPalette).toHaveBeenCalledTimes(1);
  });

  it('triggers action buttons (Install, Refresh, Terminal, Theme)', () => {
    const onOpenInstallModal = vi.fn();
    const onRefresh = vi.fn();
    const onToggleTerminal = vi.fn();
    const onToggleTheme = vi.fn();

    render(
      <Titlebar
        {...defaultProps}
        onOpenInstallModal={onOpenInstallModal}
        onRefresh={onRefresh}
        onToggleTerminal={onToggleTerminal}
        onToggleTheme={onToggleTheme}
      />
    );

    fireEvent.click(screen.getByText('Install'));
    expect(onOpenInstallModal).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTitle('Refresh All'));
    expect(onRefresh).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('Logs'));
    expect(onToggleTerminal).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTitle(/Switch to Light mode/i));
    expect(onToggleTheme).toHaveBeenCalledTimes(1);
  });
});
