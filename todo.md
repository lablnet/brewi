# Brewi - Feature Roadmap & TODO

This document tracks upcoming feature ideas, enhancements, and strategic improvements for future versions of **Brewi**.

---

## High-Priority Feature Ideas

### 1. Disk Storage & Package Analytics Dashboard
- **Interactive Visual Breakdown**: Chart visualizing disk space consumed by Formulae vs Casks.
- **Top Space Consumers**: Quick list of top 10 largest installed packages (e.g. Xcode CLI, Rust, LLVM, Node.js).

### 2. Brewfile Sync & GitHub Gist Integration
- **Cloud Backup**: 1-click export and sync of your `Brewfile` to a secret or public GitHub Gist.
- **Cross-Mac Migration**: Import a Gist URL on a new Mac to automatically provision your complete developer setup.

### 3. Background Service Crash & Health Notifications
- **Daemon Monitor**: Background watcher that detects when critical services (e.g., PostgreSQL, Redis, Nginx, MySQL) stop unexpectedly.
- **Native macOS Notifications**: Send native macOS desktop alerts when a service crashes or fails to start.
- **Auto-Restart Policies**: Option to automatically restart failed services.

### 4. Developer Stack Presets (1-Click Installer Profiles)
- **Curated Stacks**: Pre-configured package collections for different developer workflows:
  - **Full Stack Web**: Node.js, pnpm, PostgreSQL, Redis, Docker, VS Code, Postman.
  - **DevOps & Cloud**: Terraform, Docker, Kubernetes CLI (`kubectl`), Helm, AWS CLI, Vault.
  - **Data Science & AI**: Python, Conda, Jupyter, Ollama, PostgreSQL.
- **Custom Preset Creation**: Save and export custom stack presets to share with team members.

---

## nfrastructure & Testing Enhancements

- [ ] Add Playwright / WebdriverIO E2E user journey tests for Tauri UI.
- [ ] Add auto-update notifier using Tauri's updater plugin.
- [ ] Add dark / light mode auto-sync with macOS system preference.
