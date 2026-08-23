/**
 * Sidebar.test.tsx
 *
 * Unit tests for Sidebar component.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '../../../components/layout/Sidebar';
import { BrewEnvInfo } from '../../../types';

const mockEnv: BrewEnvInfo = {
  brew_path: '/opt/homebrew/bin/brew',
  brew_version: 'Homebrew 4.4.0',
  prefix: '/opt/homebrew',
  cellar: '/opt/homebrew/Cellar',
  caskroom: '/opt/homebrew/Caskroom',
  arch: 'aarch64',
  os_version: 'macOS 15.3',
};

describe('Sidebar', () => {
  const defaultProps = {
    activeTab: 'installed' as const,
    onSelectTab: vi.fn(),
    installedCount: 42,
    outdatedCount: 3,
    servicesCount: 1,
    leavesCount: 10,
    tapsCount: 2,
    envInfo: mockEnv,
  };

  it('renders app branding and author info', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText('Brewi')).toBeInTheDocument();
    expect(screen.getByText('Muhammad Umer Farooq')).toBeInTheDocument();
    expect(screen.getByText('v4.4.0')).toBeInTheDocument();
  });

  it('renders navigation items with counts', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText('Installed')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Updates')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('calls onSelectTab when item is clicked', () => {
    const onSelectTab = vi.fn();
    render(<Sidebar {...defaultProps} onSelectTab={onSelectTab} />);

    fireEvent.click(screen.getByText('Brew Doctor'));
    expect(onSelectTab).toHaveBeenCalledWith('doctor');
  });
});
