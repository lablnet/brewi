use tauri::AppHandle;
use crate::brew::cli::{run_brew_command_capture, run_brew_command_capture_all, run_streaming_brew_command, TASK_MANAGER};
use crate::brew::models::{BrewCleanupItem, BrewCleanupResult, BrewDoctorIssue};
use crate::brew::utils::{format_bytes, strip_ansi};

#[tauri::command]
pub async fn run_doctor() -> Result<Vec<BrewDoctorIssue>, String> {
    let out = run_brew_command_capture_all(&["doctor"]).await;
    let clean_out = strip_ansi(&out);

    let mut issues = Vec::new();
    let mut current_title = String::new();
    let mut current_msg = Vec::new();

    for line in clean_out.lines() {
        let trimmed = line.trim();

        // Skip disclaimer preamble
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
            current_title = trimmed.strip_prefix("Warning:").unwrap_or(trimmed).trim().to_string();
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

    Ok(issues)
}

#[tauri::command]
pub async fn get_cleanup_dry_run() -> Result<BrewCleanupResult, String> {
    let out = run_brew_command_capture(&["cleanup", "-n", "--prune=all"]).await.unwrap_or_default();
    
    let mut items = Vec::new();
    let mut total_bytes = 0u64;

    for line in out.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("Would remove:") || trimmed.starts_with("==>") {
            continue;
        }

        if !trimmed.is_empty() {
            let path = trimmed.to_string();
            let size = std::fs::metadata(&path).map(|m| m.len()).unwrap_or(0);
            total_bytes += size;

            items.push(BrewCleanupItem {
                path,
                size_bytes: size,
                size_formatted: format_bytes(size),
                is_cache: trimmed.contains("Cache") || trimmed.contains("Homebrew/downloads"),
            });
        }
    }

    Ok(BrewCleanupResult {
        items,
        total_bytes,
        total_formatted: format_bytes(total_bytes),
    })
}

#[tauri::command]
pub async fn run_cleanup(
    app: AppHandle,
    prune_all: bool,
    task_id: String,
) -> Result<(), String> {
    let mut args = vec!["cleanup".to_string()];
    if prune_all {
        args.push("--prune=all".to_string());
    }
    run_streaming_brew_command(app, task_id, args).await
}

#[tauri::command]
pub async fn export_brewfile() -> Result<String, String> {
    run_brew_command_capture(&["bundle", "dump", "--file=-"]).await
}

#[tauri::command]
pub async fn save_brewfile_to_file(path: Option<String>, content: String) -> Result<String, String> {
    let target_path = if let Some(p) = path {
        if p.trim().is_empty() {
            let home = std::env::var("HOME").map_err(|_| "Could not resolve HOME directory".to_string())?;
            format!("{}/Brewfile", home)
        } else {
            p
        }
    } else {
        let home = std::env::var("HOME").map_err(|_| "Could not resolve HOME directory".to_string())?;
        format!("{}/Brewfile", home)
    };

    std::fs::write(&target_path, content)
        .map_err(|e| format!("Failed to write Brewfile to {}: {}", target_path, e))?;

    Ok(target_path)
}

#[tauri::command]
pub fn cancel_task(task_id: String) -> bool {
    TASK_MANAGER.cancel(&task_id)
}
