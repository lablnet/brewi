# Brewi - Feature Reference Guide

**Brewi** is a modern macOS GUI application for Homebrew package management, system diagnostics, and disk hygiene.

---

## 🌟 Core Features

### 📦 1. Installed Package Manager
- **Formulae & Casks**: Browse installed CLI tools (`formulae`) and GUI applications (`casks`).
- **Interactive Search & Filter**: Filter by package type, outdated status, leaf status (packages without dependents), or pinned versions.
- **Package Details Modal**: View dependencies, reverse dependents tree, homepage, license, installation path, and disk usage.
- **Finder Integration**: Reveal installed package files in macOS Finder with 1 click.
- **Version Switching**: Switch between multiple installed versions of a formula.

### ⚡ 2. Pending Updates & Bulk Upgrades
- **Health Guard**: Automatic badge counter notifying you of pending Homebrew updates.
- **Bulk Upgrade**: Upgrade single packages or execute batch upgrades.
- **Version Pinning**: Pin specific versions to prevent automated updates.

### ⚙️ 3. Background Services Manager
- **Daemon Control**: Start, stop, and restart background services (PostgreSQL, Redis, Nginx, MySQL, etc.).
- **Status Badges**: Real-time status indicators (Started, Stopped, Error) with exit codes and plist paths.

### 🚰 4. Taps & Repositories
- **Tap Management**: Add custom third-party taps or untap repositories.
- **Popular Tap Suggestions**: Quick 1-click tap buttons for popular repositories (`cask-fonts`, `hashicorp/tap`, `supabase/tap`, `mongodb/brew`, etc.).

### 🩺 5. Brew Doctor & Health Diagnostics
- **Automated Diagnostics**: Run `brew doctor` checks directly from the UI.
- **Formatted Issue List**: Categorized warnings with actionable repair commands.

### 🧹 6. Disk Cleanup & Hygiene
- **Dry-Run Scan**: Preview outdated downloads, old Cellar versions, and cache items before deletion.
- **Storage Reclaim**: Reclaim megabytes/gigabytes of storage with 1-click disk cleanup.

### 📄 7. Brewfile Export & Setup Sharing
- **Configuration Dump**: Export your current Mac package setup to a standard `Brewfile`.
- **Save & Share**: Save to disk or copy to clipboard for quick provisioning on new Macs.

### 💻 8. Real-time Console Logs & Command Palette
- **Terminal Drawer**: Real-time streaming log output for all running Homebrew tasks with process cancellation.
- **Command Palette (`⌘K`)**: Keyboard-driven quick navigation and search.

### 🌐 9. Multi-Language (i18n) & Right-to-Left (RTL) Support
- **International Locales**: Out-of-the-box support for English (`en`), German (`de`), French (`fr`), Spanish (`es`), and Urdu (`ur`).
- **Native RTL Layout Engine**: Automatic bidirectional layout mirroring and Arabic/Urdu typography support (`Noto Nastaliq Urdu`).
- **Frosted Glass Language Selector**: Top titlebar dropdown with country flags, native language names, and persistent selection in `localStorage`.
- **Modular Translations**: Clean separate locale definition files under `src/i18n/locales/`.

### 🎨 10. High-Contrast Light & Dark Themes
- **Adaptive Visual Palette**: Dark mode for low-light environments and a high-contrast Light mode ensuring optimal badge and icon visibility.
- **Amber & Cask Color Accents**: Tailored contrast ratios across package lists, dependency trees, and action buttons.
