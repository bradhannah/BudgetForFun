/**
 * Settings Store - Manages app settings with Tauri Store plugin
 * 
 * In Tauri (production): Uses tauri-plugin-store for persistent storage
 * In browser (development): Uses localStorage fallback
 */

import { writable, derived } from 'svelte/store';
import { apiClient } from '$lib/api/client';
import { isTauri as checkIsTauri } from '@tauri-apps/api/core';

// ============================================================================
// Zoom Settings - Native Tauri WebView Zoom
// ============================================================================

// Zoom configuration
export const ZOOM_CONFIG = {
  min: 0.5,      // 50%
  max: 2.0,      // 200%
  step: 0.1,     // 10% per increment
  default: 1.0   // 100%
};

// Preset zoom levels for UI buttons (kept for backward compat with Settings page)
export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';

export const FONT_SIZE_LABELS: Record<FontSize, string> = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
  xlarge: 'X-Large'
};

export const FONT_SCALE_MAP: Record<FontSize, number> = {
  small: 0.85,    // 85% zoom
  medium: 1.0,    // 100% zoom (default)
  large: 1.15,    // 115% zoom
  xlarge: 1.30    // 130% zoom
};

// Zoom level store - stores the actual numeric zoom factor (0.5 to 2.0)
const zoomLevelWritable = writable<number>(ZOOM_CONFIG.default);
export const zoomLevel = derived(zoomLevelWritable, z => z);

// For backward compatibility - derive FontSize from zoom level
export const uiScale = derived(zoomLevelWritable, (z): FontSize => {
  if (z <= 0.85) return 'small';
  if (z <= 1.0) return 'medium';
  if (z <= 1.15) return 'large';
  return 'xlarge';
});

// Backward compat
export const uiScaleFactor = zoomLevel;

/**
 * Apply zoom to the Tauri webview (or no-op in browser)
 * This is the core function that actually sets the zoom level
 */
export async function applyZoom(level: number): Promise<void> {
  // Clamp to valid range
  const clampedLevel = Math.max(ZOOM_CONFIG.min, Math.min(ZOOM_CONFIG.max, level));
  
  if (isTauri()) {
    try {
      const { getCurrentWebview } = await import('@tauri-apps/api/webview');
      const webview = getCurrentWebview();
      await webview.setZoom(clampedLevel);
      console.log('[Settings] Zoom applied:', clampedLevel);
    } catch (e) {
      console.error('[Settings] Failed to apply zoom:', e);
    }
  } else {
    // Browser: let browser handle its own zoom, don't interfere
    console.log('[Settings] Browser mode - zoom not applied (use browser zoom)');
  }
}

/**
 * Load zoom setting from storage and apply it
 */
export async function loadZoom(): Promise<number> {
  let savedZoom = ZOOM_CONFIG.default;
  
  if (isTauri()) {
    try {
      const { Store } = await import('@tauri-apps/plugin-store');
      const store = await Store.load('settings.json');
      const value = await store.get('zoomLevel') as number | undefined;
      if (value !== undefined && value >= ZOOM_CONFIG.min && value <= ZOOM_CONFIG.max) {
        savedZoom = value;
      }
    } catch (e) {
      console.error('[Settings] Failed to load zoom from Tauri Store:', e);
    }
  } else {
    // Browser fallback - use localStorage
    const value = localStorage.getItem('budgetforfun_zoom');
    if (value) {
      const parsed = parseFloat(value);
      if (!isNaN(parsed) && parsed >= ZOOM_CONFIG.min && parsed <= ZOOM_CONFIG.max) {
        savedZoom = parsed;
      }
    }
  }
  
  zoomLevelWritable.set(savedZoom);
  await applyZoom(savedZoom);
  return savedZoom;
}

/**
 * Save zoom setting to storage
 */
async function saveZoom(level: number): Promise<void> {
  const clampedLevel = Math.max(ZOOM_CONFIG.min, Math.min(ZOOM_CONFIG.max, level));
  
  if (isTauri()) {
    try {
      const { Store } = await import('@tauri-apps/plugin-store');
      const store = await Store.load('settings.json');
      await store.set('zoomLevel', clampedLevel);
      await store.save();
    } catch (e) {
      console.error('[Settings] Failed to save zoom to Tauri Store:', e);
    }
  } else {
    // Browser fallback - use localStorage
    localStorage.setItem('budgetforfun_zoom', clampedLevel.toString());
  }
}

/**
 * Set zoom to a specific level
 */
export async function setZoom(level: number): Promise<void> {
  const clampedLevel = Math.max(ZOOM_CONFIG.min, Math.min(ZOOM_CONFIG.max, level));
  // Round to 2 decimal places to avoid floating point issues
  const roundedLevel = Math.round(clampedLevel * 100) / 100;
  
  zoomLevelWritable.set(roundedLevel);
  await applyZoom(roundedLevel);
  await saveZoom(roundedLevel);
}

/**
 * Zoom in by one step (10%)
 */
export async function zoomIn(): Promise<void> {
  let current = ZOOM_CONFIG.default;
  zoomLevelWritable.subscribe(v => current = v)();
  await setZoom(current + ZOOM_CONFIG.step);
}

/**
 * Zoom out by one step (10%)
 */
export async function zoomOut(): Promise<void> {
  let current = ZOOM_CONFIG.default;
  zoomLevelWritable.subscribe(v => current = v)();
  await setZoom(current - ZOOM_CONFIG.step);
}

/**
 * Reset zoom to 100%
 */
export async function resetZoom(): Promise<void> {
  await setZoom(ZOOM_CONFIG.default);
}

/**
 * Get current zoom level as percentage string (e.g., "100%")
 */
export function getZoomPercentage(level: number): string {
  return `${Math.round(level * 100)}%`;
}

// Backward compatibility aliases
export const loadUIScale = loadZoom;
export async function saveUIScale(size: FontSize): Promise<void> {
  const level = FONT_SCALE_MAP[size] || ZOOM_CONFIG.default;
  await setZoom(level);
}

// ============================================================================
// End Zoom Settings
// ============================================================================

/**
 * Check if running in Tauri environment
 * Uses the official Tauri API detection
 */
export function isTauri(): boolean {
  return checkIsTauri();
}

export interface AppSettings {
  dataDirectory: string;
  version: string;
}

export interface DataDirectoryInfo {
  path: string;
  entitiesDir: string;
  monthsDir: string;
  isDevelopment: boolean;
  isWritable: boolean;
}

export interface DirectoryValidation {
  isValid: boolean;
  exists: boolean;
  isWritable: boolean;
  hasExistingData: boolean;
  existingFiles: string[];
  error?: string;
}

export interface MigrationResult {
  success: boolean;
  entityFilesCopied: number;
  monthFilesCopied: number;
  filesCopied: string[];
  sourceDir: string;
  destDir: string;
  error?: string;
}

export type MigrationMode = 'copy' | 'fresh' | 'use_existing';

interface SettingsState {
  settings: AppSettings | null;
  dataDirectory: DataDirectoryInfo | null;
  loading: boolean;
  error: string | null;
  isDevelopment: boolean;
}

const initialState: SettingsState = {
  settings: null,
  dataDirectory: null,
  loading: false,
  error: null,
  isDevelopment: true
};

const store = writable<SettingsState>(initialState);

// Derived stores
export const settings = derived(store, s => s.settings);
export const dataDirectory = derived(store, s => s.dataDirectory);
export const loading = derived(store, s => s.loading);
export const error = derived(store, s => s.error);
export const isDevelopment = derived(store, s => s.isDevelopment);

/**
 * Load current settings from the API
 */
export async function loadSettings(): Promise<void> {
  store.update(s => ({ ...s, loading: true, error: null }));
  
  try {
    const [settingsData, dataDirData] = await Promise.all([
      apiClient.get('/api/settings') as Promise<AppSettings & { isDevelopment: boolean }>,
      apiClient.get('/api/settings/data-directory') as Promise<DataDirectoryInfo>
    ]);
    
    store.update(s => ({
      ...s,
      settings: {
        dataDirectory: settingsData.dataDirectory,
        version: settingsData.version
      },
      dataDirectory: dataDirData,
      isDevelopment: settingsData.isDevelopment,
      loading: false
    }));
  } catch (e) {
    const err = e instanceof Error ? e : new Error('Failed to load settings');
    store.update(s => ({ ...s, loading: false, error: err.message }));
    throw err;
  }
}

/**
 * Validate a directory for use as data storage
 */
export async function validateDirectory(path: string): Promise<DirectoryValidation> {
  const result = await apiClient.post('/api/settings/validate-directory', { path }) as DirectoryValidation;
  return result;
}

/**
 * Migrate data to a new directory
 */
export async function migrateData(
  sourceDir: string, 
  destDir: string, 
  mode: MigrationMode
): Promise<MigrationResult> {
  const result = await apiClient.post('/api/settings/migrate-data', {
    sourceDir,
    destDir,
    mode
  }) as MigrationResult;
  return result;
}

/**
 * Open native folder picker dialog (Tauri only)
 * Returns the selected path or null if cancelled
 */
export async function openFolderPicker(): Promise<string | null> {
  const inTauri = isTauri();
  console.log('[Settings] openFolderPicker called, isTauri:', inTauri);
  
  if (!inTauri) {
    // In browser dev mode, show a prompt
    console.log('[Settings] Not in Tauri, using prompt fallback');
    const path = prompt('Enter folder path (browser dev mode):', '~/Documents/BudgetForFun');
    return path;
  }
  
  try {
    console.log('[Settings] Importing @tauri-apps/plugin-dialog...');
    // Dynamic import for Tauri dialog
    const { open } = await import('@tauri-apps/plugin-dialog');
    console.log('[Settings] Calling dialog.open()...');
    const selected = await open({
      directory: true,
      multiple: false,
      title: 'Choose Data Directory'
    });
    console.log('[Settings] Dialog returned:', selected);
    
    return selected as string | null;
  } catch (e) {
    console.error('[Settings] Failed to open folder picker:', e);
    return null;
  }
}

/**
 * Get the default data directory path (Tauri only)
 */
export async function getDefaultDataDir(): Promise<string> {
  if (!isTauri()) {
    return '~/Documents/BudgetForFun';
  }
  
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke('get_default_data_dir');
  } catch (e) {
    console.error('Failed to get default data dir:', e);
    return '~/Documents/BudgetForFun';
  }
}

/**
 * Save data directory setting to Tauri Store (Tauri only)
 * This persists the setting so the app remembers on next launch
 */
export async function saveDataDirectorySetting(path: string): Promise<void> {
  if (!isTauri()) {
    // In browser dev mode, save to localStorage
    localStorage.setItem('budgetforfun_data_dir', path);
    return;
  }
  
  try {
    const { Store } = await import('@tauri-apps/plugin-store');
    const store = await Store.load('settings.json');
    await store.set('dataDirectory', path);
    await store.save();
  } catch (e) {
    console.error('Failed to save data directory setting:', e);
    throw e;
  }
}

/**
 * Get saved data directory from Tauri Store (Tauri only)
 */
export async function getSavedDataDirectory(): Promise<string | null> {
  if (!isTauri()) {
    return localStorage.getItem('budgetforfun_data_dir');
  }
  
  try {
    const { Store } = await import('@tauri-apps/plugin-store');
    const store = await Store.load('settings.json');
    const value = await store.get('dataDirectory') as string | undefined;
    return value || null;
  } catch (e) {
    console.error('Failed to get saved data directory:', e);
    return null;
  }
}

/**
 * Clear any errors
 */
export function clearError(): void {
  store.update(s => ({ ...s, error: null }));
}

/**
 * Update the data directory in the local store state
 * This updates the UI immediately without waiting for the API
 */
export function updateDataDirectoryLocally(newPath: string): void {
  console.log('[Settings Store] updateDataDirectoryLocally called with:', newPath);
  store.update(s => {
    const newState = {
      ...s,
      dataDirectory: {
        path: newPath,
        entitiesDir: `${newPath}/entities`,
        monthsDir: `${newPath}/months`,
        isDevelopment: false,
        isWritable: true
      },
      isDevelopment: false
    };
    console.log('[Settings Store] New dataDirectory state:', newState.dataDirectory);
    return newState;
  });
}

/**
 * Restart the Bun sidecar with a new data directory (Tauri only)
 * This stops the current sidecar and starts a new one with the new DATA_DIR
 */
export async function restartSidecar(newDataDir: string): Promise<void> {
  if (!isTauri()) {
    console.log('[Settings] Not in Tauri, cannot restart sidecar');
    return;
  }
  
  try {
    console.log('[Settings] Restarting sidecar with new data directory:', newDataDir);
    const { invoke } = await import('@tauri-apps/api/core');
    const result = await invoke('restart_bun_sidecar', { dataDir: newDataDir });
    console.log('[Settings] Sidecar restart result:', result);
  } catch (e) {
    console.error('[Settings] Failed to restart sidecar:', e);
    throw e;
  }
}

/**
 * Relaunch the entire app (Tauri only)
 * Used after data directory migration to ensure the sidecar starts with new settings
 */
export async function relaunchApp(): Promise<void> {
  if (!isTauri()) {
    console.log('[Settings] Not in Tauri, cannot relaunch app');
    // In browser, just reload the page
    window.location.reload();
    return;
  }
  
  try {
    console.log('[Settings] Relaunching app...');
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('relaunch_app');
  } catch (e) {
    console.error('[Settings] Failed to relaunch app:', e);
    throw e;
  }
}

export const settingsStore = store;
