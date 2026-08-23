/**
 * ServicesView.test.tsx
 *
 * Unit tests for ServicesView component.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ServicesView } from '../../../components/services/ServicesView';
import { BrewService } from '../../../types';

const mockServices: BrewService[] = [
  {
    name: 'postgresql@14',
    status: 'started',
    user: 'user',
    file: '/Library/LaunchDaemons/postgresql.plist',
    exit_code: 0,
  },
  {
    name: 'redis',
    status: 'stopped',
    user: null,
    file: null,
    exit_code: null,
  },
];

describe('ServicesView', () => {
  const defaultProps = {
    services: mockServices,
    loading: false,
    onManageService: vi.fn(),
    onRefresh: vi.fn(),
  };

  it('renders services view header and service list', () => {
    render(<ServicesView {...defaultProps} />);
    expect(screen.getByText('Homebrew Services')).toBeInTheDocument();
    expect(screen.getByText('postgresql@14')).toBeInTheDocument();
    expect(screen.getByText('redis')).toBeInTheDocument();
  });

  it('triggers service management actions (stop/restart for running, start/run for stopped)', () => {
    const onManageService = vi.fn();
    render(<ServicesView {...defaultProps} onManageService={onManageService} />);

    fireEvent.click(screen.getAllByText('Stop')[0]);
    expect(onManageService).toHaveBeenCalledWith('postgresql@14', 'stop');

    fireEvent.click(screen.getAllByText('Start')[0]);
    expect(onManageService).toHaveBeenCalledWith('redis', 'start');
  });

  it('triggers refresh when button is clicked', () => {
    const onRefresh = vi.fn();
    render(<ServicesView {...defaultProps} onRefresh={onRefresh} />);

    fireEvent.click(screen.getByText('Refresh Services'));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });
});
