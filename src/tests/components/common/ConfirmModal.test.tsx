/**
 * ConfirmModal.test.tsx
 *
 * Unit tests for the ConfirmModal component.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmModal } from '../../../components/common/ConfirmModal';

describe('ConfirmModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Uninstall Wget',
    message: 'Are you sure you want to uninstall wget?',
  };

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<ConfirmModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders title and message when isOpen is true', () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByText('Uninstall Wget')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to uninstall wget?')).toBeInTheDocument();
  });

  it('calls onClose when close button or cancel button is clicked', () => {
    const onClose = vi.fn();
    render(<ConfirmModal {...defaultProps} onClose={onClose} />);
    
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm and onClose when confirm button is clicked', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(<ConfirmModal {...defaultProps} onConfirm={onConfirm} onClose={onClose} confirmText="Uninstall" />);

    const confirmBtn = screen.getByRole('button', { name: /uninstall/i });
    fireEvent.click(confirmBtn);

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders list of affected details when provided', () => {
    render(<ConfirmModal {...defaultProps} details={['wget', 'curl']} />);
    expect(screen.getByText('• wget')).toBeInTheDocument();
    expect(screen.getByText('• curl')).toBeInTheDocument();
  });
});
