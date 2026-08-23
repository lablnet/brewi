import { useState } from 'react';
import { Trash2, HardDrive, RefreshCw, Sparkles, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { BrewCleanupResult } from '../../types';
import { Spinner } from '../common/Spinner';
import { useTranslation } from '../../i18n';

interface CleanupViewProps {
  cleanupResult: BrewCleanupResult | null;
  loading: boolean;
  onScanCleanup: () => void;
  onRunCleanup: (pruneAll: boolean) => void;
}

export const CleanupView: React.FC<CleanupViewProps> = ({
  cleanupResult,
  loading,
  onScanCleanup,
  onRunCleanup,
}) => {
  const { t } = useTranslation();
  const [pruneAll, setPruneAll] = useState<boolean>(true);

  // Smart Auto-Cleanup Rules (persisted in localStorage)
  const [autoPurge30d, setAutoPurge30d] = useState<boolean>(() => {
    return localStorage.getItem('brewi_autoclean_30d') === 'true';
  });
  const [purgeOldBottles, setPurgeOldBottles] = useState<boolean>(() => {
    return localStorage.getItem('brewi_purge_bottles') === 'true';
  });
  const [cleanOnExit, setCleanOnExit] = useState<boolean>(() => {
    return localStorage.getItem('brewi_clean_exit') === 'true';
  });

  const toggleRule = (rule: '30d' | 'bottles' | 'exit', val: boolean) => {
    if (rule === '30d') {
      setAutoPurge30d(val);
      localStorage.setItem('brewi_autoclean_30d', val.toString());
    } else if (rule === 'bottles') {
      setPurgeOldBottles(val);
      localStorage.setItem('brewi_purge_bottles', val.toString());
    } else if (rule === 'exit') {
      setCleanOnExit(val);
      localStorage.setItem('brewi_clean_exit', val.toString());
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 glass-panel flex items-center justify-between shrink-0 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Trash2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t.cleanup.title}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.cleanup.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onScanCleanup}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-slate-300 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? <Spinner size="sm" /> : <RefreshCw className="w-3.5 h-3.5" />}
            <span>{t.cleanup.dryRun}</span>
          </button>

          {cleanupResult && cleanupResult.items.length > 0 && (
            <button
              onClick={() => onRunCleanup(pruneAll)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 transition text-xs shadow-md shadow-amber-500/15 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>{t.cleanup.cleanNow} ({cleanupResult.total_formatted})</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 overflow-y-auto space-y-6">
        {/* Smart Auto-Cleanup Rules Widget */}
        <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-white/10 max-w-3xl space-y-3 bg-slate-100/80 dark:bg-slate-900/40 shadow-sm">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {t.cleanup.smartRulesTitle}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <label className="p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 hover:border-emerald-500/50 flex items-start gap-2.5 cursor-pointer transition shadow-xs">
              <input
                type="checkbox"
                checked={autoPurge30d}
                onChange={(e) => toggleRule('30d', e.target.checked)}
                className="mt-0.5 rounded bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-white/20 text-emerald-600 focus:ring-0 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-slate-950 dark:text-slate-200 block">{t.cleanup.prune30Days}</span>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight block mt-0.5">
                  {t.cleanup.prune30DaysDesc}
                </span>
              </div>
            </label>

            <label className="p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 hover:border-emerald-500/50 flex items-start gap-2.5 cursor-pointer transition shadow-xs">
              <input
                type="checkbox"
                checked={purgeOldBottles}
                onChange={(e) => toggleRule('bottles', e.target.checked)}
                className="mt-0.5 rounded bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-white/20 text-emerald-600 focus:ring-0 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-slate-950 dark:text-slate-200 block">{t.cleanup.purgeBottles}</span>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight block mt-0.5">
                  {t.cleanup.purgeBottlesDesc}
                </span>
              </div>
            </label>

            <label className="p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 hover:border-emerald-500/50 flex items-start gap-2.5 cursor-pointer transition shadow-xs">
              <input
                type="checkbox"
                checked={cleanOnExit}
                onChange={(e) => toggleRule('exit', e.target.checked)}
                className="mt-0.5 rounded bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-white/20 text-emerald-600 focus:ring-0 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-slate-950 dark:text-slate-200 block">{t.cleanup.autoCleanExit}</span>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight block mt-0.5">
                  {t.cleanup.autoCleanExitDesc}
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Scan & Results */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center">
            <Spinner size="lg" label={t.cleanup.dryRunning} />
          </div>
        ) : cleanupResult === null ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 space-y-3">
            <HardDrive className="w-10 h-10 text-slate-400 dark:text-slate-600 stroke-[1.5]" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.cleanup.noCleanupNeeded}</p>
            <p className="text-xs text-slate-500 max-w-sm text-center">
              {t.cleanup.noCleanupDesc}
            </p>
            <button
              onClick={onScanCleanup}
              className="mt-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 transition text-xs cursor-pointer flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{t.cleanup.scanReclaimableSpace}</span>
            </button>
          </div>
        ) : cleanupResult.items.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{t.cleanup.allCleanTitle}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.cleanup.allCleanDesc}</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl pb-8">
            {/* Summary Banner */}
            <div className="p-4 rounded-xl glass-card border border-amber-500/30 bg-amber-500/5 flex items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t.cleanup.reclaimableSpace}: <span className="text-amber-600 dark:text-amber-400">{cleanupResult.total_formatted}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{cleanupResult.items.length} {t.cleanup.obsoleteItemsCount}</p>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pruneAll}
                  onChange={(e) => setPruneAll(e.target.checked)}
                  className="rounded bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-white/20 text-amber-500 focus:ring-0"
                />
                <span>{t.cleanup.pruneAllCaches}</span>
              </label>
            </div>

            {/* List of files */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t.cleanup.filesToRemove}
              </span>
              <div className="space-y-1.5">
                {cleanupResult.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl glass-card border border-slate-200 dark:border-white/5 flex items-center justify-between text-xs shadow-xs"
                  >
                    <span
                      dir="ltr"
                      className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate max-w-xl text-left"
                    >
                      {item.path}
                    </span>
                    {item.size_bytes > 0 && (
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-white/5 text-slate-700 dark:text-slate-400 shrink-0">
                        {item.size_formatted}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
