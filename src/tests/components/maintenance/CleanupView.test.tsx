/**
 * CleanupView.test.tsx
 *
 * Unit tests for CleanupView component.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CleanupView } from '../../../components/maintenance/CleanupView';
import { BrewCleanupResult } from '../../../types';

const mockCleanupResult: BrewCleanupResult = {
  items: [
    {
      path: '/opt/homebrew/Cellar/wget/1.24.0',
      size_bytes: 3145728,
      size_formatted: '3.0 MB',
      is_cache: false,
    },
  ],
  total_bytes: 3145728,
  total_formatted: '3.0 MB',
};

describe('CleanupView', () => {
  const defaultProps = {
    cleanupResult: null,
    loading: false,
    onScanCleanup: vi.fn(),
    onRunCleanup: vi.fn(),
  };

  it('renders initial empty state before scan', () => {
    render(<CleanupView {...defaultProps} />);
    expect(screen.getByText('Disk Cleanup & Hygiene')).toBeInTheDocument();
    expect(screen.getByText('No cleanup scan performed yet')).toBeInTheDocument();
  });

  it('triggers dry-run scan when button is clicked', () => {
    const onScanCleanup = vi.fn();
    render(<CleanupView {...defaultProps} onScanCleanup={onScanCleanup} />);

    fireEvent.click(screen.getByText('Dry-Run Scan'));
    expect(onScanCleanup).toHaveBeenCalledTimes(1);
  });

  it('renders scan results and triggers cleanup execution', () => {
    const onRunCleanup = vi.fn();
    render(
      <CleanupView
        {...defaultProps}
        cleanupResult={mockCleanupResult}
        onRunCleanup={onRunCleanup}
      />
    );

    expect(screen.getAllByText('3.0 MB')[0]).toBeInTheDocument();
    expect(screen.getByText('/opt/homebrew/Cellar/wget/1.24.0')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Clean Now (3.0 MB)'));
    expect(onRunCleanup).toHaveBeenCalledWith(true);
  });
});
