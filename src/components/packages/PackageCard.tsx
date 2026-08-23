import { Beer, Monitor, Pin, ArrowUpCircle, Trash2, ChevronRight, Tag, HardDrive } from 'lucide-react';
import { PackageSummary } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';

interface PackageCardProps {
  pkg: PackageSummary;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onClick: () => void;
  onUpgrade: () => void;
  onUninstall: () => void;
  onPin: () => void;
}

export const PackageCard: React.FC<PackageCardProps> = ({
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
      className={`relative group p-4 rounded-xl glass-card cursor-pointer border transition-all ${isSelected
        ? 'border-amber-500/50 bg-amber-500/5 shadow-md shadow-amber-500/5'
        : 'border-white/5 hover:border-white/15 hover:bg-slate-900/60'
        }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2">
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
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${isCask
              ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              }`}
          >
            {isCask ? <Monitor className="w-4 h-4" /> : <Beer className="w-4 h-4" />}
          </div>

          {/* Title & Tap */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-semibold text-slate-100 truncate group-hover:text-amber-400 transition-colors">
                {pkg.name}
              </h3>
              {pkg.is_pinned && (
                <span title={t.common.pinned} className="shrink-0">
                  <Pin className="w-3 h-3 text-amber-400 fill-amber-400/30" />
                </span>
              )}
              {pkg.is_leaf && !isCask && (
                <span
                  title="Leaf Package (not required by any other formula)"
                  className="px-1.5 py-0.2 text-[9px] font-mono rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 shrink-0"
                >
                  {t.common.leaf}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {pkg.tap || (isCask ? 'homebrew/cask' : 'homebrew/core')}
            </p>
          </div>
        </div>

        {/* Status / Version Tag */}
        <div className="flex flex-col items-end shrink-0 gap-1">
          {pkg.is_outdated ? (
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-medium flex items-center gap-1">
              <ArrowUpCircle className="w-3 h-3" />
              <span>{t.common.update}</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-400 text-[10px] font-mono">
              {pkg.installed_version || t.common.installed}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="mt-2.5 text-xs text-slate-300 line-clamp-2 leading-relaxed min-h-[2rem]">
        {pkg.desc || t.common.noDescription}
      </p>

      {/* Footer & Quick Actions */}
      <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          {pkg.size_formatted && (
            <span className="flex items-center gap-1 text-[10px] text-amber-400/90 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0" title={t.common.diskUsage}>
              <HardDrive className="w-2.5 h-2.5" />
              <span>{pkg.size_formatted}</span>
            </span>
          )}
          {pkg.license && (
            <span className="flex items-center gap-1 text-[10px] text-slate-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5 shrink-0">
              <Tag className="w-2.5 h-2.5" />
              <span className="truncate max-w-[70px]">{pkg.license}</span>
            </span>
          )}
          {pkg.install_date && <span className="text-[10px] text-slate-400 shrink-0">{pkg.install_date}</span>}
        </div>

        {/* Hover Quick Actions */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {pkg.is_outdated && (
            <button
              onClick={onUpgrade}
              className="p-1 rounded hover:bg-amber-500/20 text-amber-400 transition"
              title={t.common.upgrade === 'Upgrade' ? 'Upgrade this package' : t.common.upgrade}
            >
              <ArrowUpCircle className="w-3.5 h-3.5" />
            </button>
          )}

          {!isCask && (
            <button
              onClick={onPin}
              className={`p-1 rounded transition ${pkg.is_pinned
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
            className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
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
