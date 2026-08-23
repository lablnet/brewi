use tauri::AppHandle;
use crate::brew::cli::{run_brew_command_capture, run_streaming_brew_command};
use crate::brew::models::{BrewTap, RawTapInfo};

#[tauri::command]
pub async fn get_taps() -> Result<Vec<BrewTap>, String> {
    let raw = run_brew_command_capture(&["tap-info", "--json=v1", "--installed"]).await;

    if let Ok(raw_str) = raw {
        if let Some(start) = raw_str.find('[') {
            if let Some(end) = raw_str.rfind(']') {
                let slice = &raw_str[start..=end];
                if let Ok(parsed) = serde_json::from_str::<Vec<RawTapInfo>>(slice) {
                    let taps = parsed
                        .into_iter()
                        .map(|t| BrewTap {
                            name: t.name,
                            user: t.user,
                            repo: t.repo,
                            path: t.path,
                            official: t.official.unwrap_or(false),
                            formula_count: t.formula_names.map(|f| f.len()).unwrap_or(0),
                            cask_count: t.cask_tokens.map(|c| c.len()).unwrap_or(0),
                            remote: t.remote,
                        })
                        .collect();
                    return Ok(taps);
                }
            }
        }
    }

    // Fallback: simple `brew tap`
    let plain = run_brew_command_capture(&["tap"]).await.unwrap_or_default();
    let taps = plain
        .lines()
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
        .collect();

    Ok(taps)
}

#[tauri::command]
pub async fn add_tap(
    app: AppHandle,
    tap_name: String,
    task_id: String,
) -> Result<(), String> {
    let args = vec!["tap".to_string(), tap_name];
    run_streaming_brew_command(app, task_id, args).await
}

#[tauri::command]
pub async fn remove_tap(
    app: AppHandle,
    tap_name: String,
    task_id: String,
) -> Result<(), String> {
    let args = vec!["untap".to_string(), tap_name];
    run_streaming_brew_command(app, task_id, args).await
}
