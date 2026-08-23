import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { PackageSummary } from '../types';

export function usePackageSearch() {
  const [results, setResults] = useState<PackageSummary[]>([]);
  const [searching, setSearching] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const searchPackages = useCallback(async (query: string) => {
    const q = query.trim();
    if (!q) return;

    setSearching(true);
    setSearched(true);
    setError(null);
    try {
      const res = await invoke<PackageSummary[]>('search_brew', { query: q });
      setResults(res);
    } catch (err) {
      console.error('Search failed:', err);
      setError(String(err));
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setResults([]);
    setSearched(false);
    setError(null);
  }, []);

  return {
    results,
    searching,
    searched,
    error,
    searchPackages,
    clearSearch,
  };
}
