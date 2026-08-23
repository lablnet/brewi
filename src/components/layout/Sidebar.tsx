import React from 'react';
import {
  Package,
  ArrowUpCircle,
  Server,
  GitBranch,
  Stethoscope,
  Trash2,
  FileCode,
  Layers,
} from 'lucide-react';
import { ViewTab, BrewEnvInfo } from '../../types';
import logo from '../../assets/logo.png';
import { useTranslation } from '../../i18n/LanguageContext';

interface SidebarProps {
  activeTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  installedCount: number;
  outdatedCount: number;
  servicesCount: number;
  leavesCount: number;
  tapsCount: number;
  envInfo: BrewEnvInfo | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  installedCount,
  outdatedCount,
  servicesCount,
  leavesCount,
  tapsCount,
  envInfo,
}) => {
  const { t } = useTranslation();

  const navItems = [
    {
      id: 'installed' as ViewTab,
      label: t.nav.installed,
      icon: Package,
      badge: installedCount > 0 ? installedCount : undefined,
      badgeColor: 'bg-slate-800 text-slate-100 font-bold',
    },
    {
      id: 'updates' as ViewTab,
      label: t.nav.updates,
      icon: ArrowUpCircle,
      badge: outdatedCount > 0 ? outdatedCount : undefined,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold animate-soft-pulse',
    },
    {
      id: 'services' as ViewTab,
      label: t.nav.services,
      icon: Server,
      badge: servicesCount > 0 ? servicesCount : undefined,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30',
    },
    {
      id: 'leaves' as ViewTab,
      label: t.nav.leaves,
      icon: Layers,
      badge: leavesCount > 0 ? leavesCount : undefined,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 font-bold',
    },
    {
      id: 'taps' as ViewTab,
      label: t.nav.taps,
      icon: GitBranch,
      badge: tapsCount > 0 ? tapsCount : undefined,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 font-bold',
    },
    {
      id: 'doctor' as ViewTab,
      label: t.nav.doctor,
      icon: Stethoscope,
    },
    {
      id: 'cleanup' as ViewTab,
      label: t.nav.cleanup,
      icon: Trash2,
    },
    {
      id: 'brewfile' as ViewTab,
      label: t.nav.brewfile,
      icon: FileCode,
    },
  ];

  return (
    <aside className="w-56 h-full flex flex-col justify-between glass-sidebar border-r rtl:border-r-0 rtl:border-l border-white/10 select-none shrink-0">
      {/* Brand Header with top margin spacing for macOS traffic light buttons */}
      <div>
        <div className="px-5 pt-10 pb-3 flex items-center gap-3 app-drag-region">
          <img
            src={logo}
            alt="Brewi Logo"
            className="w-8 h-8 rounded-xl object-cover shadow-lg shadow-amber-500/20 border border-amber-300/30 shrink-0"
          />
          <div>
            <span className="text-base font-bold tracking-tight text-white flex items-center gap-1">
              {t.common.appName}
            </span>
            <p className="text-[11px] text-slate-400">{t.common.tagline}</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="px-2.5 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono shrink-0 ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Author Credit */}
      <div className="p-3.5 border-t border-white/10 m-2 rounded-xl bg-slate-900/40 text-[11px] text-slate-400 space-y-1.5">
        <div className="flex items-center justify-between text-slate-300 font-medium">
          <span>Homebrew</span>
          <span className="font-mono text-[10px] text-amber-400/90">
            {envInfo?.brew_version ? envInfo.brew_version.replace('Homebrew ', 'v') : t.common.detected}
          </span>
        </div>
        <p className="text-[10px] text-slate-500 truncate font-mono" title={envInfo?.prefix}>
          {envInfo?.prefix || '/opt/homebrew'}
        </p>
        <div className="pt-1 border-t border-white/5 text-[10px] text-slate-400 font-sans flex items-center justify-between">
          <span>{t.common.createdBy}</span>
          <span className="font-semibold text-slate-200 truncate">{t.common.authorName}</span>
        </div>
      </div>
    </aside>
  );
};
