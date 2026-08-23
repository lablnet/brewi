import { useState } from 'react';
import {
  GitBranch,
  Plus,
  Trash2,
  ExternalLink,
  Beer,
  Monitor,
  X,
  Sparkles,
  LayoutGrid,
  List,
} from 'lucide-react';
import { BrewTap } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';
import { POPULAR_TAPS } from '../../utils/constants';
import { useTranslation } from '../../i18n/LanguageContext';

interface TapsViewProps {
  taps: BrewTap[];
  loading: boolean;
  onAddTap: (tapName: string) => void;
  onRemoveTap: (tapName: string) => void;
}

type ViewMode = 'grid' | 'list';

export const TapsView: React.FC<TapsViewProps> = ({ taps, loading, onAddTap, onRemoveTap }) => {
  const { t, dir } = useTranslation();
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [customTap, setCustomTap] = useState<string>('');
  const [untapTarget, setUntapTarget] = useState<string | null>(null);

  // Layout View Mode (Grid vs List) with localStorage persistence
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('brewi_view_mode') as ViewMode) || 'grid';
  });

  const handleToggleViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('brewi_view_mode', mode);
  };

  const handleAdd = (name: string) => {
    if (!name.trim()) return;
    onAddTap(name.trim());
    setCustomTap('');
    setShowAddModal(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 glass-panel flex items-center justify-between shrink-0 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
            <GitBranch className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t.taps.title}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {taps.length} {t.taps.externalReposCount}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Grid / List View Toggle */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-200 dark:bg-slate-900/80 border border-slate-300 dark:border-white/10">
            <button
              onClick={() => handleToggleViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title={t.packages.gridView}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleToggleViewMode('list')}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title={t.packages.listView}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 transition text-xs cursor-pointer shadow-md shadow-amber-500/10"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.taps.addTap}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {loading ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 gap-3'
                : 'space-y-2'
            }
          >
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={
                  viewMode === 'grid'
                    ? 'h-28 rounded-xl glass-card animate-pulse bg-slate-200 dark:bg-white/5'
                    : 'h-14 rounded-xl glass-card animate-pulse bg-slate-200 dark:bg-white/5'
                }
              />
            ))}
          </div>
        ) : taps.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 space-y-2">
            <GitBranch className="w-8 h-8 text-slate-400 dark:text-slate-600" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.taps.noTaps}</p>
            <p className="text-xs text-slate-500">{t.taps.noTapsDesc}</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-8">
            {taps.map((tap) => (
              <div
                key={tap.name}
                className="p-4 rounded-xl glass-card border border-slate-200 dark:border-white/5 hover:border-amber-500/30 flex flex-col justify-between gap-3 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <GitBranch className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{tap.name}</h3>
                        {tap.official && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/25 text-[10px] font-mono font-bold shadow-2xs">
                            {t.taps.official}
                          </span>
                        )}
                      </div>
                      {tap.remote && (
                        <a
                          href={tap.remote}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-slate-600 dark:text-slate-400 hover:text-amber-700 dark:hover:text-amber-400 flex items-center gap-1 mt-0.5 truncate transition"
                        >
                          <span className="truncate">{tap.remote}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-3">
                    {tap.formula_count > 0 && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                        <Beer className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>{tap.formula_count} {t.common.formula}</span>
                      </span>
                    )}
                    {tap.cask_count > 0 && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                        <Monitor className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span>{tap.cask_count} {t.common.cask}</span>
                      </span>
                    )}
                  </div>

                  {!tap.official && (
                    <button
                      onClick={() => setUntapTarget(tap.name)}
                      className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-500/10 transition cursor-pointer"
                      title={t.taps.untap}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2 pb-8">
            {taps.map((tap) => (
              <div
                key={tap.name}
                className="p-3 px-4 rounded-xl glass-card border border-slate-200 dark:border-white/5 hover:border-amber-500/30 flex items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <GitBranch className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{tap.name}</h3>
                      {tap.official && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/25 text-[9px] font-mono font-bold shadow-2xs">
                          {t.taps.official}
                        </span>
                      )}
                    </div>
                    {tap.remote && (
                      <a
                        href={tap.remote}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-slate-600 dark:text-slate-400 hover:text-amber-700 dark:hover:text-amber-400 flex items-center gap-1 truncate transition hidden md:flex"
                      >
                        <span className="truncate">{tap.remote}</span>
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400">
                    {tap.formula_count > 0 && (
                      <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                        <Beer className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>{tap.formula_count}</span>
                      </span>
                    )}
                    {tap.cask_count > 0 && (
                      <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                        <Monitor className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span>{tap.cask_count}</span>
                      </span>
                    )}
                  </div>

                  {!tap.official && (
                    <button
                      onClick={() => setUntapTarget(tap.name)}
                      className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-500/10 transition cursor-pointer"
                      title={t.taps.untap}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Untap Confirmation Modal */}
      <ConfirmModal
        isOpen={untapTarget !== null}
        onClose={() => setUntapTarget(null)}
        onConfirm={() => {
          if (untapTarget) {
            onRemoveTap(untapTarget);
            setUntapTarget(null);
          }
        }}
        title={`${t.taps.untap} ${untapTarget}`}
        message={t.taps.confirmUntapMessage.replace('{tap}', untapTarget || '')}
        confirmText={t.taps.untap}
        type="danger"
      />

      {/* Add Tap Modal */}
      {showAddModal && (
        <div
          dir={dir}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-in fade-in select-none"
        >
          <div
            className="w-full max-w-md glass-modal rounded-2xl border border-white/10 flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
              <h3 className="text-sm font-bold text-white">{t.taps.addNewTap}</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4 text-xs">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAdd(customTap);
                }}
                className="space-y-2"
              >
                <label className="text-slate-300 font-medium">{t.taps.repoNameLabel}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    autoFocus
                    value={customTap}
                    onChange={(e) => setCustomTap(e.target.value)}
                    placeholder="e.g. user/repo or https://github.com/..."
                    className="flex-1 px-3 py-2 rounded-xl text-xs glass-input text-slate-100"
                  />
                  <button
                    type="submit"
                    disabled={!customTap.trim()}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 disabled:opacity-50 transition cursor-pointer shrink-0"
                  >
                    {t.taps.tapActionBtn}
                  </button>
                </div>
              </form>

              {/* Suggestions */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <span className="text-slate-400 font-medium text-[11px] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  {t.taps.popularSuggestions}
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {POPULAR_TAPS.map((sug) => (
                    <button
                      key={sug.name}
                      onClick={() => handleAdd(sug.name)}
                      className="p-2 rounded-lg bg-slate-900/60 hover:bg-amber-500/15 hover:border-amber-500/30 border border-white/5 text-left rtl:text-right transition cursor-pointer"
                    >
                      <div className="font-mono text-slate-200 text-[11px] truncate">{sug.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{sug.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
