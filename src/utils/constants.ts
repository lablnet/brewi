import { ViewTab } from '../types';

export const STORAGE_KEYS = {
  THEME: 'brewi_theme',
  LANGUAGE: 'brewi_language',
  VIEW_MODE: 'brewi_view_mode',
  BREWFILE_CACHE: 'brewi_brewfile_cache',
  AUTOCLEAN_30D: 'brewi_autoclean_30d',
  PURGE_BOTTLES: 'brewi_purge_bottles',
  CLEAN_EXIT: 'brewi_clean_exit',
} as const;

export const POPULAR_TAPS = [
  { name: 'homebrew/cask-fonts', desc: 'Fonts for macOS' },
  { name: 'hashicorp/tap', desc: 'Terraform, Vault, Consul' },
  { name: 'supabase/tap', desc: 'Supabase CLI' },
  { name: 'stripe/stripe-cli', desc: 'Stripe CLI' },
  { name: 'mongodb/brew', desc: 'MongoDB Community' },
  { name: 'apple/apple', desc: 'Apple developer tools' },
] as const;

export const TAB_TITLES: Record<ViewTab, { title: string; subtitle: string }> = {
  installed: { title: 'Installed Packages', subtitle: 'Manage formulae, casks, and dependencies' },
  updates: { title: 'Pending Updates', subtitle: 'Review and upgrade outdated packages' },
  services: { title: 'Background Services', subtitle: 'Manage Homebrew daemons and services' },
  leaves: { title: 'Leaves & Orphan Packages', subtitle: 'Installed packages that have no dependents' },
  taps: { title: 'Taps & Repositories', subtitle: 'Third-party formulae and cask sources' },
  doctor: { title: 'Brew Doctor & Health', subtitle: 'System diagnostics and environment health' },
  cleanup: { title: 'Disk Cleanup & Hygiene', subtitle: 'Reclaim storage from old versions and caches' },
  brewfile: { title: 'Brewfile Export', subtitle: 'Snapshot and bundle your configuration' },
};
