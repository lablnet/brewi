import React from 'react';
import { Search, RefreshCw, Terminal, Plus, Cpu, Sun, Moon } from 'lucide-react';
import { ViewTab } from '../../types';
import { Spinner } from '../common/Spinner';
import { TAB_TITLES } from '../../utils/constants';
import { formatArch } from '../../utils/formatters';
import { useTranslation } from '../../i18n/LanguageContext';
import { LanguageSelector } from '../common/LanguageSelector';

interface TitlebarProps {
  activeTab: ViewTab;
  isTaskRunning: boolean;
  isTerminalOpen: boolean;
  onToggleTerminal: () => void;
  onRefresh: () => void;
  onOpenCommandPalette: () => void;
  onOpenInstallModal: () => void;
  arch?: string;
  refreshing: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Titlebar: React.FC<TitlebarProps> = ({
  activeTab,
  isTaskRunning,
  isTerminalOpen,
  onToggleTerminal,
  onRefresh,
  onOpenCommandPalette,
  onOpenInstallModal,
  arch,
  refreshing,
  theme,
  onToggleTheme,
}) => {
  const { t } = useTranslation();
  const currentTabTitle = t.tabTitles[activeTab]?.title || TAB_TITLES[activeTab].title;

  return (
    <header
      data-tauri-drag-region
      className="h-14 w-full flex items-center justify-between px-4 border-b border-white/10 glass-panel app-drag-region select-none shrink-0 z-20 gap-3"
    >
      {/* Title & Breadcrumb */}
      <div data-tauri-drag-region className="flex items-center gap-3 px-2 min-w-0">
        <h1 data-tauri-drag-region className="text-sm font-semibold flex items-center gap-2 truncate">
          <span data-tauri-drag-region className="truncate">{currentTabTitle}</span>
          {arch && (
            <span
              data-tauri-drag-region
              title={`Running Homebrew on ${formatArch(arch)}`}
              className="text-[10px] px-2 py-0.5 rounded-lg bg-white/10 text-slate-300 font-mono flex items-center gap-1.5 border border-white/10 shrink-0"
            >
              <Cpu className="w-3 h-3 text-amber-400" />
              {formatArch(arch)}
            </span>
          )}
        </h1>
      </div>

      {/* Center Search Shortcut (Cmd + K) */}
      <button
        onClick={onOpenCommandPalette}
        className="app-no-drag flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 text-slate-400 hover:text-slate-200 transition-all text-xs w-64 shadow-inner cursor-pointer"
      >
        <span className="flex items-center gap-2 min-w-0 truncate">
          <Search className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="truncate">{t.common.searchPlaceholder}</span>
        </span>
        <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-slate-400 shrink-0">⌘K</kbd>
      </button>

      {/* Right Action buttons */}
      <div className="flex items-center gap-2 app-no-drag shrink-0">
        {/* Language Selector */}
        <LanguageSelector />

        {/* Theme Switcher Button */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-amber-400 transition cursor-pointer"
          title={theme === 'dark' ? t.common.switchThemeLight : t.common.switchThemeDark}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
        </button>

        <button
          onClick={onOpenInstallModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold shadow-sm transition cursor-pointer"
          title="Install a formula or cask"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{t.common.install}</span>
        </button>

        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-200 transition cursor-pointer disabled:opacity-50"
          title={t.common.refresh}
        >
          {refreshing ? <Spinner size="sm" /> : <RefreshCw className="w-4 h-4" />}
        </button>

        <button
          onClick={onToggleTerminal}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition cursor-pointer ${
            isTerminalOpen
              ? 'bg-slate-800 border-amber-500/50 text-amber-400'
              : isTaskRunning
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 animate-pulse'
              : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
          }`}
          title={t.common.terminalLogs}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>{t.common.logs}</span>
          {isTaskRunning && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping ml-1" />}
        </button>
      </div>
    </header>
  );
};
