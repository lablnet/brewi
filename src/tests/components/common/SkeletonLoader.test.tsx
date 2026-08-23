import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SkeletonLoader } from '../../../components/common/SkeletonLoader';

describe('SkeletonLoader', () => {
  it('renders default count of skeleton items in grid mode', () => {
    const { container } = render(<SkeletonLoader count={6} mode="grid" />);
    const items = container.querySelectorAll('.animate-pulse');
    expect(items.length).toBe(6);
  });

  it('renders specified count of skeleton items in list mode', () => {
    const { container } = render(<SkeletonLoader count={4} mode="list" />);
    const items = container.querySelectorAll('.animate-pulse');
    expect(items.length).toBe(4);
  });
});
