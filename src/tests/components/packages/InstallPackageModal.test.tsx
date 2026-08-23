/**
 * InstallPackageModal.test.tsx
 *
 * Unit tests for InstallPackageModal component.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InstallPackageModal } from '../../../components/packages/InstallPackageModal';

const mockSearch = vi.fn();

vi.mock('../../../hooks/usePackageSearch', () => ({
  usePackageSearch: () => ({
    results: [
      { id: 'formula:redis', name: 'redis', package_type: 'formula' },
    ],
    searching: false,
    searched: true,
    searchPackages: mockSearch,
  }),
}));

describe('InstallPackageModal', () => {
  const defaultProps = {
    onClose: vi.fn(),
    onInstall: vi.fn(),
  };

  it('renders modal header and input', () => {
    render(<InstallPackageModal {...defaultProps} />);
    expect(screen.getByText('Install New Package')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search packages/i)).toBeInTheDocument();
  });

  it('triggers search when form is submitted', () => {
    render(<InstallPackageModal {...defaultProps} />);
    const input = screen.getByPlaceholderText(/Search packages/i);

    fireEvent.change(input, { target: { value: 'redis' } });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(mockSearch).toHaveBeenCalledWith('redis');
  });

  it('triggers direct install for formula when Formula button is clicked', () => {
    const onInstall = vi.fn();
    render(<InstallPackageModal {...defaultProps} onInstall={onInstall} />);
    const input = screen.getByPlaceholderText(/Search packages/i);

    fireEvent.change(input, { target: { value: 'redis' } });
    fireEvent.click(screen.getByText(/Formula 🍺/i));

    expect(onInstall).toHaveBeenCalledWith('redis', false);
  });
});
