import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';
import { LanguageCode } from '../../i18n/types';

interface LanguageSelectorProps {
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = '' }) => {
  const { language, setLanguage, languages, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeOption = languages.find((l) => l.code === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectLanguage = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title={t.common.changeLanguage}
        className="flex items-center space-x-1.5 px-2 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/10 transition cursor-pointer text-xs font-medium border border-transparent hover:border-white/5"
      >
        <Globe className="w-3.5 h-3.5 text-amber-500" />
        <span className="font-mono text-[11px] uppercase">{activeOption.code}</span>
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 ltr:right-0 rtl:left-0 rtl:right-auto mt-2 w-48 rounded-xl glass-modal border border-white/10 shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3 py-1.5 border-b border-white/10 text-[10px] uppercase font-semibold tracking-wider text-slate-400">
            {t.common.changeLanguage}
          </div>
          {languages.map((lang) => {
            const isSelected = lang.code === language;
            return (
              <button
                key={lang.code}
                role="menuitem"
                onClick={() => handleSelectLanguage(lang.code)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs transition cursor-pointer text-left rtl:text-right ${
                  isSelected
                    ? 'bg-amber-500/15 text-amber-300 font-semibold'
                    : 'text-slate-300 hover:bg-white/5 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center space-x-2 rtl:space-x-reverse min-w-0">
                  <span className="text-sm shrink-0">{lang.flag}</span>
                  <div className="truncate">
                    <span className="block text-xs">{lang.nativeName}</span>
                    <span className="block text-[10px] text-slate-400">{lang.name}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0">
                  {lang.dir === 'rtl' && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-white/10 text-slate-400 font-mono">
                      RTL
                    </span>
                  )}
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
