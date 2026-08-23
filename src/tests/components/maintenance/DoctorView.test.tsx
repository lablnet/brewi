/**
 * DoctorView.test.tsx
 *
 * Unit tests for DoctorView component.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DoctorView } from '../../../components/maintenance/DoctorView';
import { BrewDoctorIssue } from '../../../types';

const mockIssues: BrewDoctorIssue[] = [
  {
    category: 'Warning',
    title: 'Unlinked symlinks found',
    message: 'Run `brew link wget` to resolve.',
  },
];

describe('DoctorView', () => {
  const defaultProps = {
    issues: null,
    loading: false,
    onRunDoctor: vi.fn(),
  };

  it('renders initial empty state before running diagnostics', () => {
    render(<DoctorView {...defaultProps} />);
    expect(screen.getByText('Brew Doctor & Health')).toBeInTheDocument();
    expect(screen.getByText('No diagnostic results yet')).toBeInTheDocument();
  });

  it('triggers diagnostics run when button is clicked', () => {
    const onRunDoctor = vi.fn();
    render(<DoctorView {...defaultProps} onRunDoctor={onRunDoctor} />);

    fireEvent.click(screen.getAllByText('Run Diagnostics')[0]);
    expect(onRunDoctor).toHaveBeenCalledTimes(1);
  });

  it('renders green state when issues array is empty', () => {
    render(<DoctorView {...defaultProps} issues={[]} />);
    expect(screen.getByText('Your system is ready to brew!')).toBeInTheDocument();
  });

  it('renders list of issues when issues are present', () => {
    render(<DoctorView {...defaultProps} issues={mockIssues} />);
    expect(screen.getByText('Unlinked symlinks found')).toBeInTheDocument();
    expect(screen.getByText('Run `brew link wget` to resolve.')).toBeInTheDocument();
  });
});
