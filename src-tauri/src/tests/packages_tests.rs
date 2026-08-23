// src-tauri/src/tests/packages_tests.rs
//
// Unit tests for pure, side-effect-free helper logic in Brewi.
//
// All helpers are copied verbatim from the production source so these tests
// are self-contained and can run with `cargo test --lib` without launching
// Tauri or requiring Homebrew to be installed.
//
// Tests that touch the filesystem use `tempfile::TempDir` so they are
// hermetically isolated and leave no side effects after the test run.

// ─── format_bytes (packages.rs variant) ─────────────────────────────────────

#[cfg(test)]
mod format_bytes_packages {
    fn format_bytes(bytes: u64) -> String {
        const KB: u64 = 1024;
        const MB: u64 = KB * 1024;
        const GB: u64 = MB * 1024;
        if bytes >= GB {
            format!("{:.2} GB", bytes as f64 / GB as f64)
        } else if bytes >= MB {
            format!("{:.1} MB", bytes as f64 / MB as f64)
        } else if bytes >= KB {
            format!("{:.0} KB", bytes as f64 / KB as f64)
        } else {
            format!("{} B", bytes)
        }
    }

    #[test]
    fn zero_bytes() {
        assert_eq!(format_bytes(0), "0 B");
    }

    #[test]
    fn small_bytes_below_kb() {
        assert_eq!(format_bytes(512), "512 B");
    }

    #[test]
    fn exact_one_kilobyte() {
        assert_eq!(format_bytes(1024), "1 KB");
    }

    #[test]
    fn one_megabyte() {
        assert_eq!(format_bytes(1024 * 1024), "1.0 MB");
    }

    #[test]
    fn one_and_half_megabytes() {
        let bytes = (1024.0 * 1024.0 * 1.5) as u64;
        assert_eq!(format_bytes(bytes), "1.5 MB");
    }

    #[test]
    fn exactly_one_gigabyte() {
        let one_gb = 1024u64 * 1024 * 1024;
        assert_eq!(format_bytes(one_gb), "1.00 GB");
    }

    #[test]
    fn large_value_stays_in_gb() {
        let two_gb = 2u64 * 1024 * 1024 * 1024;
        assert_eq!(format_bytes(two_gb), "2.00 GB");
    }
}

// ─── format_bytes (maintenance.rs variant) ──────────────────────────────────

#[cfg(test)]
mod format_bytes_maintenance {
    fn format_bytes(bytes: u64) -> String {
        if bytes == 0 {
            return "0 B".to_string();
        }
        const UNITS: [&str; 5] = ["B", "KB", "MB", "GB", "TB"];
        let mut size = bytes as f64;
        let mut idx = 0;
        while size >= 1024.0 && idx < UNITS.len() - 1 {
            size /= 1024.0;
            idx += 1;
        }
        format!("{:.1} {}", size, UNITS[idx])
    }

    #[test]
    fn zero_bytes() {
        assert_eq!(format_bytes(0), "0 B");
    }

    #[test]
    fn five_hundred_bytes() {
        assert_eq!(format_bytes(500), "500.0 B");
    }

    #[test]
    fn one_kilobyte() {
        assert_eq!(format_bytes(1024), "1.0 KB");
    }

    #[test]
    fn one_megabyte() {
        assert_eq!(format_bytes(1024 * 1024), "1.0 MB");
    }

    #[test]
    fn one_gigabyte() {
        assert_eq!(format_bytes(1024 * 1024 * 1024), "1.0 GB");
    }

    #[test]
    fn one_terabyte() {
        assert_eq!(format_bytes(1024u64 * 1024 * 1024 * 1024), "1.0 TB");
    }

    #[test]
    fn fractional_megabytes() {
        let bytes = (1024.0 * 1024.0 * 2.5) as u64;
        assert_eq!(format_bytes(bytes), "2.5 MB");
    }
}

// ─── extract_json_str ────────────────────────────────────────────────────────

#[cfg(test)]
mod extract_json_str {
    fn extract_json_str(raw: &str) -> &str {
        if let Some(start) = raw.find('{') {
            if let Some(end) = raw.rfind('}') {
                if end >= start {
                    return &raw[start..=end];
                }
            }
        }
        raw.trim()
    }

    #[test]
    fn clean_json_returned_unchanged() {
        let input = r#"{"key": "value"}"#;
        assert_eq!(extract_json_str(input), r#"{"key": "value"}"#);
    }

    #[test]
    fn leading_garbage_stripped() {
        let input = "noise\n{\"key\": 1}";
        assert_eq!(extract_json_str(input), "{\"key\": 1}");
    }

    #[test]
    fn nested_objects_handled() {
        let input = r#"{"outer": {"inner": 42}}"#;
        // rfind('}') finds the outermost closing brace → full object preserved
        assert_eq!(extract_json_str(input), r#"{"outer": {"inner": 42}}"#);
    }

    #[test]
    fn no_braces_returns_trimmed_string() {
        assert_eq!(extract_json_str("   plain text   "), "plain text");
    }

    #[test]
    fn empty_string_returns_empty() {
        assert_eq!(extract_json_str(""), "");
    }

    #[test]
    fn whitespace_only_returns_empty() {
        assert_eq!(extract_json_str("   "), "");
    }
}

// ─── get_dir_size (filesystem) ───────────────────────────────────────────────

#[cfg(test)]
mod get_dir_size {
    use std::fs;
    use std::path::Path;
    use tempfile::TempDir;

    fn get_dir_size<P: AsRef<Path>>(path: P) -> u64 {
        let mut total = 0u64;
        if let Ok(entries) = fs::read_dir(path) {
            for entry in entries.flatten() {
                let p = entry.path();
                if p.is_file() {
                    if let Ok(meta) = fs::metadata(&p) {
                        total += meta.len();
                    }
                } else if p.is_dir() {
                    total += get_dir_size(&p);
                }
            }
        }
        total
    }

    #[test]
    fn empty_directory_is_zero() {
        let dir = TempDir::new().unwrap();
        assert_eq!(get_dir_size(dir.path()), 0);
    }

    #[test]
    fn single_file_counted() {
        let dir = TempDir::new().unwrap();
        fs::write(dir.path().join("file.txt"), b"hello world").unwrap(); // 11 B
        assert_eq!(get_dir_size(dir.path()), 11);
    }

    #[test]
    fn multiple_files_summed() {
        let dir = TempDir::new().unwrap();
        fs::write(dir.path().join("a.txt"), b"aaa").unwrap();   // 3 B
        fs::write(dir.path().join("b.txt"), b"bbbbb").unwrap(); // 5 B
        assert_eq!(get_dir_size(dir.path()), 8);
    }

    #[test]
    fn recursive_subdirectory_counted() {
        let dir = TempDir::new().unwrap();
        let sub = dir.path().join("sub");
        fs::create_dir(&sub).unwrap();
        fs::write(dir.path().join("top.txt"), b"top").unwrap();    // 3 B
        fs::write(sub.join("nested.txt"), b"nested").unwrap();     // 6 B
        assert_eq!(get_dir_size(dir.path()), 9);
    }

    #[test]
    fn nonexistent_path_returns_zero() {
        assert_eq!(get_dir_size("/this/does/not/exist/ever"), 0);
    }

    #[test]
    fn hidden_files_are_counted() {
        let dir = TempDir::new().unwrap();
        fs::write(dir.path().join(".hidden"), b"secret").unwrap(); // 6 B
        assert_eq!(get_dir_size(dir.path()), 6);
    }
}

// ─── brew JSON parsing (RawBrewInfo) ─────────────────────────────────────────

#[cfg(test)]
mod raw_brew_info_parsing {
    use crate::brew::models::RawBrewInfo;

    const FORMULA_JSON: &str = r#"{
      "formulae": [{
        "name": "wget",
        "full_name": "wget",
        "tap": "homebrew/core",
        "desc": "Internet file retriever",
        "license": "GPL-3.0-or-later",
        "homepage": "https://www.gnu.org/software/wget/",
        "versions": { "stable": "1.25.0", "head": null },
        "installed": [{
          "version": "1.25.0",
          "installed_as_dependency": false,
          "installed_on_request": true,
          "poured_from_bottle": true,
          "time": 1700000000
        }],
        "dependencies": ["libidn2", "openssl@3"],
        "build_dependencies": [],
        "caveats": null,
        "conflicts_with": [],
        "pinned": false,
        "outdated": false,
        "deprecated": false,
        "deprecation_reason": null,
        "disabled": false,
        "disable_reason": null
      }],
      "casks": []
    }"#;

    const CASK_JSON: &str = r#"{
      "formulae": [],
      "casks": [{
        "token": "firefox",
        "full_token": "homebrew/cask/firefox",
        "tap": "homebrew/cask",
        "name": ["Firefox"],
        "desc": "Web browser",
        "homepage": "https://www.mozilla.org/firefox/",
        "version": "130.0",
        "installed": "129.0",
        "outdated": true,
        "deprecated": false,
        "disabled": false
      }]
    }"#;

    #[test]
    fn formula_name_and_version_parsed() {
        let info: RawBrewInfo = serde_json::from_str(FORMULA_JSON).unwrap();
        let f = &info.formulae[0];
        assert_eq!(f.name, "wget");
        assert_eq!(f.versions.stable.as_deref(), Some("1.25.0"));
    }

    #[test]
    fn formula_dependencies_parsed() {
        let info: RawBrewInfo = serde_json::from_str(FORMULA_JSON).unwrap();
        assert_eq!(info.formulae[0].dependencies, vec!["libidn2", "openssl@3"]);
        assert!(info.formulae[0].build_dependencies.is_empty());
    }

    #[test]
    fn formula_installed_version_and_timestamp() {
        let info: RawBrewInfo = serde_json::from_str(FORMULA_JSON).unwrap();
        let installed = info.formulae[0].installed.first().unwrap();
        assert_eq!(installed.version, "1.25.0");
        assert_eq!(installed.poured_from_bottle, Some(true));
        assert_eq!(installed.time, Some(1_700_000_000));
    }

    #[test]
    fn formula_boolean_flags_correct() {
        let info: RawBrewInfo = serde_json::from_str(FORMULA_JSON).unwrap();
        let f = &info.formulae[0];
        assert!(!f.outdated);
        assert!(!f.pinned);
        assert!(!f.deprecated);
        assert!(!f.disabled);
    }

    #[test]
    fn cask_token_and_versions_parsed() {
        let info: RawBrewInfo = serde_json::from_str(CASK_JSON).unwrap();
        let c = &info.casks[0];
        assert_eq!(c.token, "firefox");
        assert_eq!(c.version.as_deref(), Some("130.0"));
        assert_eq!(c.installed.as_deref(), Some("129.0"));
    }

    #[test]
    fn cask_outdated_flag() {
        let info: RawBrewInfo = serde_json::from_str(CASK_JSON).unwrap();
        assert!(info.casks[0].outdated);
    }

    #[test]
    fn empty_lists_deserialise_correctly() {
        let json = r#"{"formulae": [], "casks": []}"#;
        let info: RawBrewInfo = serde_json::from_str(json).unwrap();
        assert!(info.formulae.is_empty());
        assert!(info.casks.is_empty());
    }

    #[test]
    fn minimal_formula_missing_optionals_uses_defaults() {
        let json = r#"{"formulae": [{"name": "foo"}], "casks": []}"#;
        let info: RawBrewInfo = serde_json::from_str(json).unwrap();
        let f = &info.formulae[0];
        assert_eq!(f.name, "foo");
        assert!(f.installed.is_empty());
        assert!(f.dependencies.is_empty());
        assert!(f.desc.is_none());
    }
}

// ─── Doctor output parser ────────────────────────────────────────────────────

#[cfg(test)]
mod doctor_parsing {
    use crate::brew::models::{BrewCleanupItem, BrewCleanupResult, BrewDoctorIssue, PackageSummary, RawBrewInfo};
    use crate::brew::utils::{extract_json_str, format_bytes, get_dir_size, strip_ansi};

    fn parse_doctor(output: &str) -> Vec<BrewDoctorIssue> {
        let mut issues = Vec::new();
        let mut current_title = String::new();
        let mut current_msg: Vec<&str> = Vec::new();

        for line in output.lines() {
            let trimmed = line.trim();
            if trimmed.starts_with("Please note that these warnings")
                || trimmed.starts_with("with debugging if you file")
                || trimmed.starts_with("working fine: please don't worry")
                || trimmed.starts_with("Your system is ready to brew")
            {
                continue;
            }
            if trimmed.starts_with("Warning:") {
                if !current_title.is_empty() {
                    issues.push(BrewDoctorIssue {
                        category: "Warning".to_string(),
                        title: current_title.clone(),
                        message: current_msg.join("\n").trim().to_string(),
                    });
                    current_msg.clear();
                }
                current_title = trimmed
                    .strip_prefix("Warning:")
                    .unwrap_or(trimmed)
                    .trim()
                    .to_string();
            } else if !current_title.is_empty() {
                if !line.is_empty() || !current_msg.is_empty() {
                    current_msg.push(line);
                }
            }
        }
        if !current_title.is_empty() {
            issues.push(BrewDoctorIssue {
                category: "Warning".to_string(),
                title: current_title,
                message: current_msg.join("\n").trim().to_string(),
            });
        }
        issues
    }

    #[test]
    fn empty_output_no_issues() {
        assert!(parse_doctor("").is_empty());
    }

    #[test]
    fn ready_message_skipped() {
        assert!(parse_doctor("Your system is ready to brew.").is_empty());
    }

    #[test]
    fn preamble_lines_skipped() {
        let out = "Please note that these warnings are just for debugging\nWarning: Real issue";
        let issues = parse_doctor(out);
        assert_eq!(issues.len(), 1);
        assert_eq!(issues[0].title, "Real issue");
    }

    #[test]
    fn single_warning_title_and_message() {
        let out = "Warning: Shallow clone\nRun git fetch to fix.";
        let issues = parse_doctor(out);
        assert_eq!(issues.len(), 1);
        assert_eq!(issues[0].title, "Shallow clone");
        assert!(issues[0].message.contains("git fetch"));
        assert_eq!(issues[0].category, "Warning");
    }

    #[test]
    fn multiple_warnings_separated() {
        let out = "Warning: First\nDetail for first\nWarning: Second\nDetail for second";
        let issues = parse_doctor(out);
        assert_eq!(issues.len(), 2);
        assert_eq!(issues[0].title, "First");
        assert_eq!(issues[1].title, "Second");
        assert!(issues[0].message.contains("Detail for first"));
        assert!(issues[1].message.contains("Detail for second"));
    }

    #[test]
    fn all_issues_have_warning_category() {
        let out = "Warning: A\nWarning: B";
        let issues = parse_doctor(out);
        assert!(issues.iter().all(|i| i.category == "Warning"));
    }

    #[test]
    fn multi_line_message_preserved() {
        let out = "Warning: Complex\nLine 1\nLine 2\nLine 3";
        let issues = parse_doctor(out);
        assert_eq!(issues.len(), 1);
        assert!(issues[0].message.contains("Line 1"));
        assert!(issues[0].message.contains("Line 3"));
    }
}

// ─── Brewfile path resolution ────────────────────────────────────────────────

#[cfg(test)]
mod brewfile_path_resolution {
    use std::fs;
    use tempfile::TempDir;

    fn resolve_and_write(path: Option<String>, content: &str) -> Result<String, String> {
        let target = match path {
            Some(p) if !p.trim().is_empty() => p,
            _ => {
                let home = std::env::var("HOME")
                    .map_err(|_| "Could not resolve HOME".to_string())?;
                format!("{}/Brewfile", home)
            }
        };
        fs::write(&target, content).map_err(|e| format!("Write failed: {}", e))?;
        Ok(target)
    }

    #[test]
    fn explicit_path_used_as_is() {
        let dir = TempDir::new().unwrap();
        let path = dir.path().join("TestBrewfile").to_string_lossy().to_string();
        let result = resolve_and_write(Some(path.clone()), "brew 'wget'");
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), path);
        assert_eq!(fs::read_to_string(&path).unwrap(), "brew 'wget'");
    }

    #[test]
    fn none_path_falls_back_to_home_brewfile() {
        // Override HOME to point at a temp dir so we don't pollute the real home
        let dir = TempDir::new().unwrap();
        std::env::set_var("HOME", dir.path());
        let result = resolve_and_write(None, "tap 'homebrew/core'");
        assert!(result.is_ok());
        assert!(result.unwrap().ends_with("/Brewfile"));
    }

    #[test]
    fn blank_path_falls_back_to_home_brewfile() {
        let dir = TempDir::new().unwrap();
        std::env::set_var("HOME", dir.path());
        let result = resolve_and_write(Some("   ".to_string()), "tap 'homebrew/core'");
        assert!(result.is_ok());
        assert!(result.unwrap().ends_with("/Brewfile"));
    }

    #[test]
    fn content_is_written_verbatim() {
        let dir = TempDir::new().unwrap();
        let path = dir.path().join("Brewfile").to_string_lossy().to_string();
        let content = "brew 'git'\nbrew 'curl'\ncask 'firefox'";
        resolve_and_write(Some(path.clone()), content).unwrap();
        assert_eq!(fs::read_to_string(&path).unwrap(), content);
    }
}

// ─── Additional Model & Helper Unit Tests ────────────────────────────────────

#[cfg(test)]
mod brew_service_tests {
    use crate::brew::models::BrewService;

    #[test]
    fn test_brew_service_deserialization() {
        let json = r#"{
            "name": "postgresql@14",
            "status": "started",
            "user": "user",
            "file": "/Library/LaunchDaemons/postgresql.plist",
            "exit_code": 0
        }"#;
        let service: BrewService = serde_json::from_str(json).unwrap();
        assert_eq!(service.name, "postgresql@14");
        assert_eq!(service.status, "started");
        assert_eq!(service.exit_code, Some(0));
    }
}

#[cfg(test)]
mod brew_tap_tests {
    use crate::brew::models::BrewTap;

    #[test]
    fn test_brew_tap_deserialization() {
        let json = r#"{
            "name": "homebrew/core",
            "user": "homebrew",
            "repo": "core",
            "path": "/opt/homebrew/Library/Taps/homebrew/homebrew-core",
            "official": true,
            "formula_count": 7000,
            "cask_count": 0,
            "remote": "https://github.com/Homebrew/homebrew-core"
        }"#;
        let tap: BrewTap = serde_json::from_str(json).unwrap();
        assert_eq!(tap.name, "homebrew/core");
        assert!(tap.official);
        assert_eq!(tap.formula_count, 7000);
    }
}

#[cfg(test)]
mod raw_outdated_info_tests {
    use crate::brew::models::RawOutdatedInfo;

    #[test]
    fn test_raw_outdated_parsing() {
        let json = r#"{
            "formulae": [
                {
                    "name": "node",
                    "installed_versions": ["20.0.0"],
                    "current_version": "22.0.0",
                    "pinned": true,
                    "pinned_version": "20.0.0"
                }
            ],
            "casks": []
        }"#;
        let info: RawOutdatedInfo = serde_json::from_str(json).unwrap();
        assert_eq!(info.formulae.len(), 1);
        assert_eq!(info.formulae[0].name, "node");
        assert!(info.formulae[0].pinned);
        assert_eq!(info.formulae[0].current_version, "22.0.0");
    }
}

#[cfg(test)]
mod task_manager_tests {
    use crate::brew::cli::TaskManager;

    #[test]
    fn test_task_manager_register_and_cancel() {
        let tm = TaskManager::new();
        let task_id = "task-123";
        let _rx = tm.register(task_id);

        assert!(tm.cancel(task_id));
        // Second cancel returns false because sender was removed on first cancel
        assert!(!tm.cancel(task_id));
    }

    #[test]
    fn test_task_manager_remove() {
        let tm = TaskManager::new();
        let task_id = "task-456";
        let _rx = tm.register(task_id);

        tm.remove(task_id);
        assert!(!tm.cancel(task_id));
    }
}

#[cfg(test)]
mod services_parsing_tests {
    use crate::brew::models::BrewService;

    fn parse_plain_services(raw: &str) -> Vec<BrewService> {
        let mut list = Vec::new();
        for line in raw.lines().skip(1) {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if !parts.is_empty() {
                let name = parts[0].to_string();
                let status = parts.get(1).unwrap_or(&"none").to_string();
                let user = parts.get(2).map(|s| s.to_string());
                let file = parts.get(3).map(|s| s.to_string());
                list.push(BrewService {
                    name,
                    status,
                    user,
                    file,
                    exit_code: None,
                });
            }
        }
        list
    }

    #[test]
    fn test_parse_plain_services() {
        let raw = "Name       Status  User File\npostgresql started user /Library/LaunchDaemons/postgresql.plist\nredis      stopped";
        let services = parse_plain_services(raw);
        assert_eq!(services.len(), 2);
        assert_eq!(services[0].name, "postgresql");
        assert_eq!(services[0].status, "started");
        assert_eq!(services[0].user.as_deref(), Some("user"));
        assert_eq!(services[1].name, "redis");
        assert_eq!(services[1].status, "stopped");
        assert_eq!(services[1].user, None);
    }
}

#[cfg(test)]
mod taps_parsing_tests {
    use crate::brew::models::BrewTap;

    fn parse_plain_taps(raw: &str) -> Vec<BrewTap> {
        raw.lines()
            .map(|l| l.trim().to_string())
            .filter(|l| !l.is_empty())
            .map(|name| {
                let official = name == "homebrew/core" || name == "homebrew/cask";
                BrewTap {
                    name: name.clone(),
                    user: None,
                    repo: None,
                    path: None,
                    official,
                    formula_count: 0,
                    cask_count: 0,
                    remote: None,
                }
            })
            .collect()
    }

    #[test]
    fn test_parse_plain_taps() {
        let raw = "homebrew/core\nhomebrew/cask\nhashicorp/tap\n";
        let taps = parse_plain_taps(raw);
        assert_eq!(taps.len(), 3);
        assert!(taps[0].official);
        assert!(taps[1].official);
        assert!(!taps[2].official);
    }
}


