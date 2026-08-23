import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { PackageDetails } from '../types';

export interface DownloadAnalytics {
  last30d: number | null;
  last90d: number | null;
  last365d: number | null;
  rank30d?: number | null;
}

export function usePackageDetails(name: string, isCask: boolean) {
  const [details, setDetails] = useState<PackageDetails | null>(null);
  const [analytics, setAnalytics] = useState<DownloadAnalytics | null>(null);
  const [installedVersions, setInstalledVersions] = useState<string[]>([]);
  const [switchingVersion, setSwitchingVersion] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch package details via Tauri invoke
      const dataPromise = invoke<PackageDetails>('get_package_details', {
        name,
        isCask,
      });

      // 2. Fetch download analytics & rank via Homebrew API in parallel
      const endpoint = isCask
        ? `https://formulae.brew.sh/api/cask/${name}.json`
        : `https://formulae.brew.sh/api/formula/${name}.json`;

      const analyticsPromise = fetch(endpoint)
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (!json || !json.analytics) return null;
          const analyticsData = json.analytics.install_on_request || json.analytics.install;
          if (!analyticsData) return null;

          const parseVal = (period: string) => {
            const p = analyticsData[period];
            if (!p) return null;
            if (typeof p[name] === 'number') return p[name];
            const keys = Object.keys(p);
            if (keys.length > 0 && typeof p[keys[0]] === 'number') return p[keys[0]];
            return null;
          };

          const rank =
            json.analytics.install_on_request?.['30d']?.rank ||
            json.analytics.install?.['30d']?.rank ||
            json.analytics?.install_on_request?.['30d']?.[name]?.rank ||
            null;

          return {
            last30d: parseVal('30d'),
            last90d: parseVal('90d'),
            last365d: parseVal('365d'),
            rank30d: typeof rank === 'number' ? rank : null,
          };
        })
        .catch(() => null);

      const [data, analyticsData] = await Promise.all([dataPromise, analyticsPromise]);
      setDetails(data);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to get package details:', err);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [name, isCask]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // Fetch multiple installed versions for formulae
  useEffect(() => {
    if (!isCask && name) {
      invoke<string[]>('get_installed_formula_versions', { name })
        .then((vers) => setInstalledVersions(vers))
        .catch(() => setInstalledVersions([]));
    } else {
      setInstalledVersions([]);
    }
  }, [name, isCask]);

  const switchVersion = useCallback(
    async (version: string) => {
      setSwitchingVersion(true);
      try {
        const taskId = `switch-${Date.now()}`;
        await invoke('switch_formula_version', { name, version, taskId });
        await fetchDetails();
      } catch (err) {
        console.error('Failed to switch version:', err);
        throw err;
      } finally {
        setSwitchingVersion(false);
      }
    },
    [name, fetchDetails]
  );

  const revealInFinder = useCallback(async (path?: string | null) => {
    if (!path) return;
    try {
      await invoke('reveal_in_finder', { path });
    } catch (err) {
      console.error('Failed to reveal in Finder:', err);
    }
  }, []);

  return {
    details,
    analytics,
    installedVersions,
    switchingVersion,
    switchVersion,
    loading,
    error,
    refetch: fetchDetails,
    revealInFinder,
  };
}

export function usePackageDependents(name: string | null, isCask: boolean = false) {
  const [dependents, setDependents] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!name || isCask) {
      setDependents([]);
      return;
    }

    let isMounted = true;
    setLoading(true);
    invoke<PackageDetails>('get_package_details', { name, isCask })
      .then((data) => {
        if (isMounted) {
          setDependents(data?.dependents || []);
        }
      })
      .catch(() => {
        if (isMounted) setDependents([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [name, isCask]);

  return { dependents, loading };
}
