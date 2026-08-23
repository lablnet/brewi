/**
 * PackageDetailModal.test.tsx
 *
 * Unit tests for PackageDetailModal component.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PackageDetailModal } from '../../../components/packages/PackageDetailModal';
import { PackageSummary } from '../../../types';

const mockPkg: PackageSummary = {
  id: 'formula:git',
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
  size_bytes: 184500000,
  size_formatted: '184.5 MB',
  install_date: '2025-01-15',
  license: 'GPL-2.0-only',
};

vi.mock('../../../hooks/usePackageDetails', () => ({
  usePackageDetails: () => ({
    details: {
      name: 'git',
      full_name: 'git',
      package_type: 'formula',
      installed_version: '2.47.0',
      latest_version: '2.47.0',
      desc: 'Distributed revision control system',
      homepage: 'https://git-scm.com',
      dependencies: ['curl'],
      dependents: [],
      license: 'GPL-2.0-only',
    },
    analytics: null,
    installedVersions: ['2.47.0'],
    switchingVersion: false,
    switchVersion: vi.fn(),
    loading: false,
    revealInFinder: vi.fn(),
  }),
}));

describe('PackageDetailModal', () => {
  const defaultProps = {
    pkg: mockPkg,
    onClose: vi.fn(),
    onUpgrade: vi.fn(),
    onUninstall: vi.fn(),
    onPin: vi.fn(),
    onInspectOther: vi.fn(),
  };

  it('renders package details header and info', () => {
    render(<PackageDetailModal {...defaultProps} />);
    expect(screen.getByText('git')).toBeInTheDocument();
    expect(screen.getByText('Distributed revision control system')).toBeInTheDocument();
  });

  it('switches to dependency tree tab when clicked', () => {
    render(<PackageDetailModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Dep Tree'));

    expect(screen.getByText('Dependency Graph Visualizer')).toBeInTheDocument();
    expect(screen.getByText('curl')).toBeInTheDocument();
  });

  it('opens uninstall confirmation modal when Uninstall is clicked', () => {
    render(<PackageDetailModal {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /uninstall/i }));

    expect(screen.getByText('Uninstall git?')).toBeInTheDocument();
  });
});
