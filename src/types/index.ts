export type PackageType = 'formula' | 'cask';

export interface PackageSummary {
  id: string;
  name: string;
  full_name: string;
  package_type: PackageType;
  tap?: string | null;
  desc?: string | null;
  homepage?: string | null;
  installed_version?: string | null;
  latest_version?: string | null;
  is_outdated: boolean;
  is_pinned: boolean;
  is_leaf: boolean;
  size_bytes?: number | null;
  size_formatted?: string | null;
  install_date?: string | null;
  license?: string | null;
}

export interface PackageDetails {
  name: string;
  full_name: string;
  package_type: PackageType;
  tap?: string | null;
  desc?: string | null;
  homepage?: string | null;
  installed_version?: string | null;
  latest_version?: string | null;
  is_outdated: boolean;
  is_pinned: boolean;
  is_leaf: boolean;
  license?: string | null;
  caveats?: string | null;
  dependencies: string[];
  build_dependencies: string[];
  dependents: string[];
  conflicts_with: string[];
  installed_files: string[];
  install_path?: string | null;
  size_formatted?: string | null;
  install_date?: string | null;
  bottle_poured: boolean;
  is_deprecated?: boolean;
  deprecation_reason?: string | null;
  is_disabled?: boolean;
  disable_reason?: string | null;
}

export interface BrewService {
  name: string;
  status: 'started' | 'stopped' | 'error' | 'none';
  user?: string | null;
  file?: string | null;
  exit_code?: number | null;
}

export interface BrewTap {
  name: string;
  user?: string | null;
  repo?: string | null;
  path?: string | null;
  official: boolean;
  formula_count: number;
  cask_count: number;
  remote?: string | null;
}

export interface BrewDoctorIssue {
  category: string;
  title: string;
  message: string;
}

export interface BrewCleanupItem {
  path: string;
  size_bytes: number;
  size_formatted: string;
  is_cache: boolean;
}

export interface BrewCleanupResult {
  items: BrewCleanupItem[];
  total_bytes: number;
  total_formatted: string;
}

export interface BrewEnvInfo {
  brew_path: string;
  brew_version: string;
  prefix: string;
  cellar: string;
  caskroom: string;
  arch: string;
  os_version: string;
  is_brew_installed?: boolean;
}

export interface StreamEventPayload {
  task_id: string;
  line: string;
  stream_type: 'stdout' | 'stderr' | 'exit' | 'start';
  exit_code?: number;
  success?: boolean;
}

export type ViewTab = 'installed' | 'updates' | 'services' | 'leaves' | 'taps' | 'doctor' | 'cleanup' | 'brewfile';
export type FilterType = 'all' | 'formulae' | 'casks' | 'outdated' | 'leaves' | 'pinned';
export type SortField = 'name' | 'type' | 'status' | 'date' | 'size';
