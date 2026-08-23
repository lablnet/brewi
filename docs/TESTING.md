# Brewi - Testing Strategy & Documentation

Brewi enforces comprehensive unit test coverage across both the **React Frontend** and **Rust Backend**.

---

## 🧪 Test Suite Overview

- **Frontend Tests**: Vitest + React Testing Library (27 test files, 121 unit tests).
- **Backend Tests**: Cargo test suite (52 unit tests).
- **CI/CD Integration**: Automated execution via GitHub Actions on every push & pull request.

---

## 🚀 Running Tests Locally

### 1. Frontend Unit Tests (Vitest)

Run the full frontend test suite:
```bash
pnpm test
```

Run tests in watch mode during development:
```bash
pnpm test:watch
```

Generate test coverage report:
```bash
pnpm test:coverage
```

Check TypeScript types without emitting code:
```bash
npx tsc --noEmit
```

### 2. Backend Unit Tests (Cargo)

Run the Rust test suite:
```bash
pnpm test:rust
# Or manually:
cd src-tauri && cargo test --lib
```

---

## 🔬 Test Principles & Design

1. **Isolation & Safety**:
   - Backend Rust unit tests use isolated `TempDir` filesystems and sample output strings.
   - Tests do **NOT** run live, mutating `brew` CLI commands on your local machine, keeping execution fast (<0.1s) and safe.

2. **Subfolder Test Mirroring**:
   - Component test files in `src/tests/components/` mirror the exact subfolder structure of `src/components/`.

3. **React Act & Async Handling**:
   - State updates in hooks use `waitFor(() => expect(...))` or `act(async () => ...)` to ensure clean asynchronous state resolution without warnings.
