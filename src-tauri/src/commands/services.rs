use tauri::AppHandle;
use crate::brew::cli::{run_brew_command_capture, run_streaming_brew_command};
use crate::brew::models::BrewService;

#[tauri::command]
pub async fn get_services() -> Result<Vec<BrewService>, String> {
    let raw = run_brew_command_capture(&["services", "list", "--json"]).await?;
    
    // Find json array start
    if let Some(start) = raw.find('[') {
        if let Some(end) = raw.rfind(']') {
            let slice = &raw[start..=end];
            let services: Vec<BrewService> = serde_json::from_str(slice)
                .map_err(|e| format!("Failed to parse services JSON: {}", e))?;
            return Ok(services);
        }
    }

    // Fallback: parse plain text if JSON is unavailable
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

    Ok(list)
}

#[tauri::command]
pub async fn manage_service(
    app: AppHandle,
    name: String,
    action: String,
    task_id: String,
) -> Result<(), String> {
    let valid_actions = ["start", "stop", "restart", "run"];
    if !valid_actions.contains(&action.as_str()) {
        return Err(format!("Invalid service action: {}", action));
    }

    let args = vec!["services".to_string(), action, name];
    run_streaming_brew_command(app, task_id, args).await
}
