use std::collections::HashMap;
use std::process::Stdio;
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Emitter};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command;
use tokio::sync::broadcast;
use crate::brew::detector::find_brew_binary;
use crate::brew::models::StreamEventPayload;

pub struct TaskManager {
    cancel_senders: Mutex<HashMap<String, broadcast::Sender<()>>>,
}

impl TaskManager {
    pub fn new() -> Self {
        Self {
            cancel_senders: Mutex::new(HashMap::new()),
        }
    }

    pub fn register(&self, task_id: &str) -> broadcast::Receiver<()> {
        let mut map = self.cancel_senders.lock().unwrap();
        let (tx, rx) = broadcast::channel(1);
        map.insert(task_id.to_string(), tx);
        rx
    }

    pub fn cancel(&self, task_id: &str) -> bool {
        let mut map = self.cancel_senders.lock().unwrap();
        if let Some(tx) = map.remove(task_id) {
            let _ = tx.send(());
            true
        } else {
            false
        }
    }

    pub fn remove(&self, task_id: &str) {
        let mut map = self.cancel_senders.lock().unwrap();
        map.remove(task_id);
    }
}

pub static TASK_MANAGER: std::sync::LazyLock<Arc<TaskManager>> =
    std::sync::LazyLock::new(|| Arc::new(TaskManager::new()));

pub async fn run_brew_command_capture(args: &[&str]) -> Result<String, String> {
    let brew_bin = find_brew_binary();
    let mut cmd = Command::new(&brew_bin);
    cmd.args(args);
    cmd.env("HOMEBREW_NO_AUTO_UPDATE", "1");
    cmd.env("HOMEBREW_NO_ENV_HINTS", "1");
    cmd.env("HOMEBREW_COLOR", "0");
    cmd.env("HOMEBREW_NO_COLOR", "1");
    cmd.stdout(Stdio::piped());
    cmd.stderr(Stdio::piped());

    let output = cmd
        .output()
        .await
        .map_err(|e| format!("Failed to run brew {:?}: {}", args, e))?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();

    if output.status.success() || !stdout.is_empty() {
        Ok(stdout)
    } else {
        Err(if !stderr.is_empty() { stderr } else { format!("Brew command failed with exit code: {:?}", output.status.code()) })
    }
}

pub async fn run_brew_command_capture_all(args: &[&str]) -> String {
    let brew_bin = find_brew_binary();
    let mut cmd = Command::new(&brew_bin);
    cmd.args(args);
    cmd.env("HOMEBREW_NO_AUTO_UPDATE", "1");
    cmd.env("HOMEBREW_NO_ENV_HINTS", "1");
    cmd.env("HOMEBREW_COLOR", "0");
    cmd.env("HOMEBREW_NO_COLOR", "1");
    cmd.stdout(Stdio::piped());
    cmd.stderr(Stdio::piped());

    if let Ok(output) = cmd.output().await {
        let stdout = String::from_utf8_lossy(&output.stdout).to_string();
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();
        format!("{}\n{}", stdout, stderr)
    } else {
        String::new()
    }
}

pub async fn run_streaming_brew_command(
    app: AppHandle,
    task_id: String,
    args: Vec<String>,
) -> Result<(), String> {
    let brew_bin = find_brew_binary();
    let mut cancel_rx = TASK_MANAGER.register(&task_id);

    let _ = app.emit(
        "brew-stream",
        StreamEventPayload {
            task_id: task_id.clone(),
            line: format!("🚀 Executing: brew {}", args.join(" ")),
            stream_type: "start".to_string(),
            exit_code: None,
            success: None,
        },
    );

    let mut cmd = Command::new(&brew_bin);
    cmd.args(&args);
    cmd.env("HOMEBREW_NO_AUTO_UPDATE", "1");
    cmd.env("HOMEBREW_NO_ENV_HINTS", "1");
    cmd.env("HOMEBREW_COLOR", "0");
    cmd.env("HOMEBREW_NO_COLOR", "1");
    cmd.stdout(Stdio::piped());
    cmd.stderr(Stdio::piped());

    let mut child = cmd
        .spawn()
        .map_err(|e| format!("Failed to spawn brew: {}", e))?;

    let stdout = child.stdout.take();
    let stderr = child.stderr.take();

    let app_stdout = app.clone();
    let task_id_stdout = task_id.clone();
    let stdout_handle = tokio::spawn(async move {
        if let Some(stdout) = stdout {
            let mut reader = BufReader::new(stdout).lines();
            while let Ok(Some(line)) = reader.next_line().await {
                let _ = app_stdout.emit(
                    "brew-stream",
                    StreamEventPayload {
                        task_id: task_id_stdout.clone(),
                        line,
                        stream_type: "stdout".to_string(),
                        exit_code: None,
                        success: None,
                    },
                );
            }
        }
    });

    let app_stderr = app.clone();
    let task_id_stderr = task_id.clone();
    let stderr_handle = tokio::spawn(async move {
        if let Some(stderr) = stderr {
            let mut reader = BufReader::new(stderr).lines();
            while let Ok(Some(line)) = reader.next_line().await {
                let _ = app_stderr.emit(
                    "brew-stream",
                    StreamEventPayload {
                        task_id: task_id_stderr.clone(),
                        line,
                        stream_type: "stderr".to_string(),
                        exit_code: None,
                        success: None,
                    },
                );
            }
        }
    });

    tokio::select! {
        _ = cancel_rx.recv() => {
            let _ = child.kill().await;
            let _ = app.emit(
                "brew-stream",
                StreamEventPayload {
                    task_id: task_id.clone(),
                    line: "==> Process cancelled by user.".to_string(),
                    stream_type: "stderr".to_string(),
                    exit_code: Some(-1),
                    success: Some(false),
                },
            );
            TASK_MANAGER.remove(&task_id);
            return Err("Cancelled by user".to_string());
        }
        res = child.wait() => {
            let _ = stdout_handle.await;
            let _ = stderr_handle.await;
            TASK_MANAGER.remove(&task_id);

            match res {
                Ok(status) => {
                    let success = status.success();
                    let code = status.code().unwrap_or(if success { 0 } else { 1 });
                    let _ = app.emit(
                        "brew-stream",
                        StreamEventPayload {
                            task_id: task_id.clone(),
                            line: if success {
                                "==> Command completed successfully.".to_string()
                            } else {
                                format!("==> Command exited with code {}", code)
                            },
                            stream_type: "exit".to_string(),
                            exit_code: Some(code),
                            success: Some(success),
                        },
                    );
                    if success {
                        Ok(())
                    } else {
                        Err(format!("Command failed with code {}", code))
                    }
                }
                Err(e) => {
                    let _ = app.emit(
                        "brew-stream",
                        StreamEventPayload {
                            task_id: task_id.clone(),
                            line: format!("==> Error waiting for child process: {}", e),
                            stream_type: "exit".to_string(),
                            exit_code: Some(1),
                            success: Some(false),
                        },
                    );
                    Err(e.to_string())
                }
            }
        }
    }
}
