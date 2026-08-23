use std::fs;
use std::path::Path;

/// Formats a byte count into a human-readable string (B, KB, MB, GB, TB).
pub fn format_bytes(bytes: u64) -> String {
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
    if idx == 0 {
        format!("{} B", bytes)
    } else {
        format!("{:.1} {}", size, UNITS[idx])
    }
}

/// Recursively computes the total size of files inside a directory in bytes.
pub fn get_dir_size<P: AsRef<Path>>(path: P) -> u64 {
    let mut total = 0;
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

/// Extracts a JSON object slice from a string containing possible CLI noise.
pub fn extract_json_str(raw: &str) -> &str {
    if let Some(start) = raw.find('{') {
        if let Some(end) = raw.rfind('}') {
            if end >= start {
                return &raw[start..=end];
            }
        }
    }
    raw.trim()
}

/// Strips ANSI color/control codes from CLI output strings.
pub fn strip_ansi(raw: &str) -> String {
    let ansi_re = regex::Regex::new(r"\x1B\[[0-9;]*[a-zA-Z]").ok();
    if let Some(re) = ansi_re {
        re.replace_all(raw, "").to_string()
    } else {
        raw.to_string()
    }
}
