import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

const CACHE_KEY = 'brewi_brewfile_cache';

export function useBrewfile() {
  const [content, setContent] = useState<string | null>(() => {
    return localStorage.getItem(CACHE_KEY) || null;
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [savedPath, setSavedPath] = useState<string | null>(null);

  const exportBrewfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await invoke<string>('export_brewfile');
      setContent(res);
      localStorage.setItem(CACHE_KEY, res);
    } catch (err) {
      console.error('Failed to export Brewfile:', err);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const saveToFile = useCallback(
    async (path?: string) => {
      if (!content) return;
      try {
        const resPath = await invoke<string>('save_brewfile_to_file', {
          path: path || null,
          content,
        });
        setSavedPath(resPath);
        setTimeout(() => setSavedPath(null), 4000);
        return resPath;
      } catch (err) {
        console.error('Failed to save Brewfile:', err);
        throw err;
      }
    },
    [content]
  );

  const copyToClipboard = useCallback(() => {
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [content]);

  return {
    content,
    loading,
    error,
    copied,
    savedPath,
    exportBrewfile,
    saveToFile,
    copyToClipboard,
  };
}
