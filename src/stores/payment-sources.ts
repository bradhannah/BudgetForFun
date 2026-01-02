import { writable, derived } from 'svelte/store';
import { apiClient } from '$lib/api/client';

export interface PaymentSource {
  id: string;
  name: string;
  type: 'bank_account' | 'credit_card' | 'cash';
  balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentSourceData {
  name: string;
  type: 'bank_account' | 'credit_card' | 'cash';
  balance: number;
}

type PaymentSourceState = {
  paymentSources: PaymentSource[];
  loading: boolean;
  error: string | null;
};

const initialState: PaymentSourceState = {
  paymentSources: [],
  loading: false,
  error: null
};

const store = writable<PaymentSourceState>(initialState);

export const paymentSources = derived(store, s => s.paymentSources);
export const loading = derived(store, s => s.loading);
export const error = derived(store, s => s.error);
export const bankAccounts = derived(paymentSources, ps => 
  ps.filter(p => p.type === 'bank_account')
);
export const creditCards = derived(paymentSources, ps => 
  ps.filter(p => p.type === 'credit_card')
);
export const cashSources = derived(paymentSources, ps => 
  ps.filter(p => p.type === 'cash')
);

export async function loadPaymentSources() {
  store.update(s => ({ ...s, loading: true, error: null }));
  
  try {
    const data = await apiClient.get('/api/payment-sources');
    const paymentSources = (data || []) as PaymentSource[];
    store.update(s => ({ ...s, paymentSources, loading: false }));
  } catch (e) {
    const err = e instanceof Error ? e : new Error('Failed to load payment sources');
    store.update(s => ({ ...s, loading: false, error: err.message }));
    throw err;
  }
}

export async function createPaymentSource(data: PaymentSourceData) {
  store.update(s => ({ ...s, loading: true, error: null }));
  
  try {
    await apiClient.post('/api/payment-sources', data);
    await loadPaymentSources();
  } catch (e) {
    const err = e instanceof Error ? e : new Error('Failed to create payment source');
    store.update(s => ({ ...s, loading: false, error: err.message }));
    throw err;
  }
}

export async function updatePaymentSource(id: string, updates: Partial<PaymentSourceData>) {
  store.update(s => ({ ...s, loading: true, error: null }));
  
  try {
    await apiClient.put('/api/payment-sources', id, updates);
    await loadPaymentSources();
  } catch (e) {
    const err = e instanceof Error ? e : new Error('Failed to update payment source');
    store.update(s => ({ ...s, loading: false, error: err.message }));
    throw err;
  }
}

export async function deletePaymentSource(id: string) {
  store.update(s => ({ ...s, loading: true, error: null }));
  
  try {
    await apiClient.delete('/api/payment-sources', id);
    await loadPaymentSources();
  } catch (e) {
    const err = e instanceof Error ? e : new Error('Failed to delete payment source');
    store.update(s => ({ ...s, loading: false, error: err.message }));
    throw err;
  }
}

export function clearError() {
  store.update(s => ({ ...s, error: null }));
}

export const paymentSourcesStore = store;
