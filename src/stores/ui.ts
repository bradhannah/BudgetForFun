// UI Store - Manages UI state including current month selection

import { writable, derived } from 'svelte/store';

// Get current month in YYYY-MM format
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// Get previous month
function getPreviousMonth(month: string): string {
  const [year, m] = month.split('-').map(Number);
  if (m === 1) {
    return `${year - 1}-12`;
  }
  return `${year}-${String(m - 1).padStart(2, '0')}`;
}

// Get next month
function getNextMonth(month: string): string {
  const [year, m] = month.split('-').map(Number);
  if (m === 12) {
    return `${year + 1}-01`;
  }
  return `${year}-${String(m + 1).padStart(2, '0')}`;
}

// Format month for display (e.g., "January 2025")
function formatMonthDisplay(month: string): string {
  const [year, m] = month.split('-').map(Number);
  const date = new Date(year, m - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// Current month store
export const currentMonth = writable<string>(getCurrentMonth());

// Derived store for display format
export const currentMonthDisplay = derived(currentMonth, ($currentMonth) => 
  formatMonthDisplay($currentMonth)
);

// Navigation actions
export function goToPreviousMonth() {
  currentMonth.update(m => getPreviousMonth(m));
}

export function goToNextMonth() {
  currentMonth.update(m => getNextMonth(m));
}

export function goToMonth(month: string) {
  currentMonth.set(month);
}

export function goToCurrentMonth() {
  currentMonth.set(getCurrentMonth());
}

// Wide mode store with localStorage persistence
function getStoredWideMode(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem('budgetforfun-wide-mode');
  return stored === 'true';
}

function createWideModeStore() {
  const { subscribe, set, update } = writable<boolean>(false);
  
  // Initialize from localStorage on client side
  if (typeof window !== 'undefined') {
    set(getStoredWideMode());
  }
  
  return {
    subscribe,
    toggle: () => {
      update(current => {
        const newValue = !current;
        if (typeof window !== 'undefined') {
          localStorage.setItem('budgetforfun-wide-mode', String(newValue));
        }
        return newValue;
      });
    },
    set: (value: boolean) => {
      set(value);
      if (typeof window !== 'undefined') {
        localStorage.setItem('budgetforfun-wide-mode', String(value));
      }
    }
  };
}

export const wideMode = createWideModeStore();

// UI state store for sidebar, drawers, etc.
interface UIState {
  sidebarOpen: boolean;
  drawerOpen: boolean;
  drawerContent: 'none' | 'edit-bill' | 'edit-income' | 'edit-expense';
  editingId: string | null;
}

const initialUIState: UIState = {
  sidebarOpen: true,
  drawerOpen: false,
  drawerContent: 'none',
  editingId: null
};

export const uiState = writable<UIState>(initialUIState);

export function toggleSidebar() {
  uiState.update(state => ({ ...state, sidebarOpen: !state.sidebarOpen }));
}

export function openDrawer(content: UIState['drawerContent'], id?: string) {
  uiState.update(state => ({
    ...state,
    drawerOpen: true,
    drawerContent: content,
    editingId: id || null
  }));
}

export function closeDrawer() {
  uiState.update(state => ({
    ...state,
    drawerOpen: false,
    drawerContent: 'none',
    editingId: null
  }));
}
