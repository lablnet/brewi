# Brewi - Developer Contribution Guide

Thank you for contributing to **Brewi**! Follow this guide to maintain high code quality, reusability, and test coverage.

---

## 🛠️ Development Setup

1. **Prerequisites**:
   - macOS (Apple Silicon or Intel)
   - Node.js `v20+` and `pnpm`
   - Rust toolchain (`rustc`, `cargo`)
   - Homebrew installed (`brew`)

2. **Installation**:
   ```bash
   pnpm install
   ```

3. **Development Server**:
   ```bash
   pnpm tauri dev
   ```

---

## 📐 Coding Standards & Guidelines

### Frontend (React & TypeScript)
- Use **Vanilla Tailwind CSS** classes for styling. Follow glassmorphism design tokens (`glass-card`, `glass-panel`).
- Do **not** duplicate helper functions. Import from `src/utils/formatters.ts`, `src/utils/constants.ts`, or `src/utils/ansi.ts`.
- Place new components into the appropriate category folder under `src/components/` (`common/`, `layout/`, `maintenance/`, `packages/`, `services/`, `taps/`, `updates/`).
- Every new component or hook **must** include matching unit tests in `src/tests/`.
- Do **not** call Tauri `invoke` or write async fetch/utility logic directly inside React components. Always encapsulate backend invocations and IPC calls inside dedicated custom hooks (e.g. `usePackages`, `useServices`, `useAutoHealth`) or utility wrapper functions.

### Backend (Rust & Tauri)
- Put core utility functions in `src-tauri/src/brew/utils.rs`.
- Ensure all command handlers in `src-tauri/src/commands/` return `Result<T, String>` for explicit error propagation to JavaScript.
- Avoid blocking the main event loop thread; use `tokio::spawn` or `tokio::select!` for process handling.
- Write unit tests in `src-tauri/src/tests/packages_tests.rs` for any new parser or business logic.

---

## 🧪 Verification Checklist

Before submitting a pull request, run all verification checks:

```bash
# 1. Run frontend unit tests
pnpm test

# 2. Run TypeScript typecheck
npx tsc --noEmit

# 3. Run backend Rust unit tests
pnpm test:rust

# 4. Verify production bundle build
pnpm build
```
