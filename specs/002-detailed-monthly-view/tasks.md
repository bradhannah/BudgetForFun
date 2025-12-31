# Tasks: Detailed Monthly View

**Input**: Design documents from `/specs/002-detailed-monthly-view/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested - tests are OPTIONAL. Manual testing via curl + UI as per plan.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `api/src/` (Bun HTTP server)
- **Frontend**: `src/` (Svelte + SvelteKit)
- **Data**: `data/entities/`, `data/months/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Type extensions and basic project structure for new feature

- [ ] T001 [P] Extend Category type with sort_order, color, type fields in `api/src/types/index.ts`
- [ ] T002 [P] Extend Bill type with due_day field in `api/src/types/index.ts`
- [ ] T003 [P] Extend Income type with due_day, category_id fields in `api/src/types/index.ts`
- [ ] T004 [P] Add Payment interface (id, amount, date, created_at) in `api/src/types/index.ts`
- [ ] T005 [P] Extend BillInstance with expected_amount, actual_amount, payments[], is_adhoc, due_date, name, category_id, payment_source_id in `api/src/types/index.ts`
- [ ] T006 [P] Extend IncomeInstance with expected_amount, actual_amount, is_adhoc, due_date, name, category_id, payment_source_id in `api/src/types/index.ts`
- [ ] T007 [P] Add CategoryType, SectionTally, DetailedMonthResponse types in `api/src/types/index.ts`
- [ ] T008 Create migration utility functions (migrateBillInstance, migrateCategory) in `api/src/utils/migration.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 Update categories-service.ts to handle new fields (sort_order, color, type) with migration on load in `api/src/services/categories-service.ts`
- [ ] T010 [P] Update validation.ts to validate new Category fields (sort_order >= 0, hex color, type enum) in `api/src/services/validation.ts`
- [ ] T011 [P] Update validation.ts to validate due_day (1-31) for Bill/Income in `api/src/services/validation.ts`
- [ ] T012 Update months-service.ts to apply BillInstance/IncomeInstance migration on load in `api/src/services/months-service.ts`
- [ ] T013 [P] Add default income categories (Salary, Freelance, Investment, Government, Other, Ad-hoc) to seed data in `api/src/routes/handlers/seed.handlers.ts`
- [ ] T014 [P] Update existing bill categories with sort_order and color defaults in `api/src/routes/handlers/seed.handlers.ts`
- [ ] T015 Create calculation utilities (calculateDueDate, isOverdue, getDaysOverdue) in `api/src/utils/due-date.ts`
- [ ] T016 [P] Create calculation utilities (calculateBillsTally, calculateIncomeTally) in `api/src/utils/tally.ts`
- [ ] T017 [P] Create calculation utility (calculateLeftover using actuals only) in `api/src/utils/leftover.ts`
- [ ] T018 Regenerate OpenAPI spec and frontend types: run `cd api && bun run generate-openapi` and `npm run generate:types`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View Monthly Bills by Category (Priority: P1)

**Goal**: Display bills and expenses grouped by category with Expected/Actual columns and section tallies

**Independent Test**: Navigate to `/month/2025-01`, verify bills appear grouped by category with colored headers, Expected/Actual columns, and correct tallies at bottom

### Backend Implementation

- [ ] T019 [US1] Create GET /api/months/:month/detailed endpoint handler in `api/src/routes/handlers/detailed-view.handlers.ts`
- [ ] T020 [US1] Implement detailed-view-service.ts with getDetailedMonth() that groups by category in `api/src/services/detailed-view-service.ts`
- [ ] T021 [US1] Register /api/months/detailed route in `api/src/routes/index.ts`
- [ ] T022 [US1] Test endpoint with curl: `curl http://localhost:3000/api/months/2025-01/detailed`

### Frontend Implementation

- [ ] T023 [P] [US1] Create DetailedMonthView.svelte main container in `src/components/DetailedView/DetailedMonthView.svelte`
- [ ] T024 [P] [US1] Create CategorySection.svelte (category header with color + item list) in `src/components/DetailedView/CategorySection.svelte`
- [ ] T025 [P] [US1] Create BillRow.svelte (single bill row with Expected/Actual columns) in `src/components/DetailedView/BillRow.svelte`
- [ ] T026 [P] [US1] Create SectionTally.svelte (Expected/Actual/Remaining totals) in `src/components/DetailedView/SectionTally.svelte`
- [ ] T027 [US1] Create /month/[month] route page in `src/routes/month/[month]/+page.svelte`
- [ ] T028 [US1] Create detailed-month store for aggregated view data in `src/stores/detailed-month.ts`
- [ ] T029 [US1] Add amber highlighting for Actual values that differ from Expected in `src/components/DetailedView/BillRow.svelte`
- [ ] T030 [US1] Add "View Details" navigation from Dashboard to Detailed View in `src/components/Dashboard/Dashboard.svelte`

**Checkpoint**: User Story 1 complete - bills display by category with tallies

---

## Phase 4: User Story 2 - Track Partial Payments (Priority: P1)

**Goal**: Allow multiple payments toward a bill with remaining balance display

**Independent Test**: Add multiple payments to a single bill, verify Paid/Expected display updates and remaining balance shows correctly

### Backend Implementation

- [ ] T031 [US2] Create POST /api/months/:month/bills/:id/payments handler in `api/src/routes/handlers/payments.handlers.ts`
- [ ] T032 [US2] Create DELETE /api/months/:month/bills/:id/payments/:paymentId handler in `api/src/routes/handlers/payments.handlers.ts`
- [ ] T033 [US2] Create PUT /api/months/:month/bills/:id/payments/:paymentId handler in `api/src/routes/handlers/payments.handlers.ts`
- [ ] T034 [US2] Implement payments-service.ts (addPayment, removePayment, updatePayment) in `api/src/services/payments-service.ts`
- [ ] T035 [US2] Register payment routes in `api/src/routes/index.ts`
- [ ] T036 [US2] Test with curl: add payment, verify response includes updated billInstance

### Frontend Implementation

- [ ] T037 [P] [US2] Create PartialPaymentInput.svelte (Paid / Expected format + Add Payment button) in `src/components/DetailedView/PartialPaymentInput.svelte`
- [ ] T038 [P] [US2] Create AddPaymentModal.svelte (amount + date input drawer) in `src/components/DetailedView/AddPaymentModal.svelte`
- [ ] T039 [US2] Create payments store for partial payment operations in `src/stores/payments.ts`
- [ ] T040 [US2] Integrate PartialPaymentInput into BillRow.svelte in `src/components/DetailedView/BillRow.svelte`
- [ ] T041 [US2] Add partial indicator (half-filled circle) for partially paid bills in `src/components/DetailedView/BillRow.svelte`

**Checkpoint**: User Story 2 complete - partial payments tracked with remaining balance

---

## Phase 5: User Story 3 - Track Due Dates with Overdue Indicators (Priority: P1)

**Goal**: Display due dates and show warning indicators for overdue unpaid bills

**Independent Test**: Set due dates on bills, verify overdue indicators appear for past-due unpaid items with tooltip

### Backend Implementation

- [ ] T042 [US3] Update bills-service.ts to handle due_day field in create/update in `api/src/services/bills-service.ts`
- [ ] T043 [US3] Update incomes-service.ts to handle due_day field in create/update in `api/src/services/incomes-service.ts`
- [ ] T044 [US3] Enhance detailed-view-service.ts to calculate is_overdue and days_overdue in `api/src/services/detailed-view-service.ts`
- [ ] T045 [US3] Test with curl: verify overdue fields in detailed response

### Frontend Implementation

- [ ] T046 [P] [US3] Add due date column to BillRow.svelte with "Mon DD" format in `src/components/DetailedView/BillRow.svelte`
- [ ] T047 [P] [US3] Create OverdueIndicator.svelte (warning icon + tooltip) in `src/components/DetailedView/OverdueIndicator.svelte`
- [ ] T048 [US3] Integrate OverdueIndicator into BillRow when is_overdue=true in `src/components/DetailedView/BillRow.svelte`
- [ ] T049 [US3] Add due_day input to BillForm.svelte in Setup in `src/components/Setup/BillForm.svelte`
- [ ] T050 [US3] Add due_day input to IncomeForm.svelte in Setup in `src/components/Setup/IncomeForm.svelte`

**Checkpoint**: User Story 3 complete - due dates visible with overdue warnings

---

## Phase 6: User Story 4 - Add Ad-hoc Bills and Income (Priority: P1)

**Goal**: Create one-time bills/income with optional conversion to regular

**Independent Test**: Add ad-hoc expense, verify it appears only in current month and is included in tallies

### Backend Implementation

- [ ] T051 [US4] Create POST /api/months/:month/adhoc/bills handler in `api/src/routes/handlers/adhoc.handlers.ts`
- [ ] T052 [US4] Create POST /api/months/:month/adhoc/incomes handler in `api/src/routes/handlers/adhoc.handlers.ts`
- [ ] T053 [US4] Create PUT /api/months/:month/adhoc/bills/:id handler in `api/src/routes/handlers/adhoc.handlers.ts`
- [ ] T054 [US4] Create DELETE /api/months/:month/adhoc/bills/:id handler in `api/src/routes/handlers/adhoc.handlers.ts`
- [ ] T055 [US4] Create POST /api/months/:month/adhoc/bills/:id/make-regular handler in `api/src/routes/handlers/adhoc.handlers.ts`
- [ ] T056 [US4] Implement adhoc-service.ts (createAdhocBill, createAdhocIncome, makeRegular) in `api/src/services/adhoc-service.ts`
- [ ] T057 [US4] Register ad-hoc routes in `api/src/routes/index.ts`
- [ ] T058 [US4] Test with curl: create ad-hoc, verify in detailed response

### Frontend Implementation

- [ ] T059 [P] [US4] Create AdHocForm.svelte (name, amount, category, payment source) in `src/components/DetailedView/AdHocForm.svelte`
- [ ] T060 [P] [US4] Create MakeRegularDrawer.svelte (pre-filled form to convert ad-hoc) in `src/components/DetailedView/MakeRegularDrawer.svelte`
- [ ] T061 [US4] Add "+ Add Ad-hoc Bill" button to AD-HOC category section in `src/components/DetailedView/CategorySection.svelte`
- [ ] T062 [US4] Add "+ Add Ad-hoc Income" button to income AD-HOC section in `src/components/DetailedView/CategorySection.svelte`
- [ ] T063 [US4] Add "Make Regular?" link on ad-hoc items in BillRow.svelte in `src/components/DetailedView/BillRow.svelte`

**Checkpoint**: User Story 4 complete - ad-hoc items work with make-regular flow

---

## Phase 7: User Story 5 - View Section Tallies (Priority: P1)

**Goal**: Display Expected/Actual/Remaining totals at bottom of each section

**Independent Test**: Enter various amounts, verify tallies calculate correctly and update immediately

### Implementation

- [ ] T064 [US5] Integrate SectionTally into Bills section of DetailedMonthView in `src/components/DetailedView/DetailedMonthView.svelte`
- [ ] T065 [US5] Integrate SectionTally into Income section of DetailedMonthView in `src/components/DetailedView/DetailedMonthView.svelte`
- [ ] T066 [US5] Add variable expenses tally row (Actual only) in `src/components/DetailedView/DetailedMonthView.svelte`
- [ ] T067 [US5] Add reactive updates to tallies when values change in `src/stores/detailed-month.ts`
- [ ] T068 [US5] Add Total Expenses summary row combining all expense types in `src/components/DetailedView/DetailedMonthView.svelte`

**Checkpoint**: User Story 5 complete - section tallies display and update reactively

---

## Phase 8: User Story 6 - Leftover Calculation Uses Actuals Only (Priority: P1)

**Goal**: Calculate leftover using only actual amounts entered

**Independent Test**: Enter actual amounts different from expected, verify leftover uses actuals

### Implementation

- [ ] T069 [P] [US6] Create SummaryFooter.svelte (leftover display with breakdown) in `src/components/DetailedView/SummaryFooter.svelte`
- [ ] T070 [US6] Implement leftover calculation in detailed-month store using actuals only in `src/stores/detailed-month.ts`
- [ ] T071 [US6] Display formula breakdown: Actual Income + Bank Balances - Actual Expenses = Leftover in `src/components/DetailedView/SummaryFooter.svelte`
- [ ] T072 [US6] Integrate SummaryFooter at bottom of DetailedMonthView in `src/components/DetailedView/DetailedMonthView.svelte`
- [ ] T073 [US6] Add note when no actuals entered: "Enter actuals to see leftover" in `src/components/DetailedView/SummaryFooter.svelte`

**Checkpoint**: User Story 6 complete - leftover accurately reflects actuals only

---

## Phase 9: User Story 7 - Configure Category Order with Drag-and-Drop (Priority: P2)

**Goal**: Allow reordering categories via drag-and-drop in Setup

**Independent Test**: Reorder categories in Setup, verify new order appears in Detailed View

### Backend Implementation

- [ ] T074 [US7] Create PUT /api/categories/reorder handler in `api/src/routes/handlers/categories.handlers.ts`
- [ ] T075 [US7] Implement reorder logic in categories-service.ts in `api/src/services/categories-service.ts`
- [ ] T076 [US7] Register reorder route in `api/src/routes/index.ts`
- [ ] T077 [US7] Test with curl: reorder categories, verify sort_order updated

### Frontend Implementation

- [ ] T078 [P] [US7] Create CategoryOrderer.svelte (drag-and-drop list) using native HTML5 drag events in `src/components/Setup/CategoryOrderer.svelte`
- [ ] T079 [US7] Add Categories tab to Setup page with CategoryOrderer in `src/routes/setup/+page.svelte`
- [ ] T080 [US7] Separate bill categories and income categories in CategoryOrderer in `src/components/Setup/CategoryOrderer.svelte`
- [ ] T081 [US7] Connect CategoryOrderer to categories store for save in `src/stores/categories.ts`

**Checkpoint**: User Story 7 complete - drag-and-drop reordering works

---

## Phase 10: User Story 8 - Configure Category Colors (Priority: P2)

**Goal**: Allow custom color assignment per category

**Independent Test**: Change category color in Setup, verify color appears in Detailed View

### Frontend Implementation

- [ ] T082 [P] [US8] Create ColorPicker.svelte (preset swatches + hex input) in `src/components/Setup/ColorPicker.svelte`
- [ ] T083 [US8] Integrate ColorPicker into CategoryOrderer for each category in `src/components/Setup/CategoryOrderer.svelte`
- [ ] T084 [US8] Update PUT /api/categories/:id to save color changes in `api/src/routes/handlers/categories.handlers.ts`
- [ ] T085 [US8] Test color changes persist and display in Detailed View

**Checkpoint**: User Story 8 complete - category colors configurable

---

## Phase 11: User Story 9 - View Income by Category (Priority: P2)

**Goal**: Display income organized by categories with section tally

**Independent Test**: Add income sources with categories, verify grouped display with tallies

### Implementation

- [ ] T086 [P] [US9] Create IncomeRow.svelte (similar to BillRow but for income) in `src/components/DetailedView/IncomeRow.svelte`
- [ ] T087 [US9] Add income section with CategorySection grouping to DetailedMonthView in `src/components/DetailedView/DetailedMonthView.svelte`
- [ ] T088 [US9] Add category_id dropdown to IncomeForm in Setup in `src/components/Setup/IncomeForm.svelte`
- [ ] T089 [US9] Filter income categories (type='income') in dropdown in `src/components/Setup/IncomeForm.svelte`
- [ ] T090 [US9] Add income category ordering support to CategoryOrderer in `src/components/Setup/CategoryOrderer.svelte`

**Checkpoint**: User Story 9 complete - income displays by category with tallies

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T091 [P] Add loading states to DetailedMonthView in `src/components/DetailedView/DetailedMonthView.svelte`
- [ ] T092 [P] Add error handling with toast notifications in `src/stores/toast.ts`
- [ ] T093 [P] Add keyboard navigation (Tab, Enter to edit) to rows in `src/components/DetailedView/BillRow.svelte`
- [ ] T094 Add month navigation (prev/next arrows) to DetailedMonthView in `src/components/DetailedView/DetailedMonthView.svelte`
- [ ] T095 [P] Add "Back to Dashboard" link in DetailedMonthView header in `src/components/DetailedView/DetailedMonthView.svelte`
- [ ] T096 Add compact spacing CSS for minimal vertical whitespace in `src/components/DetailedView/DetailedMonthView.svelte`
- [ ] T097 Ensure empty categories are hidden (no items = no header) in `src/components/DetailedView/CategorySection.svelte`
- [ ] T098 Run quickstart.md validation: navigate to /month/2025-01, verify all features work
- [ ] T099 [P] Code cleanup: remove any console.log statements from production code
- [ ] T100 Final build test: `npm run build` and verify bundle < 10MB

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-11)**: All depend on Foundational phase completion
  - P1 stories (US1-US6) should be completed first
  - P2 stories (US7-US9) can follow or be done in parallel if resources allow
- **Polish (Phase 12)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - Foundation for all other stories
- **User Story 2 (P1)**: Depends on US1 (needs BillRow component)
- **User Story 3 (P1)**: Depends on US1 (needs BillRow component)
- **User Story 4 (P1)**: Depends on US1 (needs CategorySection component)
- **User Story 5 (P1)**: Depends on US1 (needs section layout)
- **User Story 6 (P1)**: Depends on US5 (needs tallies to calculate leftover)
- **User Story 7 (P2)**: Can start after Foundational - Independent Setup feature
- **User Story 8 (P2)**: Depends on US7 (needs CategoryOrderer component)
- **User Story 9 (P2)**: Depends on US1 (needs CategorySection component)

### Within Each User Story

- Backend before frontend
- Services before handlers
- Handlers before route registration
- Components before page integration
- Test with curl before UI testing

### Parallel Opportunities

- All Phase 1 tasks (T001-T008) can run in parallel
- Phase 2 tasks T010, T011, T013, T014, T016, T017 can run in parallel
- Within each user story, components marked [P] can be built in parallel
- US7 (category ordering) can run in parallel with P1 stories

---

## Parallel Example: User Story 1

```bash
# After T021 completes (route registered), launch frontend tasks in parallel:
Task: "Create DetailedMonthView.svelte in src/components/DetailedView/"
Task: "Create CategorySection.svelte in src/components/DetailedView/"
Task: "Create BillRow.svelte in src/components/DetailedView/"
Task: "Create SectionTally.svelte in src/components/DetailedView/"
```

---

## Implementation Strategy

### MVP First (User Stories 1-6 Only)

1. Complete Phase 1: Setup (types)
2. Complete Phase 2: Foundational (services, migrations)
3. Complete Phase 3-8: User Stories 1-6 (all P1 stories)
4. **STOP and VALIDATE**: Test Detailed View with categories, partial payments, due dates, ad-hoc, tallies, leftover
5. Deploy/demo if ready - this is functional MVP

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready
2. Add User Story 1 -> Test independently -> Core view works (MVP-1!)
3. Add User Story 2 -> Partial payments work
4. Add User Story 3 -> Due dates with overdue indicators
5. Add User Story 4 -> Ad-hoc items
6. Add User Story 5 -> Section tallies (MVP-2!)
7. Add User Story 6 -> Leftover calculation (Full P1 MVP!)
8. Add User Stories 7-9 -> P2 enhancements
9. Polish phase -> Production ready

### Suggested Execution Order

**Day 1**: Phase 1 + Phase 2 (types, services, migrations)
**Day 2**: User Story 1 (core category view)
**Day 3**: User Stories 2-3 (partial payments, due dates)
**Day 4**: User Stories 4-6 (ad-hoc, tallies, leftover)
**Day 5**: User Stories 7-9 (category config, income categories)
**Day 6**: Polish phase

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Test backend with curl before building frontend
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
