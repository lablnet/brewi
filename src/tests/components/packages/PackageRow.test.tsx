/**
 * PackageRow.test.tsx
 *
 * Unit tests for PackageRow component.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PackageRow } from '../../../components/packages/PackageRow';
import { PackageSummary } from '../../../types';

const mockPkg: PackageSummary = {
  id: 'cask:firefox',
  name: 'firefox',
  full_name: 'firefox',
  package_type: 'cask',
  tap: 'homebrew/cask',
  desc: 'Web browser',
  homepage: 'https://www.mozilla.org/firefox/',
  installed_version: '130.0',
  latest_version: '130.0',
  is_outdated: false,
  is_pinned: false,
  is_leaf: false,
  size_bytes: null,
  size_formatted: null,
  install_date: null,
  license: 'MPL-2.0',
};

describe('PackageRow', () => {
  const defaultProps = {
    pkg: mockPkg,
    isSelected: false,
    onSelect: vi.fn(),
    onClick: vi.fn(),
    onUpgrade: vi.fn(),
    onUninstall: vi.fn(),
    onPin: vi.fn(),
  };

  it('renders package row with correct details', () => {
    render(<PackageRow {...defaultProps} />);
    expect(screen.getByText('firefox')).toBeInTheDocument();
    expect(screen.getByText('Web browser')).toBeInTheDocument();
    expect(screen.getByText('130.0')).toBeInTheDocument();
  });

  it('triggers onClick when row is clicked', () => {
    const onClick = vi.fn();
    render(<PackageRow {...defaultProps} onClick={onClick} />);
    fireEvent.click(screen.getByText('firefox'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not render pin button for casks', () => {
    render(<PackageRow {...defaultProps} />);
    expect(screen.queryByTitle('Pin version')).toBeNull();
  });
});
