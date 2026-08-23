import { useState } from 'react';
import {
  Server,
  Play,
  Square,
  RotateCw,
  Zap,
  FileCode,
  User,
  RefreshCw,
  LayoutGrid,
  List,
} from 'lucide-react';
import { BrewService } from '../../types';
import { Spinner } from '../common/Spinner';

interface ServicesViewProps {
  services: BrewService[];
  loading: boolean;
  onManageService: (name: string, action: 'start' | 'stop' | 'restart' | 'run') => void;
  onRefresh: () => void;
}

type ViewMode = 'grid' | 'list';

export const ServicesView: React.FC<ServicesViewProps> = ({
  services,
  loading,
  onManageService,
  onRefresh,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('brewi_view_mode') as ViewMode) || 'grid';
  });

  const handleToggleViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('brewi_view_mode', mode);
  };

  const runningCount = services.filter((s) => s.status === 'started').length;

  const getStatusBadgeClass = (status: string) => {
    if (status === 'started') {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30';
    }
    if (status === 'error') {
      return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30';
    }
    return 'bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-white/10';
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header Banner */}
      <div className="p-4 border-b border-white/10 glass-panel flex items-center justify-between shrink-0 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Homebrew Services</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {runningCount} active service{runningCount === 1 ? '' : 's'} running
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
              title="Grid View"
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
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-slate-300 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? <Spinner size="sm" /> : <RefreshCw className="w-3.5 h-3.5" />}
            <span>Refresh Services</span>
          </button>
        </div>
      </div>

      {/* Services Content */}
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
                    ? 'h-32 rounded-xl glass-card animate-pulse bg-slate-200 dark:bg-white/5'
                    : 'h-14 rounded-xl glass-card animate-pulse bg-slate-200 dark:bg-white/5'
                }
              />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 space-y-2">
            <Server className="w-8 h-8 text-slate-400 dark:text-slate-600" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No Homebrew services found</p>
            <p className="text-xs text-slate-500">
              Services like MySQL, Redis, PostgreSQL, or Nginx will appear here when installed.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-8">
            {services.map((svc) => {
              const isStarted = svc.status === 'started';
              const isError = svc.status === 'error';

              return (
                <div
                  key={svc.name}
                  className="p-4 rounded-xl glass-card border border-slate-200 dark:border-white/5 hover:border-amber-500/30 flex flex-col justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-3 h-3 rounded-full shrink-0 ${
                          isStarted
                            ? 'bg-emerald-500 shadow-md shadow-emerald-500/50 animate-pulse'
                            : isError
                            ? 'bg-red-500 shadow-md shadow-red-500/50'
                            : 'bg-slate-400 dark:bg-slate-600'
                        }`}
                      />
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{svc.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          {svc.user && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              <span>{svc.user}</span>
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono capitalize border font-semibold ${getStatusBadgeClass(
                              svc.status
                            )}`}
                          >
                            {svc.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {svc.file && (
                    <div className="text-[10px] font-mono truncate p-2 rounded-lg flex items-center gap-1.5 bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-900/80 dark:text-slate-400 dark:border-white/5">
                      <FileCode className="w-3.5 h-3.5 shrink-0 text-slate-500 dark:text-slate-400" />
                      <span className="truncate">{svc.file}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200 dark:border-white/5 flex items-center justify-end gap-2">
                    {isStarted ? (
                      <>
                        <button
                          onClick={() => onManageService(svc.name, 'restart')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-white/10"
                          title="Restart service"
                        >
                          <RotateCw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>Restart</span>
                        </button>
                        <button
                          onClick={() => onManageService(svc.name, 'stop')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shadow-sm bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600"
                          title="Stop service"
                        >
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>Stop</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => onManageService(svc.name, 'run')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 dark:text-amber-300 dark:border-amber-500/30"
                          title="Run once in background"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>Run Once</span>
                        </button>
                        <button
                          onClick={() => onManageService(svc.name, 'start')}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-slate-950"
                          title="Start service as background daemon"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Start</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2 pb-8">
            {services.map((svc) => {
              const isStarted = svc.status === 'started';
              const isError = svc.status === 'error';

              return (
                <div
                  key={svc.name}
                  className="p-3 px-4 rounded-xl glass-card border border-slate-200 dark:border-white/5 hover:border-amber-500/30 flex items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-3 h-3 rounded-full shrink-0 ${
                        isStarted
                          ? 'bg-emerald-500 shadow-md shadow-emerald-500/50 animate-pulse'
                          : isError
                          ? 'bg-red-500 shadow-md shadow-red-500/50'
                          : 'bg-slate-400 dark:bg-slate-600'
                      }`}
                    />
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{svc.name}</h3>
                      {svc.file && (
                        <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate hidden md:block">
                          {svc.file}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono capitalize border font-semibold ${getStatusBadgeClass(
                        svc.status
                      )}`}
                    >
                      {svc.status}
                    </span>

                    {isStarted ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onManageService(svc.name, 'restart')}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-white/10 text-xs font-medium transition cursor-pointer"
                        >
                          <RotateCw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>Restart</span>
                        </button>
                        <button
                          onClick={() => onManageService(svc.name, 'stop')}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600 text-xs font-semibold transition cursor-pointer shadow-sm"
                        >
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>Stop</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onManageService(svc.name, 'run')}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 dark:text-amber-300 dark:border-amber-500/30 text-xs font-medium transition cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>Run Once</span>
                        </button>
                        <button
                          onClick={() => onManageService(svc.name, 'start')}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-slate-950 text-xs font-semibold transition cursor-pointer shadow-sm"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Start</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
