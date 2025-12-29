# Implementation Plan: Monthly Budget Tracker

**Branch**: `001-monthly-budget` | **Date**: 2025-12-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-monthly-budget/spec.md`

## Summary

This feature implements a local-first desktop budgeting application focused on monthly bills, income tracking, and calculating "leftover at end of month." Users can set up recurring bills and incomes with different billing periods (monthly, bi-weekly, weekly, semi-annually), track variable and free-flowing expenses, manage multiple payment sources (bank accounts, credit cards, cash), and view their budget month-by-month.

**Key Features**:
- First-time setup page for onboarding and ongoing entity management
- Monthly bills with configurable billing periods and payment sources
- Income sources with configurable billing periods and payment sources
- Variable expenses and free-flowing expenses
- Payment source management (bank accounts, credit cards, cash)
- "Leftover" calculation: (sum of all bank balances + cash - credit card debt) + total income - total expenses
- Month generation from defaults with flexible editing (medium coupling)
- Undo functionality (previous 5 changes)
- Data export/import for user-owned cloud backups (line-by-line restore)
- Pre-defined bill categories (8 categories) with custom category support

**Technical Approach**:
Desktop application using Tauri (Rust) for native shell, Svelte for frontend UI, and Bun (TypeScript) for HTTP backend over localhost IPC. All data persisted locally as JSON files. No external cloud sync - users backup to their own cloud drives (Google Drive, iCloud, Dropbox).

---

## Technical Context

**Language/Version**:
- Frontend: TypeScript (via Svelte, Vite compiles to vanilla JS)
- Backend: TypeScript (via Bun runtime, native TypeScript support)
- Desktop Shell: Rust (Tauri framework)

**Primary Dependencies**:
- Bun: Runtime for backend HTTP server (bun.serve()) and test runner
- Svelte: Frontend framework for reactive UI components
- Vite: Build tool for Svelte (blazing fast, no build step in dev)
- Tauri: Desktop application shell (native WebView, IPC, single executable bundling)
- No external UI component libraries (build custom or use lightweight CSS)
- No external state management (use Svelte stores, not Redux/Pinia)

**Storage**:
- Local JSON files (no database)
- One file per month: `data/months/YYYY-MM.json`
- Entity definitions: `data/entities/bills.json`, `data/entities/incomes.json`, `data/entities/payment-sources.json`
- Payment sources: `data/entities/payment-sources.json`
- Backup/export: User-initiated JSON export for manual cloud sync
- Automatic file writes are silent (backend transparency principle)

**Testing**:
- Bun test runner for backend
- Frontend testing: Bun test runner or browser-based testing for Svelte components
- Test-first development (NON-NEGOTIABLE per constitution)

**Target Platform**:
- Desktop: macOS, Windows, Linux
- Single executable bundle (<10MB total)
- Frontend bundle: <100KB gzipped (including CSS)

**Project Type**:
- Desktop application (Tauri + Svelte + Bun)
- Single-user local app (no cloud sync, no multi-user support)

**Performance Goals**:
- Core user flows (add bill, edit expense, view summary) complete within 2 seconds
- "Leftover" calculation updates in real-time as user makes changes (<1 second)
- Month generation populates with defaults within 2 seconds
- UI remains responsive with typical budget data (thousands of transactions)

**Constraints**:
- Bundle size: <10MB total (Tauri executable)
- Frontend bundle: <100KB gzipped
- No containers (Docker/Kubernetes) per constitution
- No external cloud sync (user-owned backups only)
- No external UI frameworks (no React, Vue, Material-UI, Tailwind, Bootstrap)
- No external state management (Redux, Pinia, MobX) - use Svelte stores only
- Monthly bills and incomes can have different billing periods (monthly, bi-weekly, weekly, semi-annually)
- Multiple payment sources supported (bank accounts, credit cards, cash)

**Scale/Scope**:
- 1 user per installation (single-user local app)
- Thousands of transactions per month without UI lag
- Unlimited bills, incomes, and payment sources
- Unlimited months (historical data)
- 11 user stories (P1: onboarding, bills, income, surplus calculation; P2: variable expenses, payment sources, month generation, categories, undo, free-flowing; P3: restore)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle Compliance

**I. User-Centric Simplicity** ✅
- Feature focuses on a single clear question: "how much money do I have left?"
- Simple onboarding page for quick setup (<5 minutes)
- Primary interface allows direct value entry without modals (FR-026 removed "generally")

**II. Test-First Development (NON-NEGOTIABLE)** ✅
- Test runner: Bun for backend
- Frontend testing strategy will be defined in tasks phase
- TDD mandatory per constitution

**III. Incremental Delivery** ✅
- 11 user stories prioritized P1, P2, P3
- Each story independently testable and deliverable
- Month isolation allows independent delivery

**IV. Specification Before Implementation** ✅
- Spec is complete, technology-agnostic, with measurable success criteria
- All [NEEDS CLARIFICATION] markers resolved
- Spec approved before planning (current phase)

**V. Observability & Debuggability** ✅
- FR-042: "System MUST make it clear which values are calculated and which are to be filled in"
- Backend: No user-facing terminal/logs (backend transparency)
- User-facing errors: Human-readable with actionable next steps

**VI. Build and Run Locality** ✅
- Tauri: Desktop shell compiling to single binary (<10MB)
- Svelte: Compiles to vanilla JS (no runtime dependency)
- No containers used

**VII. Portability and Compatibility** ✅
- macOS, Windows, Linux support via Tauri
- Compatible with wide range of hardware

**VIII. Local File Storage** ✅
- JSON file storage (no database)
- User-owned backups via export/import (FR-036, FR-037)
- Automatic JSON writes are silent (backend transparency)

**IX. More than Just a Spreadsheet** ✅
- "Leftover" calculation provides value beyond simple spreadsheet
- Month-by-month breakdown provides insights
- Flexible editing beyond static spreadsheet rows

**X. Avoid Silly Libraries** ✅
- No external UI component libraries (principle XXIV)
- No external state management (principle XXI)
- Bun for HTTP server (principle XVI) instead of heavy frameworks

**XI. Makefiles for Automation** ✅
- Will be defined in tasks phase
- Build, dev, test, lint, format, clean targets

**XII. User Documentation Conciseness** ✅
- Spec uses plain language, focused on user value
- Documentation requirements included in spec

**XIII. User Interface Consistency** ✅
- Consistent month navigation (top left: year, side-by-side: month)
- Consistent summary layout across months

**XIV. API Documentation** ✅
- IPC communication via localhost HTTP (no external APIs)
- OpenAPI spec will be used for API documentation if needed
- Auto-generated documentation (no AI LLM)

**XV. No Containers** ✅
- No Docker or Kubernetes
- Local execution only

**XVI. Bun Backend** ✅
- Bun runtime with native TypeScript support
- bun.serve() for HTTP server
- localhost:3000 for IPC only
- No build step (full TypeScript type safety)

**XVII. Backend Transparency** ✅
- No user-facing terminal or server logs
- Automatic and invisible data flow
- User interacts only through Tauri desktop interface

**XVIII. Tauri Desktop Shell** ✅
- Framework: Tauri + Svelte
- Native WebView (no bundled Chromium)
- IPC: Communicates with Bun backend over localhost HTTP
- Bundling: Single executable, <10MB total
- OS Support: macOS, Windows, Linux

**XIX. SvelteKit Frontend** ✅
- Framework: Svelte (not React, Vue, or vanilla JS)
- Build tool: Vite (Svelte default)
- Compilation: To vanilla JS (no runtime dependency)
- Bundle size: Target <100KB gzipped (including CSS)
- No external UI framework dependencies

**XX. Component Structure** ✅
- One concern per component (BudgetForm, TransactionList, CategorySelector)
- Props for data input, events for data output
- Reactive declarations ($:) for derived state
- Store integration (Svelte stores) for global UI state only

**XXI. Reactive Declarations Over State Management** ✅
- Local component state (let variables) for UI-only state
- Svelte stores (writable, readable) for cross-component state
- NO Redux, Pinia, or external state libraries
- NO useState-style hooks

**XXII. Code Organization and Documentation** ✅
- Organize code into logical sections (components, stores, utils)
- Document each component, store, and utility function
- Use JSDoc or TypeScript comments

**XXIII. Styling via Scoped CSS Only** ✅
- Scoped styles in <style> blocks
- CSS variables for theming (root component)
- Mobile-first responsive design (media queries)
- NO Tailwind, Bootstrap, or utility CSS frameworks

**XXIV. No External UI Component Libraries** ✅
- Use semantic HTML (<button>, <input>, <form>, <select>)
- Style with scoped CSS
- NO Material-UI, shadcn/ui, Headless UI
- Build custom inputs, buttons, modals, lists

**XXV. Tauri IPC Integration** ✅
- Import @tauri-apps/api for native functionality
- Use tauri.invoke() for backend IPC
- Handle window lifecycle (minimize, maximize, close events)
- Error handling for Tauri-specific failures
- File system access through Tauri (not Node.js fs module)

**XXVI. AI-Readable Code Structure** ✅
- Single responsibility per component
- Descriptive variable names (no single letters except loops)
- Comments above complex logic (especially fetch/async)
- Explicit event bindings (on:click, on:submit, bind:value)
- No clever destructuring or advanced JS patterns
- Readable JSDoc comments on component props

### Gates: All Pass ✅

All 26 core principles are aligned with this feature. No constitution violations identified. Proceeding to Phase 0: Outline & Research.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-monthly-budget/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── setup-page-contract.md
│   ├── dashboard-contract.md
│   ├── month-view-contract.md
│   ├── bills-contract.md
│   ├── incomes-contract.md
│   ├── payment-sources-contract.md
│   ├── variable-expenses-contract.md
│   └── free-flowing-expenses-contract.md
├── checklists/
│   ├── requirements.md  # Spec validation checklist
│   └── implementation.md  # Implementation checklist (future)
└── spec.md              # Feature specification
```

### Source Code (repository root)

```text
# Tauri Desktop Application Structure (Option 3 modified for BudgetForFun)
src-tauri/             # Rust backend for Tauri (desktop shell)
├── src/
│   ├── main.rs         # Tauri entry point, IPC handlers
│   ├── commands.rs      # Tauri command handlers (file access, window management)
│   ├── models.rs        # Rust data models (if needed for file I/O)
│   └── utils.rs         # Shared Rust utilities
├── Cargo.toml           # Rust dependencies
├── tauri.conf.json      # Tauri configuration
└── icons/               # App icons for different platforms

api/                    # Bun HTTP backend for IPC (internal communication)
├── src/
│   ├── models/         # TypeScript data models (Bill, Income, PaymentSource, etc.)
│   ├── services/       # Business logic, data persistence, "leftover" calculation
│   ├── routes/         # HTTP endpoints (bun.serve() route handlers)
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Shared utilities (formatters, validators)
├── tests/
│   ├── contract/       # Contract tests for API endpoints
│   ├── integration/    # Integration tests (data persistence, calculation logic)
│   └── unit/           # Unit tests (models, services, utils)
├── package.json          # Bun dependencies
└── server.ts            # Bun server entry point (bun.serve())

src/                     # Svelte frontend
├── components/
│   ├── Setup/         # Setup page components
│   ├── Dashboard/      # Dashboard/summary view components
│   ├── Bills/          # Bill management components
│   ├── Incomes/        # Income source management components
│   ├── PaymentSources/ # Payment source management components
│   ├── Expenses/       # Variable and free-flowing expense components
│   └── shared/         # Shared components (forms, inputs, modals)
├── stores/             # Svelte stores for global state
│   ├── bills.ts       # Bills store (default definitions, instances)
│   ├── incomes.ts      # Incomes store (default definitions, instances)
│   ├── payment-sources.ts  # Payment sources store
│   ├── expenses.ts     # Variable and free-flowing expenses store
│   ├── undo.ts         # Undo stack (previous 5 changes)
│   └── ui.ts          # UI state (current month, navigation)
├── routes/             # Svelte routes (if using SvelteKit style routing)
│   └── +layout.svelte  # Root layout
├── app.html             # HTML entry point
├── vite.config.ts       # Vite configuration for Svelte
├── tsconfig.json        # TypeScript configuration
└── package.json          # Frontend dependencies (Svelte, Vite)

data/                    # Data storage (local JSON files)
├── entities/
│   ├── bills.json       # Default bill definitions
│   ├── incomes.json      # Default income definitions
│   ├── payment-sources.json  # Payment sources configuration
│   └── categories.json   # Bill categories
└── months/
    └── YYYY-MM.json     # Monthly budget data (isolated per month)

tests/                   # Frontend tests
├── contract/           # Contract tests for Bun backend
├── integration/        # Integration tests (full user flows)
└── unit/               # Unit tests (components, stores, utils)

Makefile                   # Build automation
README.md                  # Project documentation
.gitignore                  # Git ignore rules
```

**Structure Decision**: Tauri + Svelte + Bun desktop application. src-tauri/ for Rust desktop shell (window management, file access, IPC), api/ for Bun HTTP backend (business logic, data persistence), src/ for Svelte frontend UI. Data stored locally as JSON files in data/ directory. This structure aligns with constitution principles XVI-XVIII and provides clear separation of concerns.

---

## Complexity Tracking

> **No constitution violations - this section is not required**

All 26 core principles are aligned with the feature specification. No violations identified that require justification.
