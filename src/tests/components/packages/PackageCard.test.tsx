/**
 * PackageCard.test.tsx
 *
 * Unit tests for PackageCard component.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PackageCard } from '../../../components/packages/PackageCard';
import { PackageSummary } from '../../../types';

const mockPkg: PackageSummary = {
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
};

describe('PackageCard', () => {
  const defaultProps = {
    pkg: mockPkg,
    isSelected: false,
    onSelect: vi.fn(),
    onClick: vi.fn(),
    onUpgrade: vi.fn(),
    onUninstall: vi.fn(),
    onPin: vi.fn(),
  };

  it('renders package name, description, and metadata', () => {
    render(<PackageCard {...defaultProps} />);
    expect(screen.getByText('wget')).toBeInTheDocument();
    expect(screen.getByText('Internet file retriever')).toBeInTheDocument();
    expect(screen.getByText('3.9 MB')).toBeInTheDocument();
    expect(screen.getByText('leaf')).toBeInTheDocument();
  });

  it('triggers onClick when card is clicked', () => {
    const onClick = vi.fn();
    render(<PackageCard {...defaultProps} onClick={onClick} />);
    fireEvent.click(screen.getByText('wget'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('triggers onSelect when checkbox is toggled', () => {
    const onSelect = vi.fn();
    render(<PackageCard {...defaultProps} onSelect={onSelect} />);
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(onSelect).toHaveBeenCalledWith(true);
  });

  it('shows Update badge when package is outdated', () => {
    render(<PackageCard {...defaultProps} pkg={{ ...mockPkg, is_outdated: true }} />);
    expect(screen.getByText('Update')).toBeInTheDocument();
  });

  it('triggers action buttons (uninstall, pin)', () => {
    const onUninstall = vi.fn();
    const onPin = vi.fn();
    render(<PackageCard {...defaultProps} onUninstall={onUninstall} onPin={onPin} />);

    const uninstallBtn = screen.getByTitle('Uninstall package');
    fireEvent.click(uninstallBtn);
    expect(onUninstall).toHaveBeenCalledTimes(1);

    const pinBtn = screen.getByTitle('Pin version');
    fireEvent.click(pinBtn);
    expect(onPin).toHaveBeenCalledTimes(1);
  });
});
