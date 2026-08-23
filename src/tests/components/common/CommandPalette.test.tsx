/**
 * CommandPalette.test.tsx
 *
 * Unit tests for CommandPalette component.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommandPalette } from '../../../components/common/CommandPalette';
import { PackageSummary } from '../../../types';

const mockPackages: PackageSummary[] = [
  {
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
    install_date: '2025-01-01',
    license: 'GPL-3.0-or-later',
  },
];

describe('CommandPalette', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    packages: mockPackages,
    onSelectTab: vi.fn(),
    onSelectPackage: vi.fn(),
    onRunDoctor: vi.fn(),
    onScanCleanup: vi.fn(),
    onUpdateBrew: vi.fn(),
  };

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<CommandPalette {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders navigation commands when open', () => {
    render(<CommandPalette {...defaultProps} />);
    expect(screen.getByText('Go to Installed Packages')).toBeInTheDocument();
    expect(screen.getByText('Go to Pending Updates')).toBeInTheDocument();
  });

  it('filters commands and matches packages based on query', () => {
    render(<CommandPalette {...defaultProps} />);
    const input = screen.getByPlaceholderText(/Type a command, package name, or view.../i);

    fireEvent.change(input, { target: { value: 'wget' } });

    expect(screen.getByText('wget')).toBeInTheDocument();
    expect(screen.queryByText('Go to Pending Updates')).toBeNull();
  });

  it('executes action and closes when command is clicked', () => {
    const onSelectTab = vi.fn();
    const onClose = vi.fn();
    render(<CommandPalette {...defaultProps} onSelectTab={onSelectTab} onClose={onClose} />);

    fireEvent.click(screen.getByText('Go to Pending Updates'));

    expect(onSelectTab).toHaveBeenCalledWith('updates');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape key press', () => {
    const onClose = vi.fn();
    render(<CommandPalette {...defaultProps} onClose={onClose} />);
    const input = screen.getByPlaceholderText(/Type a command, package name, or view.../i);

    fireEvent.keyDown(input, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
