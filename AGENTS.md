# BudgetForFun Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-12-29

## Active Technologies

- (001-monthly-budget)

## Project Structure

```text
src/
tests/
```

## Commands

# Add commands for 

## Code Style

: Follow standard conventions

## Recent Changes

- 001-monthly-budget: Added
- 002: OpenAPI type coordination (tsoa, openapi-typescript, openapi-fetch)
- 003: Build system validation (sidecar setup, production build)

<!-- MANUAL ADDITIONS START -->
- Phase 2 Complete: End-to-end type coordination working
  - Backend types (api/src/types/index.ts)
  - tsoa controllers (api/src/controllers/*.ts)
  - OpenAPI spec generation (api/openapi/swagger.json)
  - Svelte types (src/types/api.ts)
  - Type-safe API client (src/lib/api/client.ts)
  - Smoke test validation (scripts/smoke-test.sh)

- Phase 3 Complete: Build system validation
  - Sidecar downloaded: Bun binary (57MB) for macOS ARM64
  - Sidecar configured: externalBin in tauri.conf.json
  - Rust sidecar command (start_bun_sidecar) implemented
  - Shell permissions (allow-execute, allow-spawn) added
  - Production build tested: Tauri binary 11MB (close to 10MB limit)
  - Hot reload tests created (test-reload.svelte, test-endpoint.ts)
  - Bundle size verified: Tauri app (11MB), Bun sidecar (57MB)
  - ⚠️  Bundle Size Issue: Bun sidecar NOT bundled in production (to stay under 10MB limit)
  - TODO: Document compression strategy or alternative bundling approach
<!-- MANUAL ADDITIONS END -->
