/**
 * PackageList.test.tsx
 *
 * Unit tests for PackageList component.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PackageList } from '../../../components/packages/PackageList';
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
  {
    id: 'cask:firefox',
    name: 'firefox',
    full_name: 'firefox',
    package_type: 'cask',
    tap: 'homebrew/cask',
    desc: 'Web browser',
    homepage: 'https://www.mozilla.org/firefox/',
    installed_version: '130.0',
    latest_version: '130.0',
    is_outdated: true,
    is_pinned: false,
    is_leaf: false,
    size_bytes: null,
    size_formatted: null,
    install_date: null,
    license: 'MPL-2.0',
  },
];

describe('PackageList', () => {
  const defaultProps = {
    packages: mockPackages,
    loading: false,
    onSelectPackage: vi.fn(),
    onUpgrade: vi.fn(),
    onUninstall: vi.fn(),
    onPin: vi.fn(),
  };

  it('renders package cards in grid mode', () => {
    render(<PackageList {...defaultProps} />);
    expect(screen.getByText('wget')).toBeInTheDocument();
    expect(screen.getByText('firefox')).toBeInTheDocument();
  });

  it('filters list based on search query', () => {
    render(<PackageList {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText(/Filter installed packages/i);

    fireEvent.change(searchInput, { target: { value: 'firefox' } });

    expect(screen.getByText('firefox')).toBeInTheDocument();
    expect(screen.queryByText('wget')).toBeNull();
  });

  it('filters by category pills (e.g. Casks)', () => {
    render(<PackageList {...defaultProps} />);
    const caskPill = screen.getByRole('button', { name: /Casks/i });

    fireEvent.click(caskPill);

    expect(screen.getByText('firefox')).toBeInTheDocument();
    expect(screen.queryByText('wget')).toBeNull();
  });

  it('toggles view mode between grid and list', () => {
    render(<PackageList {...defaultProps} />);
    const listViewBtn = screen.getByTitle('List View');

    fireEvent.click(listViewBtn);
    expect(localStorage.getItem('brewi_view_mode')).toBe('list');
  });
});
