use tauri::AppHandle;
use crate::brew::cli::{run_brew_command_capture, run_streaming_brew_command};
use crate::brew::models::RawOutdatedInfo;

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

#[tauri::command]
pub async fn check_outdated(greedy: bool) -> Result<RawOutdatedInfo, String> {
    let mut args = vec!["outdated", "--json=v2"];
    if greedy {
        args.push("--greedy");
    }

    let raw = run_brew_command_capture(&args).await?;
    let json_slice = extract_json_str(&raw);

    let parsed: RawOutdatedInfo = serde_json::from_str(json_slice)
        .map_err(|e| format!("Failed to parse outdated JSON: {}. Text was: {:.200}", e, json_slice))?;

    Ok(parsed)
}

#[tauri::command]
pub async fn upgrade_packages(
    app: AppHandle,
    names: Vec<String>,
    greedy: bool,
    task_id: String,
) -> Result<(), String> {
    let mut args = vec!["upgrade".to_string()];
    if greedy {
        args.push("--greedy".to_string());
    }

    for name in names {
        args.push(name);
    }

    run_streaming_brew_command(app, task_id, args).await
}

#[tauri::command]
pub async fn update_brew(app: AppHandle, task_id: String) -> Result<(), String> {
    let args = vec!["update".to_string()];
    run_streaming_brew_command(app, task_id, args).await
}
