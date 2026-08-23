/**
 * BrewfileView.test.tsx
 *
 * Unit tests for BrewfileView component.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrewfileView } from '../../../components/maintenance/BrewfileView';

const mockExport = vi.fn();
const mockSave = vi.fn();
const mockCopy = vi.fn();

vi.mock('../../../hooks/useBrewfile', () => ({
  useBrewfile: () => ({
    content: 'brew "git"\ncask "firefox"',
    loading: false,
    copied: false,
    savedPath: null,
    exportBrewfile: mockExport,
    saveToFile: mockSave,
    copyToClipboard: mockCopy,
  }),
}));

describe('BrewfileView', () => {
  it('renders brewfile header and exported content', () => {
    render(<BrewfileView />);
    expect(screen.getByText('Brewfile Export')).toBeInTheDocument();
    expect(screen.getByText(/brew "git"/i)).toBeInTheDocument();
  });

  it('triggers action buttons (save, copy, regenerate)', () => {
    render(<BrewfileView />);

    fireEvent.click(screen.getByText('Save to File'));
    expect(mockSave).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Copy'));
    expect(mockCopy).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Re-generate'));
    expect(mockExport).toHaveBeenCalled();
  });

  it('opens share modal when Share Setup button is clicked', () => {
    render(<BrewfileView />);
    fireEvent.click(screen.getByText('Share Setup'));
    expect(screen.getByText('Duplicate Mac Setup')).toBeInTheDocument();
  });
});
