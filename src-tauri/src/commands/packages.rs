use std::collections::HashSet;
use std::process::Command;
use tauri::AppHandle;
use crate::brew::cli::{run_brew_command_capture, run_streaming_brew_command};
use crate::brew::detector::get_environment_info;
use crate::brew::models::{PackageDetails, PackageSummary, RawBrewInfo};
use crate::brew::utils::{extract_json_str, format_bytes, get_dir_size};

#[tauri::command]
pub async fn get_installed_packages() -> Result<Vec<PackageSummary>, String> {
    let env = get_environment_info();

    let info_fut = run_brew_command_capture(&["info", "--json=v2", "--installed"]);
    let leaves_fut = run_brew_command_capture(&["leaves"]);

    let (info_res, leaves_res) = tokio::join!(info_fut, leaves_fut);

    let info_str = info_res?;
    let json_slice = extract_json_str(&info_str);
    let parsed: RawBrewInfo = serde_json::from_str(json_slice)
        .map_err(|e| format!("Failed to parse brew info JSON: {}. Content was: {:.200}", e, json_slice))?;

    let leaves_set: HashSet<String> = leaves_res
        .unwrap_or_default()
        .lines()
        .map(|l| l.trim().to_string())
        .filter(|l| !l.is_empty())
        .collect();

    let mut summaries = Vec::new();

    for f in parsed.formulae {
        let installed_ver = f.installed.first().map(|v| v.version.clone());
        let install_date = f.installed.first().and_then(|v| v.time).map(|ts| {
            chrono::DateTime::from_timestamp(ts, 0)
                .map(|dt| dt.format("%Y-%m-%d %H:%M").to_string())
                .unwrap_or_default()
        });

        let is_leaf = leaves_set.contains(&f.name) || leaves_set.contains(&f.full_name);

        let (size_bytes, size_formatted) = if let Some(ver) = &installed_ver {
            let formula_dir = format!("{}/{}/{}", env.cellar, f.name, ver);
            let size = get_dir_size(&formula_dir);
            if size > 0 {
                (Some(size), Some(format_bytes(size)))
            } else {
                (None, None)
            }
        } else {
            (None, None)
        };

        summaries.push(PackageSummary {
            id: format!("formula:{}", f.name),
            name: f.name.clone(),
            full_name: if f.full_name.is_empty() { f.name.clone() } else { f.full_name },
            package_type: "formula".to_string(),
            tap: f.tap,
            desc: f.desc,
            homepage: f.homepage,
            installed_version: installed_ver,
            latest_version: f.versions.stable.clone(),
            is_outdated: f.outdated,
            is_pinned: f.pinned,
            is_leaf,
            size_bytes,
            size_formatted,
            install_date,
            license: f.license,
        });
    }

    for c in parsed.casks {
        let (size_bytes, size_formatted) = {
            let cask_dir = format!("{}/{}", env.caskroom, c.token);
            let size = get_dir_size(&cask_dir);
            if size > 0 {
                (Some(size), Some(format_bytes(size)))
            } else {
                (None, None)
            }
        };

        summaries.push(PackageSummary {
            id: format!("cask:{}", c.token),
            name: c.token.clone(),
            full_name: c.full_token.unwrap_or_else(|| c.token.clone()),
            package_type: "cask".to_string(),
            tap: c.tap,
            desc: c.desc,
            homepage: c.homepage,
            installed_version: c.installed.clone(),
            latest_version: c.version.clone(),
            is_outdated: c.outdated,
            is_pinned: false,
            is_leaf: true,
            size_bytes,
            size_formatted,
            install_date: None,
            license: None,
        });
    }

    summaries.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));

    Ok(summaries)
}

#[tauri::command]
pub async fn get_package_details(name: String, is_cask: bool) -> Result<PackageDetails, String> {
    let args = if is_cask {
        vec!["info", "--json=v2", "--cask", &name]
    } else {
        vec!["info", "--json=v2", "--formula", &name]
    };

    let raw = run_brew_command_capture(&args).await?;
    let json_slice = extract_json_str(&raw);
    let parsed: RawBrewInfo = serde_json::from_str(json_slice)
        .map_err(|e| format!("Failed to parse package details JSON: {}", e))?;

    let env = get_environment_info();

    if is_cask {
        let c = parsed
            .casks
            .into_iter()
            .next()
            .ok_or_else(|| format!("Cask '{}' not found", name))?;

        let install_path = format!("{}/{}", env.caskroom, c.token);
        let (size_formatted, _size_bytes) = if std::path::Path::new(&install_path).exists() {
            let s = get_dir_size(&install_path);
            (if s > 0 { Some(format_bytes(s)) } else { None }, Some(s))
        } else {
            (None, None)
        };

        Ok(PackageDetails {
            name: c.token.clone(),
            full_name: c.full_token.unwrap_or_else(|| c.token.clone()),
            package_type: "cask".to_string(),
            tap: c.tap,
            desc: c.desc,
            homepage: c.homepage,
            installed_version: c.installed.clone(),
            latest_version: c.version.clone(),
            is_outdated: c.outdated,
            is_pinned: false,
            is_leaf: true,
            license: None,
            caveats: c.caveats,
            dependencies: Vec::new(),
            build_dependencies: Vec::new(),
            dependents: Vec::new(),
            conflicts_with: c.conflicts_with.map(|cw| cw.cask).unwrap_or_default(),
            installed_files: Vec::new(),
            install_path: if std::path::Path::new(&install_path).exists() { Some(install_path) } else { None },
            size_formatted,
            install_date: None,
            bottle_poured: false,
            is_deprecated: c.deprecated,
            deprecation_reason: c.deprecation_reason,
            is_disabled: c.disabled,
            disable_reason: c.disable_reason,
        })
    } else {
        let f = parsed
            .formulae
            .into_iter()
            .next()
            .ok_or_else(|| format!("Formula '{}' not found", name))?;

        let uses_out = run_brew_command_capture(&["uses", "--installed", &f.name])
            .await
            .unwrap_or_default();
        let dependents: Vec<String> = uses_out
            .lines()
            .map(|l| l.trim().to_string())
            .filter(|l| !l.is_empty() && l != &f.name)
            .collect();

        let installed_ver = f.installed.first().map(|v| v.version.clone());
        let bottle_poured = f.installed.first().and_then(|v| v.poured_from_bottle).unwrap_or(false);
        let install_date = f.installed.first().and_then(|v| v.time).map(|ts| {
            chrono::DateTime::from_timestamp(ts, 0)
                .map(|dt| dt.format("%Y-%m-%d %H:%M").to_string())
                .unwrap_or_default()
        });

        let install_path = installed_ver.as_ref().map(|ver| format!("{}/{}/{}", env.cellar, f.name, ver));
        let size_formatted = install_path.as_ref().and_then(|p| {
            let s = get_dir_size(p);
            if s > 0 { Some(format_bytes(s)) } else { None }
        });

        let installed_files = if install_path.is_some() {
            let files_out = run_brew_command_capture(&["list", "--verbose", &f.name])
                .await
                .unwrap_or_default();
            files_out.lines().take(100).map(|s| s.trim().to_string()).filter(|s| !s.is_empty()).collect()
        } else {
            Vec::new()
        };

        Ok(PackageDetails {
            name: f.name.clone(),
            full_name: if f.full_name.is_empty() { f.name.clone() } else { f.full_name },
            package_type: "formula".to_string(),
            tap: f.tap,
            desc: f.desc,
            homepage: f.homepage,
            installed_version: installed_ver,
            latest_version: f.versions.stable.clone(),
            is_outdated: f.outdated,
            is_pinned: f.pinned,
            is_leaf: dependents.is_empty(),
            license: f.license,
            caveats: f.caveats,
            dependencies: f.dependencies,
            build_dependencies: f.build_dependencies,
            dependents,
            conflicts_with: f.conflicts_with,
            installed_files,
            install_path,
            size_formatted,
            install_date,
            bottle_poured,
            is_deprecated: f.deprecated,
            deprecation_reason: f.deprecation_reason,
            is_disabled: f.disabled,
            disable_reason: f.disable_reason,
        })
    }
}

#[tauri::command]
pub async fn get_installed_formula_versions(name: String) -> Result<Vec<String>, String> {
    let env = get_environment_info();
    let formula_dir = format!("{}/{}", env.cellar, name);
    let path = std::path::Path::new(&formula_dir);

    if !path.exists() || !path.is_dir() {
        return Ok(Vec::new());
    }

    let mut versions = Vec::new();
    if let Ok(entries) = std::fs::read_dir(path) {
        for entry in entries.flatten() {
            if entry.path().is_dir() {
                if let Some(ver_str) = entry.file_name().to_str() {
                    if !ver_str.starts_with('.') {
                        versions.push(ver_str.to_string());
                    }
                }
            }
        }
    }

    versions.sort();
    versions.reverse();
    Ok(versions)
}

#[tauri::command]
pub async fn switch_formula_version(
    app: AppHandle,
    name: String,
    version: String,
    task_id: String,
) -> Result<(), String> {
    let _ = run_brew_command_capture(&["unlink", &name]).await;
    let link_args = vec!["link".to_string(), "--overwrite".to_string(), "--force".to_string(), format!("{}@{}", name, version)];
    run_streaming_brew_command(app, task_id, link_args).await
}

#[tauri::command]
pub async fn install_package(
    app: AppHandle,
    name: String,
    is_cask: bool,
    task_id: String,
) -> Result<(), String> {
    let mut args = vec!["install".to_string()];
    if is_cask {
        args.push("--cask".to_string());
    }
    args.push(name);
    run_streaming_brew_command(app, task_id, args).await
}

#[tauri::command]
pub async fn uninstall_package(
    app: AppHandle,
    name: String,
    is_cask: bool,
    zap: bool,
    task_id: String,
) -> Result<(), String> {
    let mut args = vec!["uninstall".to_string()];
    if is_cask {
        args.push("--cask".to_string());
        if zap {
            args.push("--zap".to_string());
        }
    }
    args.push(name);
    run_streaming_brew_command(app, task_id, args).await
}

#[tauri::command]
pub async fn pin_formula(name: String, pin: bool) -> Result<(), String> {
    let action = if pin { "pin" } else { "unpin" };
    run_brew_command_capture(&[action, &name]).await?;
    Ok(())
}

#[tauri::command]
pub async fn search_brew(query: String) -> Result<Vec<PackageSummary>, String> {
    let q = query.trim();
    if q.is_empty() {
        return Ok(Vec::new());
    }

    let out = run_brew_command_capture(&["search", q]).await?;
    let mut results = Vec::new();
    let mut current_section = "formula";

    for line in out.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("==> Formulae") {
            current_section = "formula";
            continue;
        } else if trimmed.starts_with("==> Casks") {
            current_section = "cask";
            continue;
        }

        if trimmed.is_empty() || trimmed.starts_with("==>") {
            continue;
        }

        for item in trimmed.split_whitespace() {
            let name = item.trim().to_string();
            if !name.is_empty() {
                results.push(PackageSummary {
                    id: format!("{}:{}", current_section, name),
                    name: name.clone(),
                    full_name: name.clone(),
                    package_type: current_section.to_string(),
                    tap: None,
                    desc: None,
                    homepage: None,
                    installed_version: None,
                    latest_version: None,
                    is_outdated: false,
                    is_pinned: false,
                    is_leaf: false,
                    size_bytes: None,
                    size_formatted: None,
                    install_date: None,
                    license: None,
                });
            }
        }
    }

    Ok(results)
}

#[tauri::command]
pub fn reveal_in_finder(path: String) -> Result<(), String> {
    let p = std::path::Path::new(&path);
    if !p.exists() {
        return Err("Path does not exist".to_string());
    }

    let res = if p.is_dir() {
        Command::new("open").arg(&path).status()
    } else {
        Command::new("open").arg("-R").arg(&path).status()
    };

    match res {
        Ok(status) if status.success() => Ok(()),
        Ok(status) => Err(format!("Finder exited with status {:?}", status.code())),
        Err(e) => Err(e.to_string()),
    }
}
