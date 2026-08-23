import React, { useState } from 'react';
import { X, Search, Download, Beer, Monitor, Plus, Check, ArrowUpCircle } from 'lucide-react';
import { usePackageSearch } from '../../hooks/usePackageSearch';
import { Spinner } from '../common/Spinner';
import { PackageSummary } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';

interface InstallPackageModalProps {
  installedPackages?: PackageSummary[];
  onClose: () => void;
  onInstall: (name: string, isCask: boolean) => void;
  onUpgrade?: (name: string) => void;
  onInspectPackage?: (pkg: PackageSummary) => void;
}

export const InstallPackageModal: React.FC<InstallPackageModalProps> = ({
  installedPackages = [],
  onClose,
  onInstall,
  onUpgrade,
  onInspectPackage,
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState<string>('');
  const { results, searching, searched, searchPackages } = usePackageSearch();

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    searchPackages(query);
  };

  const handleDirectInstall = (nameToInstall: string, cask: boolean) => {
    if (!nameToInstall.trim()) return;
    onInstall(nameToInstall.trim(), cask);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-in fade-in">
      <div
        className="w-full max-w-lg glass-modal rounded-2xl border border-white/10 flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">{t.installModal.title}</h2>
              <p className="text-xs text-slate-400">{t.installModal.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="p-5 border-b border-white/10 space-y-3">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 rtl:left-auto rtl:right-3 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.installModal.placeholder}
                className="w-full pl-9 pr-3 rtl:pl-3 rtl:pr-9 py-2 rounded-xl text-xs glass-input text-slate-100 placeholder-slate-400"
              />
            </div>
            <button
              type="submit"
              disabled={searching || !query.trim()}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 transition text-xs flex items-center space-x-1.5 rtl:space-x-reverse disabled:opacity-50 cursor-pointer"
            >
              {searching ? <Spinner size="sm" className="text-slate-950" /> : <Search className="w-3.5 h-3.5" />}
              <span>{t.installModal.searchBtn}</span>
            </button>
          </div>

          {/* Quick Direct Install Fallback */}
          {query.trim() && (
            <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
              <span className="truncate">{t.installModal.directInstall}</span>
              <div className="flex items-center space-x-1.5 rtl:space-x-reverse shrink-0">
                <button
                  type="button"
                  onClick={() => handleDirectInstall(query, false)}
                  className="px-2 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/25 text-[11px] font-medium transition cursor-pointer"
                >
                  {t.common.formula} 🍺
                </button>
                <button
                  type="button"
                  onClick={() => handleDirectInstall(query, true)}
                  className="px-2 py-1 rounded bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/25 text-[11px] font-medium transition cursor-pointer"
                >
                  {t.common.cask} 🖥️
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Search Results List */}
        <div className="max-h-72 overflow-y-auto p-4 space-y-2">
          {searching ? (
            <div className="p-8 flex flex-col items-center justify-center">
              <Spinner size="lg" label={t.installModal.searching} />
            </div>
          ) : searched && results.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              {t.installModal.noResults}
            </div>
          ) : results.length > 0 ? (
            results.map((res) => {
              const cask = res.package_type === 'cask';
              const installedPkg = installedPackages.find(
                (p) => p.name.toLowerCase() === res.name.toLowerCase()
              );
              const isInstalled = !!installedPkg;
              const isOutdated = installedPkg?.is_outdated;

              return (
                <div
                  key={res.id}
                  className="p-3 rounded-xl glass-card flex items-center justify-between border border-white/5 hover:border-white/15 transition"
                >
                  <div
                    onClick={() => {
                      if (installedPkg && onInspectPackage) {
                        onInspectPackage(installedPkg);
                        onClose();
                      }
                    }}
                    className={`flex items-center space-x-2.5 rtl:space-x-reverse min-w-0 ${
                      installedPkg ? 'cursor-pointer' : ''
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                        cask
                          ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      }`}
                    >
                      {cask ? <Monitor className="w-3.5 h-3.5" /> : <Beer className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-slate-200 truncate flex items-center gap-1.5">
                        <span>{res.name}</span>
                        {isInstalled && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-normal">
                            {t.installModal.alreadyInstalled}
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-slate-400 capitalize">{res.package_type}</p>
                    </div>
                  </div>

                  {isOutdated ? (
                    <button
                      onClick={() => {
                        if (onUpgrade) onUpgrade(res.name);
                        onClose();
                      }}
                      className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer shadow"
                    >
                      <ArrowUpCircle className="w-3.5 h-3.5" />
                      <span>{t.common.upgrade}</span>
                    </button>
                  ) : isInstalled ? (
                    <button
                      onClick={() => {
                        if (installedPkg && onInspectPackage) {
                          onInspectPackage(installedPkg);
                          onClose();
                        }
                      }}
                      className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-medium cursor-pointer hover:bg-emerald-500/25 transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{t.installModal.alreadyInstalled}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDirectInstall(res.name, cask)}
                      className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold shadow-sm transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{t.installModal.installAction}</span>
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              {t.installModal.subtitle}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
