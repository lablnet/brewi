/**
 * TapsView.test.tsx
 *
 * Unit tests for TapsView component.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TapsView } from '../../../components/taps/TapsView';
import { BrewTap } from '../../../types';

const mockTaps: BrewTap[] = [
  {
    name: 'homebrew/core',
    user: 'homebrew',
    repo: 'core',
    path: '/opt/homebrew/Library/Taps/homebrew/homebrew-core',
    official: true,
    formula_count: 7000,
    cask_count: 0,
    remote: 'https://github.com/Homebrew/homebrew-core',
  },
  {
    name: 'hashicorp/tap',
    user: 'hashicorp',
    repo: 'tap',
    path: '/opt/homebrew/Library/Taps/hashicorp/homebrew-tap',
    official: false,
    formula_count: 10,
    cask_count: 0,
    remote: 'https://github.com/hashicorp/homebrew-tap',
  },
];

describe('TapsView', () => {
  const defaultProps = {
    taps: mockTaps,
    loading: false,
    onAddTap: vi.fn(),
    onRemoveTap: vi.fn(),
  };

  it('renders taps view header and tap items', () => {
    render(<TapsView {...defaultProps} />);
    expect(screen.getByText('Taps & Repositories')).toBeInTheDocument();
    expect(screen.getByText('homebrew/core')).toBeInTheDocument();
    expect(screen.getByText('hashicorp/tap')).toBeInTheDocument();
  });

  it('opens Add Tap modal and triggers onAddTap when submitted', () => {
    const onAddTap = vi.fn();
    render(<TapsView {...defaultProps} onAddTap={onAddTap} />);

    fireEvent.click(screen.getByText('Add Tap'));
    expect(screen.getByText('Add New Tap')).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/e.g. user\/repo/i);
    fireEvent.change(input, { target: { value: 'mongodb/brew' } });
    fireEvent.click(screen.getByRole('button', { name: /^Tap$/i }));

    expect(onAddTap).toHaveBeenCalledWith('mongodb/brew');
  });

  it('opens confirmation modal and triggers onRemoveTap for unofficial taps', () => {
    const onRemoveTap = vi.fn();
    render(<TapsView {...defaultProps} onRemoveTap={onRemoveTap} />);

    const untapBtn = screen.getByTitle('Untap');
    fireEvent.click(untapBtn);

    expect(screen.getByText('Untap hashicorp/tap')).toBeInTheDocument();

    const confirmBtn = screen.getAllByRole('button', { name: /^Untap$/i })[1];
    fireEvent.click(confirmBtn);

    expect(onRemoveTap).toHaveBeenCalledWith('hashicorp/tap');
  });
});
