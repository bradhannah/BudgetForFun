// Variable Expense Templates Service - CRUD for variable expense templates

import { StorageServiceImpl } from './storage';
import type { StorageService } from './storage';
import type { 
  VariableExpenseTemplate, 
  VariableExpenseFrequency,
  ValidationResult 
} from '../types';

export interface VariableExpenseTemplatesService {
  getAll(): Promise<VariableExpenseTemplate[]>;
  getActive(): Promise<VariableExpenseTemplate[]>;
  getById(id: string): Promise<VariableExpenseTemplate | null>;
  create(data: Omit<VariableExpenseTemplate, 'id' | 'created_at' | 'updated_at' | 'is_active'>): Promise<VariableExpenseTemplate>;
  update(id: string, updates: Partial<Omit<VariableExpenseTemplate, 'id' | 'created_at' | 'updated_at'>>): Promise<VariableExpenseTemplate | null>;
  delete(id: string): Promise<void>;
  validate(data: Partial<VariableExpenseTemplate>): ValidationResult;
}

const STORAGE_PATH = 'data/entities/variable-expense-templates.json';

export class VariableExpenseTemplatesServiceImpl implements VariableExpenseTemplatesService {
  private storage: StorageService;
  
  constructor() {
    this.storage = StorageServiceImpl.getInstance();
  }
  
  public async getAll(): Promise<VariableExpenseTemplate[]> {
    try {
      const templates = await this.storage.readJSON<VariableExpenseTemplate[]>(STORAGE_PATH) || [];
      return templates;
    } catch (error) {
      console.error('[VariableExpenseTemplatesService] Failed to load templates:', error);
      return [];
    }
  }
  
  public async getActive(): Promise<VariableExpenseTemplate[]> {
    const templates = await this.getAll();
    return templates.filter(t => t.is_active);
  }
  
  public async getById(id: string): Promise<VariableExpenseTemplate | null> {
    try {
      const templates = await this.getAll();
      return templates.find(t => t.id === id) || null;
    } catch (error) {
      console.error('[VariableExpenseTemplatesService] Failed to get template:', error);
      return null;
    }
  }
  
  public async create(data: Omit<VariableExpenseTemplate, 'id' | 'created_at' | 'updated_at' | 'is_active'>): Promise<VariableExpenseTemplate> {
    try {
      const validation = this.validate(data);
      if (!validation.isValid) {
        throw new Error('Validation failed: ' + validation.errors.join(', '));
      }
      
      const templates = await this.getAll();
      
      const now = new Date().toISOString();
      
      const newTemplate: VariableExpenseTemplate = {
        ...data,
        id: generateId(),
        created_at: now,
        updated_at: now,
        is_active: true
      };
      
      templates.push(newTemplate);
      await this.storage.writeJSON(STORAGE_PATH, templates);
      console.log(`[VariableExpenseTemplatesService] Created template: ${newTemplate.name}`);
      return newTemplate;
    } catch (error) {
      console.error('[VariableExpenseTemplatesService] Failed to create template:', error);
      throw error;
    }
  }
  
  public async update(id: string, updates: Partial<Omit<VariableExpenseTemplate, 'id' | 'created_at' | 'updated_at'>>): Promise<VariableExpenseTemplate | null> {
    try {
      const templates = await this.getAll();
      const index = templates.findIndex(t => t.id === id);
      
      if (index === -1) {
        console.warn(`[VariableExpenseTemplatesService] Template ${id} not found`);
        return null;
      }
      
      const now = new Date().toISOString();
      const updatedTemplate: VariableExpenseTemplate = {
        ...templates[index],
        ...updates,
        updated_at: now
      };
      
      templates[index] = updatedTemplate;
      await this.storage.writeJSON(STORAGE_PATH, templates);
      console.log(`[VariableExpenseTemplatesService] Updated template: ${updatedTemplate.name}`);
      return updatedTemplate;
    } catch (error) {
      console.error('[VariableExpenseTemplatesService] Failed to update template:', error);
      throw error;
    }
  }
  
  public async delete(id: string): Promise<void> {
    try {
      const templates = await this.getAll();
      const filtered = templates.filter(t => t.id !== id);
      await this.storage.writeJSON(STORAGE_PATH, filtered);
      console.log(`[VariableExpenseTemplatesService] Deleted template: ${id}`);
    } catch (error) {
      console.error('[VariableExpenseTemplatesService] Failed to delete template:', error);
      throw error;
    }
  }
  
  public validate(data: Partial<VariableExpenseTemplate>): ValidationResult {
    const errors: string[] = [];
    
    // Name is required
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Name is required');
    } else if (data.name.length > 100) {
      errors.push('Name must be 100 characters or less');
    }
    
    // Frequency is required and must be valid
    const validFrequencies: VariableExpenseFrequency[] = ['weekly', 'biweekly', 'monthly', 'as_needed'];
    if (!data.frequency) {
      errors.push('Frequency is required');
    } else if (!validFrequencies.includes(data.frequency)) {
      errors.push('Frequency must be one of: weekly, biweekly, monthly, as_needed');
    }
    
    // Estimated amount must be non-negative if provided
    if (data.estimated_amount !== undefined && data.estimated_amount < 0) {
      errors.push('Estimated amount cannot be negative');
    }
    
    // Notes length check
    if (data.notes && data.notes.length > 500) {
      errors.push('Notes must be 500 characters or less');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

function generateId(): string {
  return `xxxxxxxx-xxxx-4xxx-yxxx`.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Singleton instance
export const variableExpenseTemplatesService = new VariableExpenseTemplatesServiceImpl();
