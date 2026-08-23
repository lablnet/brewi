use std::path::{Path, PathBuf};
use std::process::Command;
use crate::brew::models::BrewEnvInfo;

pub fn find_brew_binary() -> PathBuf {
    // 1. Standard Apple Silicon location
    let apple_silicon = Path::new("/opt/homebrew/bin/brew");
    if apple_silicon.exists() {
        return apple_silicon.to_path_buf();
    }

    // 2. Standard Intel Mac location
    let intel = Path::new("/usr/local/bin/brew");
    if intel.exists() {
        return intel.to_path_buf();
    }

    // 3. User local install location
    if let Ok(home) = std::env::var("HOME") {
        let user_brew = Path::new(&home).join(".linuxbrew/bin/brew");
        if user_brew.exists() {
            return user_brew;
        }
        let user_homebrew = Path::new(&home).join("homebrew/bin/brew");
        if user_homebrew.exists() {
            return user_homebrew;
        }
    }

    // 4. PATH lookup
    if let Ok(output) = Command::new("which").arg("brew").output() {
        if output.status.success() {
            let path_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if !path_str.is_empty() {
                return PathBuf::from(path_str);
            }
        }
    }

    // Fallback default
    PathBuf::from("brew")
}

pub fn get_environment_info() -> BrewEnvInfo {
    let brew_bin = find_brew_binary();
    let brew_path = brew_bin.to_string_lossy().to_string();

    let brew_version = Command::new(&brew_bin)
        .arg("--version")
        .env("HOMEBREW_NO_AUTO_UPDATE", "1")
        .output()
        .map(|o| {
            let text = String::from_utf8_lossy(&o.stdout);
            text.lines().next().unwrap_or("Homebrew").to_string()
        })
        .unwrap_or_else(|_| "Homebrew".to_string());

    let prefix = Command::new(&brew_bin)
        .arg("--prefix")
        .env("HOMEBREW_NO_AUTO_UPDATE", "1")
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_else(|_| if brew_path.starts_with("/opt/homebrew") { "/opt/homebrew".to_string() } else { "/usr/local".to_string() });

    let cellar = Command::new(&brew_bin)
        .arg("--cellar")
        .env("HOMEBREW_NO_AUTO_UPDATE", "1")
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_else(|_| format!("{}/Cellar", prefix));

    let caskroom = Command::new(&brew_bin)
        .arg("--caskroom")
        .env("HOMEBREW_NO_AUTO_UPDATE", "1")
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_else(|_| format!("{}/Caskroom", prefix));

    let arch = std::env::consts::ARCH.to_string();

    let os_version = Command::new("sw_vers")
        .arg("-productVersion")
        .output()
        .map(|o| format!("macOS {}", String::from_utf8_lossy(&o.stdout).trim()))
        .unwrap_or_else(|_| "macOS".to_string());

    let is_brew_installed = brew_bin.exists() || Command::new("which").arg("brew").output().map(|o| o.status.success()).unwrap_or(false);

    BrewEnvInfo {
        brew_path,
        brew_version,
        prefix,
        cellar,
        caskroom,
        arch,
        os_version,
        is_brew_installed,
    }
}
