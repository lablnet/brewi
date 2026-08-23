import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Package } from 'lucide-react';
import { EmptyState } from '../../../components/common/EmptyState';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(
      <EmptyState
        icon={Package}
        title="No packages found"
        description="Try searching for another formula or cask."
      />
    );
    expect(screen.getByText('No packages found')).toBeInTheDocument();
    expect(screen.getByText('Try searching for another formula or cask.')).toBeInTheDocument();
  });

  it('renders action button and triggers onAction when clicked', () => {
    const onAction = vi.fn();
    render(
      <EmptyState
        icon={Package}
        title="No items"
        description="Empty"
        actionLabel="Refresh"
        onAction={onAction}
      />
    );

    const btn = screen.getByRole('button', { name: 'Refresh' });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
