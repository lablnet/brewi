pub mod brew;
pub mod commands;

#[cfg(test)]
mod tests;

use commands::maintenance::*;
use commands::packages::*;
use commands::services::*;
use commands::system::*;
use commands::taps::*;
use commands::updates::*;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            #[cfg(target_os = "macos")]
            {
                use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial, NSVisualEffectState};
                if let Some(window) = app.get_webview_window("main") {
                    let _ = apply_vibrancy(
                        &window,
                        NSVisualEffectMaterial::Sidebar,
                        Some(NSVisualEffectState::Active),
                        Some(12.0),
                    );
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_installed_packages,
            get_package_details,
            get_installed_formula_versions,
            switch_formula_version,
            install_package,
            uninstall_package,
            pin_formula,
            search_brew,
            reveal_in_finder,
            get_services,
            manage_service,
            check_outdated,
            upgrade_packages,
            update_brew,
            run_doctor,
            get_cleanup_dry_run,
            run_cleanup,
            export_brewfile,
            save_brewfile_to_file,
            cancel_task,
            get_taps,
            add_tap,
            remove_tap,
            get_brew_environment,
            set_dock_badge,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
