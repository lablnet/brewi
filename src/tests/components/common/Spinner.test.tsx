/**
 * Spinner.test.tsx
 *
 * Unit tests for the Spinner component.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from '../../../components/common/Spinner';

describe('Spinner', () => {
  it('renders without crashing', () => {
    const { container } = render(<Spinner />);
    expect(container.firstChild).not.toBeNull();
  });

  it('applies animate-spin class to icon', () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('class')).toContain('animate-spin');
  });

  it('applies sm size class', () => {
    const { container } = render(<Spinner size="sm" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('class')).toContain('w-3.5');
    expect(svg?.getAttribute('class')).toContain('h-3.5');
  });

  it('applies md size class (default)', () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('class')).toContain('w-5');
    expect(svg?.getAttribute('class')).toContain('h-5');
  });

  it('applies lg size class', () => {
    const { container } = render(<Spinner size="lg" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('class')).toContain('w-8');
    expect(svg?.getAttribute('class')).toContain('h-8');
  });

  it('applies xl size class', () => {
    const { container } = render(<Spinner size="xl" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('class')).toContain('w-10');
    expect(svg?.getAttribute('class')).toContain('h-10');
  });

  it('renders no label text by default', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('span')).toBeNull();
  });

  it('renders label text when label prop is supplied', () => {
    render(<Spinner label="Loading packages…" />);
    expect(screen.getByText('Loading packages…')).toBeInTheDocument();
  });

  it('applies custom className to the icon', () => {
    const { container } = render(<Spinner className="text-blue-500" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('class')).toContain('text-blue-500');
  });
});
