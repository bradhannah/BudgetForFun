/**
 * Settings Store - Manages app settings with Tauri Store plugin
 * 
 * In Tauri (production): Uses tauri-plugin-store for persistent storage
 * In browser (development): Uses localStorage fallback
 */

import { writable, derived } from 'svelte/store';
import { apiClient } from '$lib/api/client';
import { isTauri as checkIsTauri } from '@tauri-apps/api/core';

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
