import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Beer,
  Monitor,
  Pin,
  Trash2,
  Folder,
  GitBranch,
  Layers,
  Tag,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  BarChart3,
  Trophy,
  Clock,
  Ban,
  History,
  GitCommit,
} from 'lucide-react';
import { PackageSummary } from '../../types';
import { usePackageDetails } from '../../hooks/usePackageDetails';
import { Spinner } from '../common/Spinner';
import { ConfirmModal } from '../common/ConfirmModal';
import { cleanVersion } from '../../utils/formatters';
import { useTranslation } from '../../i18n/LanguageContext';

interface PackageDetailModalProps {
  pkg: PackageSummary;
  onClose: () => void;
  onUpgrade: (name: string) => void;
  onUninstall: (name: string, isCask: boolean, zap?: boolean) => void;
  onPin: (name: string, pin: boolean) => void;
  onInspectOther: (name: string, isCask: boolean) => void;
}

export const PackageDetailModal: React.FC<PackageDetailModalProps> = ({
  pkg,
  onClose,
  onUpgrade,
  onUninstall,
  onPin,
  onInspectOther,
}) => {
  const { t } = useTranslation();
  const isCask = pkg.package_type === 'cask';
  const {
    details,
    analytics,
    installedVersions,
    switchingVersion,
    switchVersion,
    loading,
    revealInFinder,
  } = usePackageDetails(pkg.name, isCask);

  const [zapCask, setZapCask] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'info' | 'tree'>('info');

  const [showUpgradeConfirm, setShowUpgradeConfirm] = useState<boolean>(false);
  const [showUninstallConfirm, setShowUninstallConfirm] = useState<boolean>(false);

  const copyName = () => {
    navigator.clipboard.writeText(pkg.name);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const installedVer = details?.installed_version || pkg.installed_version;
  const latestVer = details?.latest_version || pkg.latest_version;
  const hasNewVersion = pkg.is_outdated || (installedVer && latestVer && installedVer !== latestVer);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-in fade-in">
      <div
        className="w-full max-w-2xl max-h-[85vh] glass-modal rounded-2xl border border-white/10 flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-start justify-between bg-slate-900/60">
          <div className="flex items-center space-x-3.5 rtl:space-x-reverse min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-inner ${
                isCask
                  ? 'bg-purple-500/15 border-purple-500/30 text-purple-400'
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
              }`}
            >
              {isCask ? <Monitor className="w-5 h-5" /> : <Beer className="w-5 h-5" />}
            </div>

            <div className="min-w-0">
              <div className="flex items-center space-x-2 rtl:space-x-reverse flex-wrap gap-y-1">
                <h2 className="text-lg font-bold text-white tracking-tight truncate">{pkg.name}</h2>
                <button
                  onClick={copyName}
                  className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  title={t.common.copy}
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
                  {pkg.package_type}
                </span>
                {pkg.is_pinned && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Pin className="w-2.5 h-2.5 fill-amber-400" />
                    {t.common.pinned}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {pkg.tap || (isCask ? 'homebrew/cask' : 'homebrew/core')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {/* View Switcher: Details vs Dependency Graph Tree */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-950 border border-white/10">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeTab === 'info'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.details.infoTab}
              </button>
              <button
                onClick={() => setActiveTab('tree')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 cursor-pointer ${
                  activeTab === 'tree'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <GitBranch className="w-3 h-3" />
                <span>{t.details.treeTab}</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/10 transition cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5 text-xs text-slate-300 leading-relaxed">
          {loading ? (
            <div className="py-12 flex items-center justify-center">
              <Spinner size="lg" label={t.common.loading} />
            </div>
          ) : activeTab === 'tree' ? (
            /* 🌳 Interactive Dependency Tree Graph Visualizer */
            <div className="space-y-6 animate-in fade-in">
              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <GitBranch className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-white text-xs">Dependency Graph Visualizer</span>
                </div>
                <span className="text-[11px] text-indigo-300 font-mono">
                  {details?.dependencies.length || 0} upstream • {details?.dependents.length || 0} downstream
                </span>
              </div>

              {/* Visual Connected Tree Diagram */}
              <div className="space-y-4">
                {/* Section 1: Required Upstream Dependencies */}
                <div>
                  <h4 className="text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    Required Dependencies ({details?.dependencies.length || 0})
                  </h4>
                  {details?.dependencies.length === 0 ? (
                    <p className="text-slate-500 text-xs italic pl-4">No required upstream dependencies.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pl-4 border-l-2 border-amber-500/30">
                      {details?.dependencies.map((dep) => (
                        <button
                          key={dep}
                          onClick={() => onInspectOther(dep, false)}
                          className="p-2 rounded-xl bg-slate-900/60 hover:bg-amber-500/15 border border-white/10 hover:border-amber-500/40 text-left transition cursor-pointer flex items-center justify-between"
                        >
                          <span className="font-mono text-xs text-amber-300 font-medium truncate">{dep}</span>
                          <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section 2: Active Root Node */}
                <div className="p-4 rounded-xl bg-amber-500/20 border-2 border-amber-500/50 text-white flex items-center justify-between shadow-lg shadow-amber-500/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                      <Beer className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">{pkg.name}</h3>
                      <p className="text-[11px] text-amber-300/80 font-mono">Current active target</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/30 text-amber-200 font-mono text-xs border border-amber-400/40">
                    {cleanVersion(installedVer)}
                  </span>
                </div>

                {/* Section 3: Reverse Downstream Dependents */}
                <div>
                  <h4 className="text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                    <GitCommit className="w-3.5 h-3.5 text-cyan-400" />
                    Reverse Dependents ({details?.dependents.length || 0})
                  </h4>
                  {details?.dependents.length === 0 ? (
                    <p className="text-slate-500 text-xs italic pl-4">
                      No other installed packages depend on {pkg.name}. (Leaf package)
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pl-4 border-l-2 border-cyan-500/30">
                      {details?.dependents.map((dep) => (
                        <button
                          key={dep}
                          onClick={() => onInspectOther(dep, false)}
                          className="p-2 rounded-xl bg-slate-900/60 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/40 text-left transition cursor-pointer flex items-center justify-between"
                        >
                          <span className="font-mono text-xs text-cyan-300 font-medium truncate">{dep}</span>
                          <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Overview Tab */
            <>
              {/* Deprecation / Disabled Warning */}
              {(details?.is_deprecated || details?.is_disabled) && (
                <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/35 text-red-200 space-y-1.5 shadow-inner">
                  <div className="flex items-center space-x-2 font-bold text-red-300">
                    <Ban className="w-4 h-4" />
                    <span>
                      {details.is_disabled ? 'Package Disabled in Homebrew' : 'Package Deprecated'}
                    </span>
                  </div>
                  <p className="text-xs text-red-200/90 leading-normal">
                    {details.disable_reason ||
                      details.deprecation_reason ||
                      'This package is deprecated or disabled in official Homebrew taps.'}
                  </p>
                </div>
              )}

              {/* Version & Update Banner */}
              {hasNewVersion ? (
                <div className="p-3.5 rounded-xl bg-amber-100 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-500/35 text-amber-900 dark:text-amber-200 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-amber-950 dark:text-white text-xs">{t.installModal.updateAvailable}</span>
                      <p className="text-[11px] text-amber-800 dark:text-amber-200/80 font-medium">
                        {cleanVersion(installedVer)} &rarr; {cleanVersion(latestVer)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowUpgradeConfirm(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition text-xs shadow cursor-pointer"
                  >
                    {t.common.upgrade}
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 rtl:space-x-reverse flex-wrap gap-2">
                  {installedVer && (
                    <span className="inline-flex items-center space-x-1 rtl:space-x-reverse px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-200 font-mono text-[11px]">
                      <span>{t.details.installedVersion}: {cleanVersion(installedVer)}</span>
                    </span>
                  )}
                  {details?.license && (
                    <span className="inline-flex items-center space-x-1 rtl:space-x-reverse px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                      <Tag className="w-3 h-3 text-slate-400" />
                      <span>{details.license}</span>
                    </span>
                  )}
                  {details?.install_date && (
                    <span className="inline-flex items-center space-x-1 rtl:space-x-reverse px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-[11px]">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{t.common.installed} {details.install_date}</span>
                    </span>
                  )}
                </div>
              )}

              {/* Package Version Rollback & Switcher */}
              {installedVersions.length > 1 && (
                <div className="p-3.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-200 flex items-center justify-between shadow-inner">
                  <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                    <History className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <span className="font-bold text-white text-xs">{t.details.switchVersion}</span>
                      <p className="text-[11px] text-indigo-200/80">{installedVersions.length} {t.details.installedVersions}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <select
                      disabled={switchingVersion}
                      onChange={(e) => switchVersion(e.target.value)}
                      defaultValue={cleanVersion(installedVer)}
                      className="bg-slate-900 border border-white/15 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
                    >
                      {installedVersions.map((v) => (
                        <option key={v} value={v}>
                          {v} {v === cleanVersion(installedVer) ? `(${t.details.active})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Description & Links */}
              <div>
                <p className="text-sm text-slate-200">{details?.desc || pkg.desc || t.common.noDescription}</p>
                {details?.homepage && (
                  <div className="mt-2.5">
                    <a
                      href={details.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs transition"
                    >
                      <span>{details.homepage}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Download Statistics & Ranks */}
              {analytics && (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <BarChart3 className="w-4 h-4 text-amber-400" />
                      <h3 className="font-bold text-white text-xs uppercase tracking-wider">{t.details.analytics}</h3>
                    </div>
                    {analytics.rank30d && (
                      <span className="flex items-center space-x-1 rtl:space-x-reverse text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <Trophy className="w-3 h-3 text-amber-400" />
                        <span>Rank #{analytics.rank30d}</span>
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-[10px] text-slate-400 uppercase font-mono">{t.details.analytics30d}</span>
                      <p className="text-base font-bold text-amber-400 font-mono mt-0.5">
                        {analytics.last30d?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-[10px] text-slate-400 uppercase font-mono">{t.details.analytics90d}</span>
                      <p className="text-base font-bold text-cyan-400 font-mono mt-0.5">
                        {analytics.last90d?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-[10px] text-slate-400 uppercase font-mono">{t.details.analytics365d}</span>
                      <p className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                        {analytics.last365d?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Install Path */}
              {details?.install_path && (
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5 text-xs">
                      <Folder className="w-3.5 h-3.5 text-amber-400" />
                      {t.details.revealInFinder}
                    </span>
                    <button
                      onClick={() => revealInFinder(details.install_path)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-medium transition cursor-pointer border border-white/10"
                    >
                      {t.details.revealInFinder}
                    </button>
                  </div>
                  <p className="font-mono text-[11px] text-slate-400 break-all select-all">
                    {details.install_path}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {!isCask && (
              <button
                onClick={() => onPin(pkg.name, !pkg.is_pinned)}
                className={`flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                  pkg.is_pinned
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                }`}
              >
                <Pin className={`w-3.5 h-3.5 ${pkg.is_pinned ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span>{pkg.is_pinned ? t.common.unpin : t.common.pin}</span>
              </button>
            )}

            {isCask && (
              <label className="flex items-center space-x-2 rtl:space-x-reverse text-xs text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={zapCask}
                  onChange={(e) => setZapCask(e.target.checked)}
                  className="rounded bg-slate-900 border-white/20 text-amber-500 focus:ring-amber-500/30"
                />
                <span>{t.details.zapCask}</span>
              </label>
            )}
          </div>

          <button
            onClick={() => setShowUninstallConfirm(true)}
            className="flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-xs font-medium transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.common.uninstall}</span>
          </button>
        </div>
      </div>

      {/* Upgrade Confirmation Modal */}
      {showUpgradeConfirm && (
        <ConfirmModal
          isOpen={showUpgradeConfirm}
          title={`Upgrade ${pkg.name}?`}
          message={`This will upgrade ${pkg.name} from version ${cleanVersion(installedVer)} to ${cleanVersion(latestVer)}.`}
          confirmText="Upgrade"
          type="info"
          onConfirm={() => {
            setShowUpgradeConfirm(false);
            onUpgrade(pkg.name);
          }}
          onClose={() => setShowUpgradeConfirm(false)}
        />
      )}

      {/* Uninstall Confirmation Modal */}
      {showUninstallConfirm && (
        <ConfirmModal
          isOpen={showUninstallConfirm}
          title={`Uninstall ${pkg.name}?`}
          message={
            details?.dependents && details.dependents.length > 0
              ? `WARNING: The following installed packages rely on ${pkg.name}: ${details.dependents.join(', ')}. Uninstalling it may break them.`
              : `Are you sure you want to uninstall ${pkg.name}?`
          }
          confirmText="Uninstall"
          type="danger"
          onConfirm={() => {
            setShowUninstallConfirm(false);
            onUninstall(pkg.name, isCask, zapCask);
            onClose();
          }}
          onClose={() => setShowUninstallConfirm(false)}
        />
      )}
    </div>
  );
};
