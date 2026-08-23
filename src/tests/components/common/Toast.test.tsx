/**
 * Toast.test.tsx
 *
 * Unit tests for the Toast component.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Toast } from '../../../components/common/Toast';

describe('Toast', () => {
  it('renders nothing when toast is null', () => {
    const { container } = render(<Toast toast={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the message text', () => {
    render(<Toast toast={{ message: 'Package installed!', type: 'success' }} />);
    expect(screen.getByText('Package installed!')).toBeInTheDocument();
  });

  it('has emerald colour class for success type', () => {
    const { container } = render(
      <Toast toast={{ message: 'ok', type: 'success' }} />
    );
    const box = container.querySelector('[class*="emerald"]');
    expect(box).not.toBeNull();
  });

  it('has red colour class for error type', () => {
    const { container } = render(
      <Toast toast={{ message: 'fail', type: 'error' }} />
    );
    const box = container.querySelector('[class*="red"]');
    expect(box).not.toBeNull();
  });

  it('has amber colour class for info type', () => {
    const { container } = render(
      <Toast toast={{ message: 'note', type: 'info' }} />
    );
    const box = container.querySelector('[class*="amber"]');
    expect(box).not.toBeNull();
  });

  it('is fixed-positioned at bottom-right', () => {
    const { container } = render(
      <Toast toast={{ message: 'x', type: 'info' }} />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('fixed');
    expect(wrapper.className).toContain('bottom-6');
    expect(wrapper.className).toContain('right-6');
  });
});
