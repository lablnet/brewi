import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import {
  PackageSummary,
  BrewService,
  BrewTap,
  BrewDoctorIssue,
  BrewCleanupResult,
  BrewEnvInfo,
  StreamEventPayload,
} from '../types';

export function useBrew() {
  const [packages, setPackages] = useState<PackageSummary[]>([]);
  const [services, setServices] = useState<BrewService[]>([]);
  const [taps, setTaps] = useState<BrewTap[]>([]);
  const [envInfo, setEnvInfo] = useState<BrewEnvInfo | null>(null);
  const [doctorIssues, setDoctorIssues] = useState<BrewDoctorIssue[] | null>(null);
  const [cleanupResult, setCleanupResult] = useState<BrewCleanupResult | null>(null);
  const [outdatedCount, setOutdatedCount] = useState<number>(0);

  const [loadingPackages, setLoadingPackages] = useState<boolean>(false);
  const [loadingServices, setLoadingServices] = useState<boolean>(false);
  const [loadingTaps, setLoadingTaps] = useState<boolean>(false);
  const [loadingDoctor, setLoadingDoctor] = useState<boolean>(false);
  const [loadingCleanup, setLoadingCleanup] = useState<boolean>(false);

  // Terminal & Task state
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [activeTaskName, setActiveTaskName] = useState<string>('');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);
  const [isTaskRunning, setIsTaskRunning] = useState<boolean>(false);

  // Toast / Status state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  }, []);

  const loadPackages = useCallback(async () => {
    setLoadingPackages(true);
    try {
      const list = await invoke<PackageSummary[]>('get_installed_packages');
      setPackages(list);
      const outdated = list.filter((p) => p.is_outdated).length;
      setOutdatedCount(outdated);
      invoke('set_dock_badge', { badge: outdated > 0 ? outdated.toString() : null }).catch(() => {});
      if (outdated > 0) {
        showToast(`🛡️ Health Guard: ${outdated} pending Homebrew updates detected!`, 'info');
      }
    } catch (e) {
      console.error('Failed to load packages:', e);
      showToast(`Failed to load packages: ${e}`, 'error');
    } finally {
      setLoadingPackages(false);
    }
  }, [showToast]);

  const loadServices = useCallback(async () => {
    setLoadingServices(true);
    try {
      const list = await invoke<BrewService[]>('get_services');
      setServices(list);
    } catch (e) {
      console.error('Failed to load services:', e);
    } finally {
      setLoadingServices(false);
    }
  }, []);

  const loadTaps = useCallback(async () => {
    setLoadingTaps(true);
    try {
      const list = await invoke<BrewTap[]>('get_taps');
      setTaps(list);
    } catch (e) {
      console.error('Failed to load taps:', e);
    } finally {
      setLoadingTaps(false);
    }
  }, []);

  const refreshAll = useCallback(() => {
    loadPackages();
    loadServices();
    loadTaps();
  }, [loadPackages, loadServices, loadTaps]);

  // Listen to streaming events from Rust safely without duplicate listener mounts
  useEffect(() => {
    let unlistenFn: (() => void) | null = null;
    let cancelled = false;

    listen<StreamEventPayload>('brew-stream', (event) => {
      const payload = event.payload;

      setTerminalLogs((prev) => [...prev, payload.line]);

      if (payload.stream_type === 'start') {
        setIsTaskRunning(true);
      } else if (payload.stream_type === 'exit') {
        setIsTaskRunning(false);
        if (payload.success) {
          showToast('Command completed successfully!', 'success');
          refreshAll();
        } else {
          showToast(`Command finished with code ${payload.exit_code ?? 'error'}`, 'error');
        }
      }
    }).then((fn) => {
      if (cancelled) {
        fn();
      } else {
        unlistenFn = fn;
      }
    });

    return () => {
      cancelled = true;
      if (unlistenFn) {
        unlistenFn();
      }
    };
  }, [showToast, refreshAll]);

  const loadEnvironment = useCallback(async () => {
    try {
      const res = await invoke<BrewEnvInfo>('get_brew_environment');
      setEnvInfo(res);
    } catch (e) {
      console.error('Failed to get environment info:', e);
    }
  }, []);

  useEffect(() => {
    loadEnvironment();
    refreshAll();
  }, [loadEnvironment, refreshAll]);

  // Actions
  const runStreamingTask = async (taskName: string, commandFn: (taskId: string) => Promise<void>) => {
    const taskId = `task_${Date.now()}`;
    setActiveTaskId(taskId);
    setActiveTaskName(taskName);
    setIsTerminalOpen(true);
    setIsTaskRunning(true);
    setTerminalLogs([`🚀 Starting task: ${taskName} [${new Date().toLocaleTimeString()}]`]);

    try {
      await commandFn(taskId);
    } catch (e) {
      console.error(`Task ${taskName} failed:`, e);
      setIsTaskRunning(false);
    }
  };

  const installPackage = async (name: string, isCask: boolean) => {
    await runStreamingTask(`Install ${name}`, async (taskId) => {
      await invoke('install_package', { name, isCask, taskId });
    });
  };

  const uninstallPackage = async (name: string, isCask: boolean, zap: boolean = false) => {
    await runStreamingTask(`Uninstall ${name}`, async (taskId) => {
      await invoke('uninstall_package', { name, isCask, zap, taskId });
    });
  };

  const pinFormula = async (name: string, pin: boolean) => {
    try {
      await invoke('pin_formula', { name, pin });
      showToast(`${pin ? 'Pinned' : 'Unpinned'} ${name}`, 'success');
      loadPackages();
    } catch (e) {
      showToast(`Failed to ${pin ? 'pin' : 'unpin'} ${name}: ${e}`, 'error');
    }
  };

  const upgradePackages = async (names: string[], greedy: boolean = false) => {
    const title = names.length === 1 ? `Upgrade ${names[0]}` : `Upgrade ${names.length} packages`;
    await runStreamingTask(title, async (taskId) => {
      await invoke('upgrade_packages', { names, greedy, taskId });
    });
  };

  const updateBrew = async () => {
    await runStreamingTask('Update Homebrew Core', async (taskId) => {
      await invoke('update_brew', { taskId });
    });
  };

  const manageService = async (name: string, action: 'start' | 'stop' | 'restart' | 'run') => {
    await runStreamingTask(`${action.toUpperCase()} service: ${name}`, async (taskId) => {
      await invoke('manage_service', { name, action, taskId });
      loadServices();
    });
  };

  const addTap = async (tapName: string) => {
    await runStreamingTask(`Tap ${tapName}`, async (taskId) => {
      await invoke('add_tap', { tapName, taskId });
      loadTaps();
    });
  };

  const removeTap = async (tapName: string) => {
    await runStreamingTask(`Untap ${tapName}`, async (taskId) => {
      await invoke('remove_tap', { tapName, taskId });
      loadTaps();
    });
  };

  const runDoctor = async () => {
    setLoadingDoctor(true);
    try {
      const issues = await invoke<BrewDoctorIssue[]>('run_doctor');
      setDoctorIssues(issues);
      if (issues.length === 0) {
        showToast('System is ready to brew! No issues detected.', 'success');
      } else {
        showToast(`Doctor found ${issues.length} potential issues.`, 'info');
      }
    } catch (e) {
      showToast(`Doctor failed: ${e}`, 'error');
    } finally {
      setLoadingDoctor(false);
    }
  };

  const getCleanupDryRun = async () => {
    setLoadingCleanup(true);
    try {
      const res = await invoke<BrewCleanupResult>('get_cleanup_dry_run');
      setCleanupResult(res);
    } catch (e) {
      showToast(`Failed to run cleanup dry run: ${e}`, 'error');
    } finally {
      setLoadingCleanup(false);
    }
  };

  const runCleanup = async (pruneAll: boolean = true) => {
    await runStreamingTask('Cleanup Cached Packages & Downloads', async (taskId) => {
      await invoke('run_cleanup', { pruneAll, taskId });
      getCleanupDryRun();
    });
  };

  const cancelActiveTask = async () => {
    if (activeTaskId) {
      try {
        await invoke('cancel_task', { taskId: activeTaskId });
        showToast('Sent cancellation request to task.', 'info');
      } catch (e) {
        console.error('Failed to cancel task:', e);
      }
    }
  };

  const clearTerminal = () => {
    setTerminalLogs([]);
  };

  return {
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
    activeTaskId,
    activeTaskName,
    terminalLogs,
    isTerminalOpen,
    isTaskRunning,
    toast,
    setIsTerminalOpen,
    loadPackages,
    loadServices,
    loadTaps,
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
    showToast,
  };
}
