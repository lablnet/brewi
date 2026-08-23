import React from 'react';
import { Beer, Monitor, Pin, ArrowUpCircle, Trash2, ChevronRight, Tag, HardDrive } from 'lucide-react';
import { PackageSummary } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';

interface PackageRowProps {
  pkg: PackageSummary;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onClick: () => void;
  onUpgrade: () => void;
  onUninstall: () => void;
  onPin: () => void;
}

export const PackageRow: React.FC<PackageRowProps> = ({
  pkg,
  isSelected,
  onSelect,
  onClick,
  onUpgrade,
  onUninstall,
  onPin,
}) => {
  const { t } = useTranslation();
  const isCask = pkg.package_type === 'cask';

  return (
    <div
      onClick={onClick}
      className={`group px-4 py-2.5 rounded-xl glass-card cursor-pointer border transition-all flex items-center justify-between gap-4 ${
        isSelected
          ? 'border-amber-500/50 bg-amber-500/5 shadow-md shadow-amber-500/5'
          : 'border-white/5 hover:border-white/15 hover:bg-slate-900/60'
      }`}
    >
      {/* Left Info Group */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onSelect(e.target.checked)}
          className="w-4 h-4 rounded bg-slate-900 border-white/20 text-amber-500 focus:ring-amber-500/30 focus:ring-offset-0 transition cursor-pointer shrink-0"
        />

        {/* Type Icon */}
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
            isCask
              ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
          }`}
        >
          {isCask ? <Monitor className="w-3.5 h-3.5" /> : <Beer className="w-3.5 h-3.5" />}
        </div>

        {/* Name & Badges */}
        <div className="flex items-center gap-1.5 shrink-0">
          <h3 className="text-xs font-semibold text-slate-100 group-hover:text-amber-400 transition-colors truncate max-w-[160px]">
            {pkg.name}
          </h3>
          {pkg.is_pinned && (
            <span title={t.common.pinned}>
              <Pin className="w-3 h-3 text-amber-400 fill-amber-400/30" />
            </span>
          )}
          {pkg.is_leaf && !isCask && (
            <span
              title="Leaf Package"
              className="px-1.5 py-0.2 text-[9px] font-mono rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/25"
            >
              {t.common.leaf}
            </span>
          )}
        </div>

        {/* Inline Description */}
        <p className="text-xs text-slate-400 truncate flex-1 min-w-0 hidden md:block">
          {pkg.desc || t.common.noDescription}
        </p>
      </div>

      {/* Right Actions & Version Metadata Group */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Disk Usage */}
        {pkg.size_formatted && (
          <span className="hidden sm:flex items-center gap-1 text-[10px] text-amber-400/90 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20" title={t.common.diskUsage}>
            <HardDrive className="w-2.5 h-2.5" />
            <span>{pkg.size_formatted}</span>
          </span>
        )}

        {/* Tap */}
        <span className="text-[11px] text-slate-400 font-mono hidden lg:block truncate max-w-[120px]">
          {pkg.tap || (isCask ? 'homebrew/cask' : 'homebrew/core')}
        </span>

        {/* License */}
        {pkg.license && (
          <span className="hidden xl:flex items-center gap-1 text-[10px] text-slate-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
            <Tag className="w-2.5 h-2.5" />
            <span className="truncate max-w-[70px]">{pkg.license}</span>
          </span>
        )}

        {/* Version / Outdated Badge */}
        {pkg.is_outdated ? (
          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-medium flex items-center gap-1">
            <ArrowUpCircle className="w-3 h-3" />
            <span>{t.common.update}</span>
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-400 text-[10px] font-mono">
            {pkg.installed_version?.split(',')[0] || t.common.installed}
          </span>
        )}

        {/* Hover Quick Actions */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {pkg.is_outdated && (
            <button
              onClick={onUpgrade}
              className="p-1 rounded hover:bg-amber-500/20 text-amber-400 transition cursor-pointer"
              title={t.common.upgrade === 'Upgrade' ? 'Upgrade this package' : t.common.upgrade}
            >
              <ArrowUpCircle className="w-3.5 h-3.5" />
            </button>
          )}

          {!isCask && (
            <button
              onClick={onPin}
              className={`p-1 rounded transition cursor-pointer ${
                pkg.is_pinned
                  ? 'text-amber-400 hover:bg-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/10'
              }`}
              title={pkg.is_pinned ? (t.common.unpin === 'Unpin' ? 'Unpin version' : t.common.unpin) : (t.common.pin === 'Pin' ? 'Pin version' : t.common.pin)}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onUninstall}
            className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
            title={t.common.uninstall === 'Uninstall' ? 'Uninstall package' : t.common.uninstall}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl:rotate-180 transition-transform" />
        </div>
      </div>
    </div>
  );
};
