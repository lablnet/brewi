import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';

// ─── Mock @tauri-apps/api/core ────────────────────────────────────────────────
// Tauri's `invoke` is a bridge to the native Rust backend. In tests we replace
// it with a vi.fn() so we can assert what was called and control return values.
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

// ─── Mock @tauri-apps/api/event ───────────────────────────────────────────────
// `listen` is used to receive streamed events from Rust. We stub it so tests
// don't need a running Tauri context.
vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn().mockResolvedValue(() => {}),
}));

// ─── Silence expected console noise in tests ─────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
});
