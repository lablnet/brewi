/**
 * i18n.test.tsx
 *
 * Unit tests for i18n system, LanguageProvider, locales, and RTL support.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider, useTranslation } from '../../i18n/LanguageContext';
import { LOCALES } from '../../i18n';
import { LanguageSelector } from '../../components/common/LanguageSelector';
import { STORAGE_KEYS } from '../../utils/constants';

const TestConsumer: React.FC = () => {
  const { language, setLanguage, dir, isRTL, t } = useTranslation();

  return (
    <div>
      <span data-testid="current-lang">{language}</span>
      <span data-testid="current-dir">{dir}</span>
      <span data-testid="is-rtl">{isRTL ? 'true' : 'false'}</span>
      <span data-testid="installed-title">{t.tabTitles.installed.title}</span>
      <span data-testid="install-btn">{t.common.install}</span>
      <button onClick={() => setLanguage('de')}>Set German</button>
      <button onClick={() => setLanguage('ur')}>Set Urdu</button>
      <button onClick={() => setLanguage('en')}>Set English</button>
      <LanguageSelector />
    </div>
  );
};

describe('i18n System', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
  });

  it('loads English translations by default', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );

    expect(screen.getByTestId('current-lang')).toHaveTextContent('en');
    expect(screen.getByTestId('current-dir')).toHaveTextContent('ltr');
    expect(screen.getByTestId('is-rtl')).toHaveTextContent('false');
    expect(screen.getByTestId('installed-title')).toHaveTextContent('Installed Packages');
    expect(screen.getByTestId('install-btn')).toHaveTextContent('Install');
  });

  it('switches to German (European language) correctly', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );

    fireEvent.click(screen.getByText('Set German'));

    expect(screen.getByTestId('current-lang')).toHaveTextContent('de');
    expect(screen.getByTestId('current-dir')).toHaveTextContent('ltr');
    expect(screen.getByTestId('is-rtl')).toHaveTextContent('false');
    expect(screen.getByTestId('installed-title')).toHaveTextContent('Installierte Pakete');
    expect(screen.getByTestId('install-btn')).toHaveTextContent('Installieren');
    expect(localStorage.getItem(STORAGE_KEYS.LANGUAGE)).toBe('de');
  });

  it('switches to Urdu and activates RTL direction', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );

    fireEvent.click(screen.getByText('Set Urdu'));

    expect(screen.getByTestId('current-lang')).toHaveTextContent('ur');
    expect(screen.getByTestId('current-dir')).toHaveTextContent('rtl');
    expect(screen.getByTestId('is-rtl')).toHaveTextContent('true');
    expect(screen.getByTestId('installed-title')).toHaveTextContent('انسٹال شدہ پیکجز');
    expect(screen.getByTestId('install-btn')).toHaveTextContent('انسٹال کریں');
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('ur');
    expect(localStorage.getItem(STORAGE_KEYS.LANGUAGE)).toBe('ur');
  });

  it('renders LanguageSelector dropdown and changes language via UI selection', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );

    // Open language selector
    const selectorBtn = screen.getByTitle('Change Language');
    fireEvent.click(selectorBtn);

    // Select Deutsch
    const germanOption = screen.getByText('Deutsch');
    fireEvent.click(germanOption);

    expect(screen.getByTestId('current-lang')).toHaveTextContent('de');
    expect(localStorage.getItem(STORAGE_KEYS.LANGUAGE)).toBe('de');
  });

  it('validates all locale keys exist and are non-empty for all supported languages', () => {
    const checkObjectKeys = (reference: Record<string, any>, target: Record<string, any>, path: string) => {
      Object.keys(reference).forEach((key) => {
        const currentPath = path ? `${path}.${key}` : key;
        expect(target[key], `Missing key in locale: ${currentPath}`).toBeDefined();
        if (typeof reference[key] === 'object' && reference[key] !== null) {
          expect(typeof target[key], `Expected object at ${currentPath}`).toBe('object');
          checkObjectKeys(reference[key], target[key], currentPath);
        } else {
          expect(typeof target[key], `Expected string at ${currentPath}`).toBe('string');
          expect(target[key].trim().length, `Empty string at ${currentPath}`).toBeGreaterThan(0);
        }
      });
    };

    const languages = ['de', 'fr', 'es', 'ur'] as const;
    languages.forEach((lang) => {
      checkObjectKeys(LOCALES.en, LOCALES[lang], lang);
    });
  });
});
