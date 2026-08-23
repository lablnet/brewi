/**
 * TerminalDrawer.test.tsx
 *
 * Unit tests for TerminalDrawer component.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TerminalDrawer } from '../../../components/layout/TerminalDrawer';

describe('TerminalDrawer', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    logs: ['==> Installing wget', 'Downloading https://example.com/wget.tar.gz', 'Error: failed to fetch'],
    isRunning: true,
    taskName: 'Installing wget',
    onCancelTask: vi.fn(),
    onClearLogs: vi.fn(),
  };

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<TerminalDrawer {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders task name and logs when open', () => {
    render(<TerminalDrawer {...defaultProps} />);
    expect(screen.getByText('Installing wget')).toBeInTheDocument();
    expect(screen.getByText('==> Installing wget')).toBeInTheDocument();
    expect(screen.getByText('Downloading https://example.com/wget.tar.gz')).toBeInTheDocument();
    expect(screen.getByText('Error: failed to fetch')).toBeInTheDocument();
  });

  it('shows Running status and Cancel button when isRunning is true', () => {
    render(<TerminalDrawer {...defaultProps} />);
    expect(screen.getByText('Running...')).toBeInTheDocument();
    expect(screen.getByTitle('Cancel current task')).toBeInTheDocument();
  });

  it('calls onCancelTask when cancel button is clicked', () => {
    const onCancelTask = vi.fn();
    render(<TerminalDrawer {...defaultProps} onCancelTask={onCancelTask} />);

    fireEvent.click(screen.getByTitle('Cancel current task'));
    expect(onCancelTask).toHaveBeenCalledTimes(1);
  });

  it('calls onClearLogs when clear button is clicked', () => {
    const onClearLogs = vi.fn();
    render(<TerminalDrawer {...defaultProps} onClearLogs={onClearLogs} />);

    fireEvent.click(screen.getByTitle('Clear logs'));
    expect(onClearLogs).toHaveBeenCalledTimes(1);
  });
});
