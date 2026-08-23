import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Package,
  ArrowUpCircle,
  Server,
  GitBranch,
  Stethoscope,
  Trash2,
  FileCode,
  Beer,
  Monitor,
  Sparkles,
} from 'lucide-react';
import { PackageSummary, ViewTab } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  packages: PackageSummary[];
  onSelectTab: (tab: ViewTab) => void;
  onSelectPackage: (pkg: PackageSummary) => void;
  onRunDoctor: () => void;
  onScanCleanup: () => void;
  onUpdateBrew: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  packages,
  onSelectTab,
  onSelectPackage,
  onRunDoctor,
  onScanCleanup,
  onUpdateBrew,
}) => {
  const [query, setQuery] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Command items
  const navCommands = [
    { id: 'tab:installed', label: 'Go to Installed Packages', icon: Package, tab: 'installed' as ViewTab },
    { id: 'tab:updates', label: 'Go to Pending Updates', icon: ArrowUpCircle, tab: 'updates' as ViewTab },
    { id: 'tab:services', label: 'Go to Background Services', icon: Server, tab: 'services' as ViewTab },
    { id: 'tab:taps', label: 'Go to Taps & Repositories', icon: GitBranch, tab: 'taps' as ViewTab },
    { id: 'tab:doctor', label: 'Run Brew Doctor Diagnostics', icon: Stethoscope, action: onRunDoctor, tab: 'doctor' as ViewTab },
    { id: 'tab:cleanup', label: 'Scan Reclaimable Disk Space', icon: Trash2, action: onScanCleanup, tab: 'cleanup' as ViewTab },
    { id: 'tab:brewfile', label: 'Export Brewfile Snapshot', icon: FileCode, tab: 'brewfile' as ViewTab },
    { id: 'act:update_brew', label: 'Update Homebrew Core (brew update)', icon: Sparkles, action: onUpdateBrew },
  ];

  const filteredCommands = navCommands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase().trim())
  );

  const matchedPackages = query.trim()
    ? packages
        .filter((pkg) => pkg.name.toLowerCase().includes(query.toLowerCase().trim()))
        .slice(0, 8)
    : [];

  const allItems = [
    ...filteredCommands.map((c) => ({ type: 'command' as const, item: c })),
    ...matchedPackages.map((p) => ({ type: 'package' as const, item: p })),
  ];

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < allItems.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : allItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = allItems[selectedIndex];
      if (current) {
        if (current.type === 'command') {
          if (current.item.tab) onSelectTab(current.item.tab);
          if (current.item.action) current.item.action();
        } else {
          onSelectPackage(current.item);
        }
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/75 backdrop-blur-md p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl glass-modal rounded-2xl border border-white/15 flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input header */}
        <div className="p-3.5 border-b border-white/10 flex items-center space-x-3 bg-slate-900/80">
          <Search className="w-4 h-4 text-amber-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, package name, or view..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-slate-400 shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {allItems.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">No matching commands or packages</div>
          ) : (
            allItems.map((entry, idx) => {
              const isSelected = idx === selectedIndex;
              if (entry.type === 'command') {
                const cmd = entry.item;
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => {
                      if (cmd.tab) onSelectTab(cmd.tab);
                      if (cmd.action) cmd.action();
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{cmd.label}</span>
                    </div>
                    <span className="text-[10px] font-mono opacity-60">Command</span>
                  </button>
                );
              } else {
                const pkg = entry.item;
                const isCask = pkg.package_type === 'cask';
                return (
                  <button
                    key={pkg.id}
                    onClick={() => {
                      onSelectPackage(pkg);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      {isCask ? <Monitor className="w-4 h-4 text-purple-400" /> : <Beer className="w-4 h-4 text-amber-400" />}
                      <span>{pkg.name}</span>
                      <span className="text-[10px] opacity-70 truncate max-w-xs">{pkg.desc}</span>
                    </div>
                    <span className="text-[10px] font-mono opacity-60 capitalize">{pkg.package_type}</span>
                  </button>
                );
              }
            })
          )}
        </div>
      </div>
    </div>
  );
};
