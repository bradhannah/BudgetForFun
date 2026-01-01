// Variable Expense Templates Store
import { writable, derived } from 'svelte/store';
import { apiClient } from '../lib/api/client';

export type VariableExpenseFrequency = 'weekly' | 'biweekly' | 'monthly' | 'as_needed';

export interface VariableExpenseTemplate {
  id: string;
  name: string;
  category_id?: string;
  payment_source_id?: string;
  estimated_amount?: number;
  frequency: VariableExpenseFrequency;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface VariableExpenseTemplatesState {
  templates: VariableExpenseTemplate[];
  loading: boolean;
  error: string | null;
}

const initialState: VariableExpenseTemplatesState = {
  templates: [],
  loading: false,
  error: null
};

function createVariableExpenseTemplatesStore() {
  const { subscribe, set, update } = writable<VariableExpenseTemplatesState>(initialState);

  return {
    subscribe,
    
    async load() {
      update(s => ({ ...s, loading: true, error: null }));
      try {
        const templates = await apiClient.get('/api/variable-expense-templates') as VariableExpenseTemplate[];
        update(s => ({ ...s, templates, loading: false }));
      } catch (e) {
        const error = e instanceof Error ? e.message : 'Failed to load templates';
        update(s => ({ ...s, error, loading: false }));
      }
    },

    async create(template: Omit<VariableExpenseTemplate, 'id' | 'created_at' | 'updated_at'>) {
      const result = await apiClient.post('/api/variable-expense-templates', template);
      update(s => ({ ...s, templates: [...s.templates, result] }));
      return result;
    },

    async update(id: string, updates: Partial<VariableExpenseTemplate>) {
      const result = await apiClient.put('/api/variable-expense-templates', id, updates);
      update(s => ({
        ...s,
        templates: s.templates.map(t => t.id === id ? result : t)
      }));
      return result;
    },

    async delete(id: string) {
      await apiClient.delete('/api/variable-expense-templates', id);
      update(s => ({
        ...s,
        templates: s.templates.filter(t => t.id !== id)
      }));
    }
  };
}

export const variableExpenseTemplatesStore = createVariableExpenseTemplatesStore();

// Derived stores
export const activeTemplates = derived(
  variableExpenseTemplatesStore,
  $store => $store.templates.filter(t => t.is_active)
);

export const templatesByFrequency = derived(
  variableExpenseTemplatesStore,
  $store => {
    const grouped: Record<VariableExpenseFrequency, VariableExpenseTemplate[]> = {
      weekly: [],
      biweekly: [],
      monthly: [],
      as_needed: []
    };
    for (const t of $store.templates) {
      grouped[t.frequency].push(t);
    }
    return grouped;
  }
);
