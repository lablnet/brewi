import { useState } from 'react';
import {
  ArrowUpCircle,
  RefreshCw,
  Beer,
  Monitor,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  LayoutGrid,
  List,
} from 'lucide-react';
import { PackageSummary } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';
import { cleanVersion } from '../../utils/formatters';
import { useTranslation } from '../../i18n/LanguageContext';

interface UpdatesViewProps {
  outdatedPackages: PackageSummary[];
  loading: boolean;
  onUpgrade: (names: string[], greedy?: boolean) => void;
  onUpdateBrew: () => void;
  onRefresh: () => void;
}

type ViewMode = 'grid' | 'list';

export const UpdatesView: React.FC<UpdatesViewProps> = ({
  outdatedPackages,
  loading,
  onUpgrade,
  onUpdateBrew,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const [greedy, setGreedy] = useState<boolean>(false);
  const [upgradeTarget, setUpgradeTarget] = useState<string[] | null>(null);

  // Layout View Mode (Grid vs List) with localStorage persistence
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('brewi_view_mode') as ViewMode) || 'grid';
  });

  const handleToggleViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('brewi_view_mode', mode);
  };

  const formulae = outdatedPackages.filter((p) => p.package_type === 'formula');
  const casks = outdatedPackages.filter((p) => p.package_type === 'cask');

  const handleUpgradeAllClick = () => {
    const names = outdatedPackages.map((p) => p.name);
    if (names.length > 0) {
      setUpgradeTarget(names);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header Banner */}
      <div className="p-4 border-b border-white/10 glass-panel flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <ArrowUpCircle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">{t.updates.title}</h2>
            <p className="text-xs text-slate-400">
              {outdatedPackages.length} {t.updates.pendingCount}
            </p>
          </div>
        </div>

        {/* Action controls and Layout Switcher */}
        <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
          {/* Grid / List View Toggle */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-900/80 border border-white/10">
            <button
              onClick={() => handleToggleViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
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
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={t.packages.listView}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <label className="flex items-center space-x-1.5 rtl:space-x-reverse text-xs text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={greedy}
              onChange={(e) => setGreedy(e.target.checked)}
              className="rounded bg-slate-900 border-white/20 text-amber-500 focus:ring-0"
            />
            <span>Include greedy casks (--greedy)</span>
          </label>

          <button
            onClick={onUpdateBrew}
            className="flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 transition cursor-pointer"
            title="Run brew update"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Update Brew</span>
          </button>

          {outdatedPackages.length > 0 && (
            <button
              onClick={handleUpgradeAllClick}
              className="flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 transition text-xs shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.updates.upgradeAll} ({outdatedPackages.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {loading ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'
                : 'space-y-2'
            }
          >
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={
                  viewMode === 'grid'
                    ? 'h-36 rounded-xl glass-card animate-pulse bg-white/5'
                    : 'h-16 rounded-xl glass-card animate-pulse bg-white/5'
                }
              />
            ))}
          </div>
        ) : outdatedPackages.length === 0 ? (
          <div className="h-72 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-200">All packages are up to date!</p>
            <p className="text-xs text-slate-500">Your Homebrew environment is fully updated.</p>
            <button
              onClick={onRefresh}
              className="mt-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 transition cursor-pointer"
            >
              Check Again
            </button>
          </div>
        ) : (
          <div className="space-y-5 pb-8">
            {/* Outdated Formulae Section */}
            {formulae.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Beer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Formulae ({formulae.length})</span>
                </h3>

                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {formulae.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="p-4 rounded-xl glass-card border border-white/5 hover:border-amber-500/30 transition flex flex-col justify-between space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                              <Beer className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-slate-100 truncate">{pkg.name}</h4>
                              <p className="text-[11px] text-slate-400 truncate">{pkg.tap || 'homebrew/core'}</p>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed min-h-[2rem]">
                          {pkg.desc || 'No description provided.'}
                        </p>

                        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                          <div className="flex items-center space-x-1.5 font-mono text-[11px]">
                            <span className="px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                              {cleanVersion(pkg.installed_version) || 'old'}
                            </span>
                            <ArrowRight className="w-3 h-3 text-slate-600" />
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {cleanVersion(pkg.latest_version) || 'new'}
                            </span>
                          </div>

                          <button
                            onClick={() => setUpgradeTarget([pkg.name])}
                            className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 text-xs transition cursor-pointer shadow"
                          >
                            <ArrowUpCircle className="w-3.5 h-3.5" />
                            <span>Upgrade</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formulae.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="p-3.5 rounded-xl glass-card border border-white/5 hover:border-white/15 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                            <Beer className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-slate-100 truncate">{pkg.name}</h4>
                            <p className="text-[11px] text-slate-400 truncate">{pkg.desc || pkg.tap}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 shrink-0">
                          <div className="flex items-center space-x-2 font-mono text-xs">
                            <span className="px-2 py-0.5 rounded bg-white/5 text-slate-400">
                              {cleanVersion(pkg.installed_version) || 'old'}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {cleanVersion(pkg.latest_version) || 'new'}
                            </span>
                          </div>

                          <button
                            onClick={() => setUpgradeTarget([pkg.name])}
                            className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-medium transition cursor-pointer"
                          >
                            <ArrowUpCircle className="w-3.5 h-3.5" />
                            <span>Upgrade</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Outdated Casks Section */}
            {casks.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-purple-400" />
                  <span>Casks ({casks.length})</span>
                </h3>

                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {casks.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="p-4 rounded-xl glass-card border border-white/5 hover:border-purple-500/30 transition flex flex-col justify-between space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                              <Monitor className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-slate-100 truncate">{pkg.name}</h4>
                              <p className="text-[11px] text-slate-400 truncate">{pkg.tap || 'homebrew/cask'}</p>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed min-h-[2rem]">
                          {pkg.desc || 'No description provided.'}
                        </p>

                        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                          <div className="flex items-center space-x-1.5 font-mono text-[11px]">
                            <span className="px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                              {cleanVersion(pkg.installed_version) || 'old'}
                            </span>
                            <ArrowRight className="w-3 h-3 text-slate-600" />
                            <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              {cleanVersion(pkg.latest_version) || 'new'}
                            </span>
                          </div>

                          <button
                            onClick={() => setUpgradeTarget([pkg.name])}
                            className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 text-xs transition cursor-pointer shadow"
                          >
                            <ArrowUpCircle className="w-3.5 h-3.5" />
                            <span>Upgrade</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {casks.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="p-3.5 rounded-xl glass-card border border-white/5 hover:border-white/15 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                            <Monitor className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-slate-100 truncate">{pkg.name}</h4>
                            <p className="text-[11px] text-slate-400 truncate">{pkg.desc || pkg.tap}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 shrink-0">
                          <div className="flex items-center space-x-2 font-mono text-xs">
                            <span className="px-2 py-0.5 rounded bg-white/5 text-slate-400">
                              {cleanVersion(pkg.installed_version) || 'old'}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              {cleanVersion(pkg.latest_version) || 'new'}
                            </span>
                          </div>

                          <button
                            onClick={() => setUpgradeTarget([pkg.name])}
                            className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-medium transition cursor-pointer"
                          >
                            <ArrowUpCircle className="w-3.5 h-3.5" />
                            <span>Upgrade</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upgrade Confirmation Modal */}
      <ConfirmModal
        isOpen={upgradeTarget !== null}
        onClose={() => setUpgradeTarget(null)}
        onConfirm={() => {
          if (upgradeTarget) {
            onUpgrade(upgradeTarget, greedy);
          }
        }}
        title={t.common.confirmUpgradeTitle}
        message={`${t.common.confirmUpgradeDesc} ${
          upgradeTarget?.length === 1 ? upgradeTarget[0] : `${upgradeTarget?.length || 0} ${t.packages.outdatedFilter}`
        }?`}
        confirmText={t.common.upgrade}
        type="info"
        details={upgradeTarget || undefined}
      />
    </div>
  );
};
