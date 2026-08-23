# Brewi - Architecture Overview

**Brewi** is built using a modern, lightweight hybrid desktop architecture combining **Tauri v2 (Rust)** for system interaction and process execution with **React 19 (TypeScript)** for a responsive macOS glassmorphism UI.

---

## 🏗️ System Architecture & Data Flow

```mermaid
graph TD
    subgraph Frontend ["React 19 Frontend"]
        UI["UI Layer (Sidebar, Titlebar, Views)"]
        Hooks["Custom Hooks (useBrew, usePackageDetails)"]
        Console["Terminal Drawer (Real-time Logs)"]
    end

    subgraph Tauri ["Tauri v2 Core (Rust)"]
        IPC["IPC Router (invoke / emit)"]
        Commands["Command Handlers (packages, services, maintenance)"]
        TaskManager["TaskManager (Broadcast & Cancel)"]
        Detector["Brew Detector (ARM64 vs Intel PATH)"]
        Utils["Brew Utils (format_bytes, json, ansi)"]
    end

    subgraph OS ["macOS Environment"]
        BrewCLI["Homebrew Binary (brew)"]
        SystemFS["macOS Cellar & Caskroom File System"]
    end

    UI -->|Triggers User Actions| Hooks
    Hooks -->|invoke| IPC
    IPC -->|Calls| Commands
    Commands -->|Detect Path| Detector
    Commands -->|Format & Parse| Utils
    Commands -->|Register Task| TaskManager
    TaskManager -->|tokio::process::Command| BrewCLI
    BrewCLI -->|Reads/Writes| SystemFS
    BrewCLI -->|Async stdout/stderr| TaskManager
    TaskManager -->|emit brew-stream| IPC
    IPC -->|Event Stream| Console
```

---

## 🔄 Task Execution & Real-Time Event Sequence

```mermaid
sequenceDiagram
    autonumber
    participant UI as React UI (TerminalDrawer)
    participant Hook as useBrew Hook
    participant IPC as Tauri IPC Channel
    participant Backend as Rust Backend (run_streaming_brew_command)
    participant TaskMgr as TaskManager
    participant CLI as macOS brew CLI

    UI->>Hook: User triggers "Install Wget"
    Hook->>IPC: invoke('install_package', { name: "wget", taskId: "task-1" })
    IPC->>Backend: Dispatch command handler
    Backend->>TaskMgr: register("task-1")
    Backend->>CLI: tokio::process::Command::spawn("brew", ["install", "wget"])
    
    loop Stream Output
        CLI-->>Backend: stdout / stderr line
        Backend-->>IPC: emit("brew-stream", { line, stream_type: "stdout" })
        IPC-->>UI: Append line to TerminalDrawer
    end

    alt Process Completion
        CLI-->>Backend: Exit code 0
        Backend->>TaskMgr: remove("task-1")
        Backend-->>IPC: emit("brew-stream", { status: "exit", success: true })
        IPC-->>Hook: Resolve invoke promise
    else User Cancels Task
        UI->>Hook: User clicks "Cancel"
        Hook->>IPC: invoke('cancel_task', { taskId: "task-1" })
        IPC->>TaskMgr: cancel("task-1")
        TaskMgr->>CLI: child.kill()
    end
```

---

## 📁 Directory Structure

```text
brewi/
├── .github/workflows/       # GitHub Actions CI/CD pipelines
│   └── test.yml             # Automated Vitest & Cargo test workflow
├── docs/                    # Architectural & project documentation
│   ├── ARCHITECTURE.md      # System overview & design patterns
│   ├── TESTING.md           # Test suite guide & commands
│   ├── CONTRIBUTING.md      # Developer guidelines & coding standards
│   └── FEATURES.md          # Detailed feature catalog
├── src/                     # React 19 Frontend
│   ├── components/          # Categorized UI components
│   │   ├── common/          # Toast, Spinner, ConfirmModal, EmptyState, etc.
│   │   ├── layout/          # Sidebar, Titlebar, TerminalDrawer
│   │   ├── maintenance/     # DoctorView, CleanupView, BrewfileView
│   │   ├── packages/        # PackageList, PackageCard, PackageRow, Modals
│   │   ├── services/        # ServicesView
│   │   ├── taps/            # TapsView
│   │   └── updates/         # UpdatesView
│   ├── hooks/               # Custom React hooks (useBrew, usePackageDetails, etc.)
│   ├── tests/               # Vitest component, hook, and utility tests
│   ├── types/               # TypeScript interfaces & types
│   ├── utils/               # Shared formatters, constants, and ANSI parser
│   └── App.tsx              # Root workspace component
└── src-tauri/               # Tauri v2 Rust Backend
    └── src/
        ├── brew/            # Core Homebrew wrappers
        │   ├── cli.rs       # Streaming process execution & TaskManager
        │   ├── detector.rs  # Homebrew binary & macOS environment detection
        │   ├── models.rs    # Rust structs for JSON serialization
        │   └── utils.rs     # Shared Rust byte formatting & size utilities
        ├── commands/        # Tauri command handlers
        │   ├── maintenance.rs
        │   ├── packages.rs
        │   ├── services.rs
        │   ├── system.rs
        │   └── taps.rs
        └── tests/           # Cargo unit test suite
```

---

## ⚡ IPC Communication & Async Streaming

1. **Commands (`invoke`)**:
   - The frontend calls Tauri IPC commands via `invoke<T>('command_name', { args })`.
   - Backend functions execute asynchronously using `tokio` threads to prevent UI locking.

2. **Event Streaming (`emit` / `listen`)**:
   - Long-running commands (e.g. `brew install`, `brew cleanup`, `brew upgrade`) use `run_streaming_brew_command`.
   - Output lines are emitted in real-time over the `"brew-stream"` event channel to populate the `TerminalDrawer` console log.

3. **Cancellation (`TaskManager`)**:
   - Each streaming command registers a `task_id` with `TaskManager`.
   - Users can cancel running processes instantly by invoking `cancel_task(task_id)`, sending a termination signal to the child process.
