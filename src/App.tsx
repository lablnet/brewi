import { useState, useEffect } from 'react';
import { useBrew } from './hooks/useBrew';
import { ViewTab, PackageSummary } from './types';
import { Sidebar } from './components/layout/Sidebar';
import { Titlebar } from './components/layout/Titlebar';
import { TerminalDrawer } from './components/layout/TerminalDrawer';
import { PackageList } from './components/packages/PackageList';
import { PackageDetailModal } from './components/packages/PackageDetailModal';
import { InstallPackageModal } from './components/packages/InstallPackageModal';
import { ServicesView } from './components/services/ServicesView';
import { UpdatesView } from './components/updates/UpdatesView';
import { TapsView } from './components/taps/TapsView';
import { DoctorView } from './components/maintenance/DoctorView';
import { CleanupView } from './components/maintenance/CleanupView';
import { BrewfileView } from './components/maintenance/BrewfileView';
import { CommandPalette } from './components/common/CommandPalette';
import { Toast } from './components/common/Toast';
import { LanguageProvider, useTranslation } from './i18n/LanguageContext';

export function AppContent() {
  const {
    packages,
    services,
    taps,
    envInfo,
    doctorIssues,
    cleanupResult,
    outdatedCount,
    loadingPackages,
    loadingServices,
    loadingTaps,
    loadingDoctor,
    loadingCleanup,
    activeTaskName,
    terminalLogs,
    isTerminalOpen,
    isTaskRunning,
    toast,
    setIsTerminalOpen,
    refreshAll,
    installPackage,
    uninstallPackage,
    pinFormula,
    upgradePackages,
    updateBrew,
    manageService,
    addTap,
    removeTap,
    runDoctor,
    getCleanupDryRun,
    runCleanup,
    cancelActiveTask,
    clearTerminal,
  } = useBrew();

  const { isRTL, dir } = useTranslation();
  const [activeTab, setActiveTab] = useState<ViewTab>('installed');
  const [selectedPackage, setSelectedPackage] = useState<PackageSummary | null>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  // Light / Dark Theme State with localStorage persistence
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('brewi_theme') as 'dark' | 'light') || 'dark';
  });

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('brewi_theme', nextTheme);
  };

  // Global keyboard shortcuts (Cmd + K, etc.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const leavesCount = packages.filter((p) => p.is_leaf && p.package_type === 'formula').length;
  const outdatedPackages = packages.filter((p) => p.is_outdated);

  return (
    <div
      dir={dir}
      className={`h-screen w-screen flex flex-row overflow-hidden font-sans ${
        theme === 'light' ? 'light-theme bg-slate-100 text-slate-900' : 'bg-[#0a0c12]/90 text-slate-100'
      } ${isRTL ? 'rtl font-urdu' : 'ltr'}`}
    >
      {/* Sleek Frosted Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        installedCount={packages.length}
        outdatedCount={outdatedCount}
        servicesCount={services.filter((s) => s.status === 'started').length}
        leavesCount={leavesCount}
        tapsCount={taps.length}
        envInfo={envInfo}
      />

      {/* Main Workspace Area */}
      <div
        className={`flex-1 min-w-0 flex flex-col h-full overflow-hidden ${
          theme === 'light' ? 'bg-slate-50' : 'bg-slate-950/40'
        }`}
      >
        {/* Top Draggable macOS Titlebar */}
        <Titlebar
          activeTab={activeTab}
          isTaskRunning={isTaskRunning}
          isTerminalOpen={isTerminalOpen}
          onToggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
          onRefresh={refreshAll}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
          arch={envInfo?.arch}
          refreshing={loadingPackages || loadingServices || loadingTaps}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Homebrew Not Found Banner Overlay */}
        {envInfo && envInfo.is_brew_installed === false && (
          <div className="p-4 bg-amber-500/15 border-b border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-4 animate-in fade-in shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0">
                🍺
              </div>
              <div>
                <span className="font-bold text-white text-xs block">Homebrew is not detected on this Mac</span>
                <span className="text-[11px] text-amber-200/80 leading-normal">
                  Run <code className="bg-slate-950 px-1.5 py-0.5 rounded font-mono text-amber-300">/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"</code> in Terminal to install Homebrew.
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText('/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"');
                refreshAll();
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition shrink-0 cursor-pointer shadow"
            >
              Copy Install Command
            </button>
          </div>
        )}

        {/* View Switcher Container */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {activeTab === 'installed' && (
            <PackageList
              packages={packages}
              loading={loadingPackages}
              onSelectPackage={(pkg) => setSelectedPackage(pkg)}
              onUpgrade={upgradePackages}
              onUninstall={uninstallPackage}
              onPin={pinFormula}
              initialFilter="all"
            />
          )}

          {activeTab === 'updates' && (
            <UpdatesView
              outdatedPackages={outdatedPackages}
              loading={loadingPackages}
              onUpgrade={upgradePackages}
              onUpdateBrew={updateBrew}
              onRefresh={refreshAll}
            />
          )}

          {activeTab === 'services' && (
            <ServicesView
              services={services}
              loading={loadingServices}
              onManageService={manageService}
              onRefresh={refreshAll}
            />
          )}

          {activeTab === 'leaves' && (
            <PackageList
              packages={packages}
              loading={loadingPackages}
              onSelectPackage={(pkg) => setSelectedPackage(pkg)}
              onUpgrade={upgradePackages}
              onUninstall={uninstallPackage}
              onPin={pinFormula}
              initialFilter="leaves"
            />
          )}

          {activeTab === 'taps' && (
            <TapsView
              taps={taps}
              loading={loadingTaps}
              onAddTap={addTap}
              onRemoveTap={removeTap}
            />
          )}

          {activeTab === 'doctor' && (
            <DoctorView
              issues={doctorIssues}
              loading={loadingDoctor}
              onRunDoctor={runDoctor}
            />
          )}

          {activeTab === 'cleanup' && (
            <CleanupView
              cleanupResult={cleanupResult}
              loading={loadingCleanup}
              onScanCleanup={getCleanupDryRun}
              onRunCleanup={runCleanup}
            />
          )}

          {activeTab === 'brewfile' && <BrewfileView />}
        </main>

        {/* Collapsible Real-time Terminal Log Output */}
        <TerminalDrawer
          isOpen={isTerminalOpen}
          onClose={() => setIsTerminalOpen(false)}
          logs={terminalLogs}
          isRunning={isTaskRunning}
          taskName={activeTaskName}
          onCancelTask={cancelActiveTask}
          onClearLogs={clearTerminal}
        />
      </div>

      {/* Package Inspector Modal */}
      {selectedPackage && (
        <PackageDetailModal
          pkg={selectedPackage}
          onClose={() => setSelectedPackage(null)}
          onUpgrade={(name) => upgradePackages([name])}
          onUninstall={uninstallPackage}
          onPin={pinFormula}
          onInspectOther={(name, isCask) => {
            const found = packages.find((p) => p.name === name);
            if (found) {
              setSelectedPackage(found);
            } else {
              setSelectedPackage({
                id: `${isCask ? 'cask' : 'formula'}:${name}`,
                name,
                full_name: name,
                package_type: isCask ? 'cask' : 'formula',
                is_outdated: false,
                is_pinned: false,
                is_leaf: false,
              });
            }
          }}
        />
      )}

      {/* Install Package Modal */}
      {isInstallModalOpen && (
        <InstallPackageModal
          installedPackages={packages}
          onClose={() => setIsInstallModalOpen(false)}
          onInstall={installPackage}
          onUpgrade={(name) => upgradePackages([name])}
          onInspectPackage={(pkg) => setSelectedPackage(pkg)}
        />
      )}

      {/* Command Palette (Cmd + K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        packages={packages}
        onSelectTab={(tab) => setActiveTab(tab)}
        onSelectPackage={(pkg) => setSelectedPackage(pkg)}
        onRunDoctor={() => {
          setActiveTab('doctor');
          runDoctor();
        }}
        onScanCleanup={() => {
          setActiveTab('cleanup');
          getCleanupDryRun();
        }}
        onUpdateBrew={updateBrew}
      />

      {/* Toast Notifications */}
      <Toast toast={toast} />
    </div>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
