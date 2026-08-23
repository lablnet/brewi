use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrewEnvInfo {
    pub brew_path: String,
    pub brew_version: String,
    pub prefix: String,
    pub cellar: String,
    pub caskroom: String,
    pub arch: String,
    pub os_version: String,
    pub is_brew_installed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PackageSummary {
    pub id: String,
    pub name: String,
    pub full_name: String,
    pub package_type: String, // "formula" | "cask"
    pub tap: Option<String>,
    pub desc: Option<String>,
    pub homepage: Option<String>,
    pub installed_version: Option<String>,
    pub latest_version: Option<String>,
    pub is_outdated: bool,
    pub is_pinned: bool,
    pub is_leaf: bool,
    pub size_bytes: Option<u64>,
    pub size_formatted: Option<String>,
    pub install_date: Option<String>,
    pub license: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PackageDetails {
    pub name: String,
    pub full_name: String,
    pub package_type: String,
    pub tap: Option<String>,
    pub desc: Option<String>,
    pub homepage: Option<String>,
    pub installed_version: Option<String>,
    pub latest_version: Option<String>,
    pub is_outdated: bool,
    pub is_pinned: bool,
    pub is_leaf: bool,
    pub license: Option<String>,
    pub caveats: Option<String>,
    pub dependencies: Vec<String>,
    pub build_dependencies: Vec<String>,
    pub dependents: Vec<String>, // Reverse dependencies
    pub conflicts_with: Vec<String>,
    pub installed_files: Vec<String>,
    pub install_path: Option<String>,
    pub size_formatted: Option<String>,
    pub install_date: Option<String>,
    pub bottle_poured: bool,
    pub is_deprecated: bool,
    pub deprecation_reason: Option<String>,
    pub is_disabled: bool,
    pub disable_reason: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrewService {
    pub name: String,
    pub status: String, // "started" | "stopped" | "error" | "none"
    pub user: Option<String>,
    pub file: Option<String>,
    pub exit_code: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrewTap {
    pub name: String,
    pub user: Option<String>,
    pub repo: Option<String>,
    pub path: Option<String>,
    pub official: bool,
    pub formula_count: usize,
    pub cask_count: usize,
    pub remote: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrewDoctorIssue {
    pub category: String,
    pub title: String,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrewCleanupItem {
    pub path: String,
    pub size_bytes: u64,
    pub size_formatted: String,
    pub is_cache: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrewCleanupResult {
    pub items: Vec<BrewCleanupItem>,
    pub total_bytes: u64,
    pub total_formatted: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamEventPayload {
    pub task_id: String,
    pub line: String,
    pub stream_type: String, // "stdout" | "stderr" | "exit" | "start"
    pub exit_code: Option<i32>,
    pub success: Option<bool>,
}

// Raw Brew JSON Models for parsing `brew info --json=v2`
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct RawBrewInfo {
    #[serde(default)]
    pub formulae: Vec<RawFormula>,
    #[serde(default)]
    pub casks: Vec<RawCask>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct RawFormula {
    pub name: String,
    #[serde(default)]
    pub full_name: String,
    #[serde(default)]
    pub tap: Option<String>,
    #[serde(default)]
    pub desc: Option<String>,
    #[serde(default)]
    pub license: Option<String>,
    #[serde(default)]
    pub homepage: Option<String>,
    #[serde(default)]
    pub versions: RawVersions,
    #[serde(default)]
    pub installed: Vec<RawInstalledFormulaVersion>,
    #[serde(default)]
    pub dependencies: Vec<String>,
    #[serde(default)]
    pub build_dependencies: Vec<String>,
    #[serde(default)]
    pub caveats: Option<String>,
    #[serde(default)]
    pub conflicts_with: Vec<String>,
    #[serde(default)]
    pub pinned: bool,
    #[serde(default)]
    pub outdated: bool,
    #[serde(default)]
    pub deprecated: bool,
    #[serde(default)]
    pub deprecation_reason: Option<String>,
    #[serde(default)]
    pub disabled: bool,
    #[serde(default)]
    pub disable_reason: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct RawVersions {
    pub stable: Option<String>,
    pub head: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct RawInstalledFormulaVersion {
    pub version: String,
    #[serde(default)]
    pub installed_as_dependency: Option<bool>,
    #[serde(default)]
    pub installed_on_request: Option<bool>,
    #[serde(default)]
    pub poured_from_bottle: Option<bool>,
    #[serde(default)]
    pub time: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct RawCask {
    pub token: String,
    #[serde(default)]
    pub full_token: Option<String>,
    #[serde(default)]
    pub tap: Option<String>,
    #[serde(default)]
    pub name: Vec<String>,
    #[serde(default)]
    pub desc: Option<String>,
    #[serde(default)]
    pub homepage: Option<String>,
    #[serde(default)]
    pub version: Option<String>,
    #[serde(default)]
    pub installed: Option<String>,
    #[serde(default)]
    pub outdated: bool,
    #[serde(default)]
    pub caveats: Option<String>,
    #[serde(default)]
    pub conflicts_with: Option<RawCaskConflicts>,
    #[serde(default)]
    pub deprecated: bool,
    #[serde(default)]
    pub deprecation_reason: Option<String>,
    #[serde(default)]
    pub disabled: bool,
    #[serde(default)]
    pub disable_reason: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct RawCaskConflicts {
    #[serde(default)]
    pub cask: Vec<String>,
    #[serde(default)]
    pub formula: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct RawOutdatedInfo {
    #[serde(default)]
    pub formulae: Vec<RawOutdatedFormula>,
    #[serde(default)]
    pub casks: Vec<RawOutdatedCask>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct RawOutdatedFormula {
    pub name: String,
    #[serde(default)]
    pub installed_versions: Vec<String>,
    pub current_version: String,
    #[serde(default)]
    pub pinned: bool,
    #[serde(default)]
    pub pinned_version: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct RawOutdatedCask {
    pub name: String,
    #[serde(default)]
    pub installed_versions: Vec<String>,
    pub current_version: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct RawTapInfo {
    pub name: String,
    pub user: Option<String>,
    pub repo: Option<String>,
    pub path: Option<String>,
    pub installed: Option<bool>,
    pub official: Option<bool>,
    pub formula_names: Option<Vec<String>>,
    pub cask_tokens: Option<Vec<String>>,
    pub remote: Option<String>,
}
