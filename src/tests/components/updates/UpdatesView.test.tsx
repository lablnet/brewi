/**
 * UpdatesView.test.tsx
 *
 * Unit tests for UpdatesView component.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UpdatesView } from '../../../components/updates/UpdatesView';
import { PackageSummary } from '../../../types';

const mockOutdated: PackageSummary[] = [
  {
    id: 'formula:curl',
    name: 'curl',
    full_name: 'curl',
    package_type: 'formula',
    tap: 'homebrew/core',
    desc: 'Get a file from an HTTP, HTTPS or FTP server',
    homepage: 'https://curl.se',
    installed_version: '8.10.0',
    latest_version: '8.11.0',
    is_outdated: true,
    is_pinned: false,
    is_leaf: false,
    size_bytes: 5000000,
    size_formatted: '5.0 MB',
    install_date: '2025-01-01',
    license: 'curl',
  },
];

describe('UpdatesView', () => {
  const defaultProps = {
    outdatedPackages: mockOutdated,
    loading: false,
    onUpgrade: vi.fn(),
    onUpdateBrew: vi.fn(),
    onRefresh: vi.fn(),
  };

  it('renders pending updates header and outdated items', () => {
    render(<UpdatesView {...defaultProps} />);
    expect(screen.getByText('Pending Updates')).toBeInTheDocument();
    expect(screen.getByText('curl')).toBeInTheDocument();
    expect(screen.getByText('8.10.0')).toBeInTheDocument();
    expect(screen.getByText('8.11.0')).toBeInTheDocument();
  });

  it('renders green empty state when no packages are outdated', () => {
    render(<UpdatesView {...defaultProps} outdatedPackages={[]} />);
    expect(screen.getByText('All packages are up to date!')).toBeInTheDocument();
  });

  it('triggers Upgrade All button and opens confirmation modal', () => {
    const onUpgrade = vi.fn();
    render(<UpdatesView {...defaultProps} onUpgrade={onUpgrade} />);

    fireEvent.click(screen.getByText('Upgrade All (1)'));
    expect(screen.getByText('Upgrade Confirmation')).toBeInTheDocument();

    const confirmBtns = screen.getAllByRole('button', { name: /^Upgrade$/i });
    fireEvent.click(confirmBtns[confirmBtns.length - 1]);

    expect(onUpgrade).toHaveBeenCalledWith(['curl'], false);
  });

  it('triggers Update Brew when button is clicked', () => {
    const onUpdateBrew = vi.fn();
    render(<UpdatesView {...defaultProps} onUpdateBrew={onUpdateBrew} />);

    fireEvent.click(screen.getByText('Update Brew'));
    expect(onUpdateBrew).toHaveBeenCalledTimes(1);
  });
});
