// Insurance Providers Store
// Manages insurance provider entities for claims (healthcare/service providers)

import { writable, derived } from 'svelte/store';
import { apiClient } from '$lib/api/client';
import type { InsuranceProvider } from '../types/insurance';

type InsuranceProvidersState = {
  providers: InsuranceProvider[];
  loading: boolean;
  error: string | null;
};

const initialState: InsuranceProvidersState = {
  providers: [],
  loading: false,
  error: null,
};

const store = writable<InsuranceProvidersState>(initialState);

// Derived stores
export const insuranceProviders = derived(store, (s) => s.providers);
export const insuranceProvidersLoading = derived(store, (s) => s.loading);
export const insuranceProvidersError = derived(store, (s) => s.error);

// Active providers only (sorted by name)
export const activeProviders = derived(insuranceProviders, (providers) =>
  providers.filter((p) => p.is_active).sort((a, b) => a.name.localeCompare(b.name))
);

// Inactive providers
export const inactiveProviders = derived(insuranceProviders, (providers) =>
  providers.filter((p) => !p.is_active)
);

// Create data type
export interface InsuranceProviderData {
  name: string;
  description?: string;
  category_ids: string[];
}

export async function loadInsuranceProviders() {
  store.update((s) => ({ ...s, loading: true, error: null }));

  try {
    const data = await apiClient.get('/api/insurance-providers');
    const providers = (data || []) as InsuranceProvider[];
    store.update((s) => ({ ...s, providers, loading: false }));
  } catch (e) {
    const err = e instanceof Error ? e : new Error('Failed to load insurance providers');
    store.update((s) => ({ ...s, loading: false, error: err.message }));
    throw err;
  }
}

export async function createInsuranceProvider(data: InsuranceProviderData) {
  store.update((s) => ({ ...s, loading: true, error: null }));

  try {
    const newProvider = await apiClient.post('/api/insurance-providers', data);
    await loadInsuranceProviders();
    return newProvider as InsuranceProvider;
  } catch (e) {
    const err = e instanceof Error ? e : new Error('Failed to create insurance provider');
    store.update((s) => ({ ...s, loading: false, error: err.message }));
    throw err;
  }
}

export async function updateInsuranceProvider(
  id: string,
  updates: Partial<InsuranceProviderData> & { is_active?: boolean }
) {
  store.update((s) => ({ ...s, loading: true, error: null }));

  try {
    const updated = await apiClient.put('/api/insurance-providers', id, updates);
    await loadInsuranceProviders();
    return updated as InsuranceProvider;
  } catch (e) {
    const err = e instanceof Error ? e : new Error('Failed to update insurance provider');
    store.update((s) => ({ ...s, loading: false, error: err.message }));
    throw err;
  }
}

export async function deleteInsuranceProvider(id: string) {
  store.update((s) => ({ ...s, loading: true, error: null }));

  try {
    await apiClient.delete('/api/insurance-providers', id);
    await loadInsuranceProviders();
  } catch (e) {
    const err = e instanceof Error ? e : new Error('Failed to delete insurance provider');
    store.update((s) => ({ ...s, loading: false, error: err.message }));
    throw err;
  }
}

export function clearInsuranceProvidersError() {
  store.update((s) => ({ ...s, error: null }));
}

// Get provider by ID (synchronous lookup from store)
export function getProviderById(id: string): InsuranceProvider | undefined {
  let result: InsuranceProvider | undefined;
  store.subscribe((s) => {
    result = s.providers.find((p) => p.id === id);
  })();
  return result;
}

export const insuranceProvidersStore = store;
