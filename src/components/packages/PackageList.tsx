import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  Beer,
  Monitor,
  CheckSquare,
  Square,
  ArrowUpCircle,
  Trash2,
  X,
  Layers,
  Pin,
  LayoutGrid,
  List,
} from 'lucide-react';
import { PackageSummary, FilterType, SortField } from '../../types';
import { PackageCard } from './PackageCard';
import { PackageRow } from './PackageRow';
import { ConfirmModal } from '../common/ConfirmModal';
import { usePackageDependents } from '../../hooks/usePackageDetails';
import { useTranslation } from '../../i18n/LanguageContext';

interface PackageListProps {
  packages: PackageSummary[];
  loading: boolean;
  onSelectPackage: (pkg: PackageSummary) => void;
  onUpgrade: (names: string[]) => void;
  onUninstall: (name: string, isCask: boolean, zap?: boolean) => void;
  onPin: (name: string, pin: boolean) => void;
  initialFilter?: FilterType;
}

type ViewMode = 'grid' | 'list';

export const PackageList: React.FC<PackageListProps> = ({
  packages,
  loading,
  onSelectPackage,
  onUpgrade,
  onUninstall,
  onPin,
  initialFilter = 'all',
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<FilterType>(initialFilter);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Layout View Mode (Grid vs List) with localStorage persistence
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('brewi_view_mode') as ViewMode) || 'grid';
  });

  const handleToggleViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('brewi_view_mode', mode);
  };

  // Confirm Modal states
  const [upgradeTarget, setUpgradeTarget] = useState<string[] | null>(null);
  const [uninstallTarget, setUninstallTarget] = useState<{ name: string; isCask: boolean } | null>(null);
  const [batchUninstallTarget, setBatchUninstallTarget] = useState<PackageSummary[] | null>(null);

  // Hook to fetch dependents cleanly without direct invoke in components
  const { dependents: uninstallDependents } = usePackageDependents(
    uninstallTarget?.name || null,
    uninstallTarget?.isCask ?? false
  );

  // Filtered and Sorted Packages
  const filteredPackages = useMemo(() => {
    return packages
      .filter((pkg) => {
        if (filterType === 'formulae' && pkg.package_type !== 'formula') return false;
        if (filterType === 'casks' && pkg.package_type !== 'cask') return false;
        if (filterType === 'outdated' && !pkg.is_outdated) return false;
        if (filterType === 'leaves' && (!pkg.is_leaf || pkg.package_type === 'cask')) return false;
        if (filterType === 'pinned' && !pkg.is_pinned) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = pkg.name.toLowerCase().includes(q);
          const matchDesc = pkg.desc?.toLowerCase().includes(q);
          const matchTap = pkg.tap?.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchTap) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === 'name') {
          cmp = a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        } else if (sortField === 'status') {
          cmp = (b.is_outdated ? 1 : 0) - (a.is_outdated ? 1 : 0);
        } else if (sortField === 'type') {
          cmp = a.package_type.localeCompare(b.package_type);
        } else if (sortField === 'size') {
          cmp = (b.size_bytes || 0) - (a.size_bytes || 0);
        }
        return sortAsc ? cmp : -cmp;
      });
  }, [packages, filterType, searchQuery, sortField, sortAsc]);

  const counts = useMemo(() => {
    return {
      all: packages.length,
      formulae: packages.filter((p) => p.package_type === 'formula').length,
      casks: packages.filter((p) => p.package_type === 'cask').length,
      outdated: packages.filter((p) => p.is_outdated).length,
      leaves: packages.filter((p) => p.is_leaf && p.package_type === 'formula').length,
      pinned: packages.filter((p) => p.is_pinned).length,
    };
  }, [packages]);

  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredPackages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPackages.map((p) => p.id)));
    }
  };

  const handleToggleSelect = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleBatchUpgradeClick = () => {
    const selectedPkgs = packages.filter((p) => selectedIds.has(p.id));
    const names = selectedPkgs.map((p) => p.name);
    if (names.length > 0) {
      setUpgradeTarget(names);
    }
  };

  const handleBatchUninstallClick = () => {
    const selectedPkgs = packages.filter((p) => selectedIds.has(p.id));
    if (selectedPkgs.length > 0) {
      setBatchUninstallTarget(selectedPkgs);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Controls Bar */}
      <div className="p-4 border-b border-white/10 glass-panel shrink-0 space-y-3">
        {/* Search, Layout Switcher & Sort row */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 rtl:left-auto rtl:right-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.packages.filterPlaceholder}
              className="w-full pl-9 pr-8 rtl:pl-8 rtl:pr-9 py-2 rounded-xl text-xs glass-input text-slate-100 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 rtl:right-auto rtl:left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Grid / List View Toggle Group */}
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

            {/* Sort Menu */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="bg-transparent border-none text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="name" className="bg-slate-900 text-slate-200">
                  {t.packages.sortName}
                </option>
                <option value="size" className="bg-slate-900 text-slate-200">
                  {t.packages.sortSize}
                </option>
                <option value="status" className="bg-slate-900 text-slate-200">
                  {t.packages.sortStatus}
                </option>
                <option value="type" className="bg-slate-900 text-slate-200">
                  {t.packages.sortType}
                </option>
              </select>
              <button
                onClick={() => setSortAsc(!sortAsc)}
                className="p-0.5 rounded hover:bg-white/10 text-slate-400 hover:text-slate-200 font-mono text-[10px] shrink-0"
                title={sortAsc ? t.packages.ascending : t.packages.descending}
              >
                {sortAsc ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {[
              { id: 'all' as FilterType, label: t.packages.all, count: counts.all },
              { id: 'formulae' as FilterType, label: t.packages.formulae, count: counts.formulae, icon: Beer },
              { id: 'casks' as FilterType, label: t.packages.casks, count: counts.casks, icon: Monitor },
              { id: 'outdated' as FilterType, label: t.packages.outdatedFilter, count: counts.outdated, highlight: counts.outdated > 0 },
              { id: 'leaves' as FilterType, label: t.packages.leavesFilter, count: counts.leaves, icon: Layers },
              { id: 'pinned' as FilterType, label: t.packages.pinnedFilter, count: counts.pinned, icon: Pin },
            ].map((pill) => {
              const isActive = filterType === pill.id;
              const Icon = pill.icon;
              return (
                <button
                  key={pill.id}
                  onClick={() => setFilterType(pill.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                      : pill.highlight
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/5'
                  }`}
                >
                  {Icon && <Icon className="w-3 h-3" />}
                  <span>{pill.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {pill.count}
                  </span>
                </button>
              );
            })}
          </div>

          {filteredPackages.length > 0 && (
            <button
              onClick={handleToggleSelectAll}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer shrink-0"
            >
              {selectedIds.size === filteredPackages.length ? (
                <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>{selectedIds.size > 0 ? `${selectedIds.size} ${t.packages.selectedCount}` : t.packages.selectAll}</span>
            </button>
          )}
        </div>

        {/* Batch Actions Bar (when items selected) */}
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs animate-in fade-in">
            <span className="font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              {selectedIds.size} {t.packages.selectedCount}
            </span>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <button
                onClick={handleBatchUpgradeClick}
                className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 transition cursor-pointer"
              >
                <ArrowUpCircle className="w-3.5 h-3.5" />
                <span>{t.packages.batchUpgrade}</span>
              </button>
              <button
                onClick={handleBatchUninstallClick}
                className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.packages.batchUninstall}</span>
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Grid or List Content Area */}
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
                    ? 'h-36 rounded-xl glass-card border border-white/5 animate-pulse bg-white/5'
                    : 'h-12 rounded-xl glass-card border border-white/5 animate-pulse bg-white/5'
                }
              />
            ))}
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <Beer className="w-8 h-8 text-slate-600 stroke-[1.5]" />
            <p className="text-sm font-medium text-slate-300">
              {searchQuery ? t.packages.noMatchingFilter : t.packages.noPackagesFound}
            </p>
            <p className="text-xs text-slate-500">
              {searchQuery ? `${t.packages.filterPlaceholder}: "${searchQuery}"` : ''}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pb-8">
            {filteredPackages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                isSelected={selectedIds.has(pkg.id)}
                onSelect={(sel) => handleToggleSelect(pkg.id, sel)}
                onClick={() => onSelectPackage(pkg)}
                onUpgrade={() => setUpgradeTarget([pkg.name])}
                onUninstall={() => setUninstallTarget({ name: pkg.name, isCask: pkg.package_type === 'cask' })}
                onPin={() => onPin(pkg.name, !pkg.is_pinned)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2 pb-8">
            {filteredPackages.map((pkg) => (
              <PackageRow
                key={pkg.id}
                pkg={pkg}
                isSelected={selectedIds.has(pkg.id)}
                onSelect={(sel) => handleToggleSelect(pkg.id, sel)}
                onClick={() => onSelectPackage(pkg)}
                onUpgrade={() => setUpgradeTarget([pkg.name])}
                onUninstall={() => setUninstallTarget({ name: pkg.name, isCask: pkg.package_type === 'cask' })}
                onPin={() => onPin(pkg.name, !pkg.is_pinned)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upgrade Confirmation Modal */}
      <ConfirmModal
        isOpen={upgradeTarget !== null}
        onClose={() => setUpgradeTarget(null)}
        onConfirm={() => {
          if (upgradeTarget) {
            onUpgrade(upgradeTarget);
            setSelectedIds(new Set());
          }
        }}
        title={t.common.confirmUpgradeTitle}
        message={`${t.common.confirmUpgradeDesc} ${
          upgradeTarget?.length === 1
            ? upgradeTarget[0]
            : `${upgradeTarget?.length || 0} ${t.common.packagesCount}`
        }?`}
        confirmText={t.common.upgrade}
        type="info"
        details={upgradeTarget || undefined}
      />

      {/* Single Uninstall Confirmation Modal */}
      <ConfirmModal
        isOpen={uninstallTarget !== null}
        onClose={() => setUninstallTarget(null)}
        onConfirm={() => {
          if (uninstallTarget) {
            onUninstall(uninstallTarget.name, uninstallTarget.isCask);
            setUninstallTarget(null);
          }
        }}
        title={`${t.common.confirmUninstallTitle} ${uninstallTarget?.name}`}
        message={
          uninstallDependents.length > 0
            ? `⚠️ ${t.common.warningRequiredBy} (${uninstallDependents.length})`
            : `${t.common.confirmUninstallDesc} ${uninstallTarget?.name}?`
        }
        confirmText={t.common.uninstall}
        type="danger"
        details={uninstallDependents.length > 0 ? uninstallDependents : undefined}
      />

      {/* Batch Uninstall Confirmation Modal */}
      <ConfirmModal
        isOpen={batchUninstallTarget !== null}
        onClose={() => setBatchUninstallTarget(null)}
        onConfirm={() => {
          if (batchUninstallTarget) {
            batchUninstallTarget.forEach((p) => onUninstall(p.name, p.package_type === 'cask'));
            setSelectedIds(new Set());
          }
        }}
        title={`${t.common.confirmBatchUninstallTitle} (${batchUninstallTarget?.length || 0} ${t.common.packagesCount})`}
        message={t.common.confirmBatchUninstallDesc.replace('{count}', String(batchUninstallTarget?.length || 0))}
        confirmText={t.common.uninstallAll}
        type="danger"
        details={batchUninstallTarget?.map((p) => `${p.name} (${p.package_type})`)}
      />
    </div>
  );
};
